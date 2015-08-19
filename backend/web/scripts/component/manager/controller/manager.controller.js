'use strict';

var _ = require('lodash');
var moment = require('moment');

ManagerController.$inject = ['$scope', '$state', '$timeout', 'ngDialog', 'toastr', 'localStorage', 'dataStorage', 'socket', 'CONSTANTS'];

function ManagerController($scope, $state, $timeout, ngDialog, toastr, localStorage, dataStorage, socket, CONSTANTS) {

	$scope.bathhouse = {};
	$scope.rooms = [];
	$scope.orders = [];

	$scope.newOrder = {}; // object to the order received through a socket

	$scope.historyIsActive = false;

	$scope.user = _.pick(localStorage.getData(), ['fullName', 'organizationName']);

	dataStorage.loadBathhouse().then(function(data) {

		$scope.bathhouse = data;

		dataStorage.loadRooms().then(function(rooms) {

			$scope.rooms = rooms;

			_.forEach(rooms, function(room) {

				room.orders = {};
				room.services = [];

				dataStorage.loadOrders(room.id, moment().format(CONSTANTS.format)).then(function(orders) {

					room.orders = orders;
				});
			});
		});
	});

	$scope.getOrders = getOrders;

	$scope.showOrder = showOrder;
	$scope.createOrder = createOrder;
	$scope.updateOrder = updateOrder;

	$scope.logout = logout;

	var updatedOrder = {};

	function showOrder(roomId, orderId, callback) {

		var room = _.find($scope.rooms, {id: roomId});
		var orders = _.where(_.flatten(_.toArray(room.orders)), {id: parseInt(orderId)}); // maybe 2days order

		var order = _.assign(orders[0], {
			endDate: orders.length > 1 ? orders[1].endDate : orders[0].endDate,
			endPeriod: orders.length > 1 ? orders[1].endPeriod : orders[0].endPeriod
		});

		ngDialog.open({
			template: order.createdByManager ? templates.showManagerOrder : templates.showServiceOrder,
			scope: $scope,
			controller: ['$scope', function($scope) {

				$scope.order = order;

				$scope.removeOrder = function() {

					dataStorage.removeOrder(order.id).then(function(response) {

						if (response.status === 204) {

							toastr.success(toastrText.remove.success);

							var data = _.pick($scope.order, ['startDate', 'endDate', 'startPeriod', 'endPeriod', 'oneDay']);

							//TODO: check this
							_.remove(_.flatten(_.toArray(room.orders)), {id: parseInt(orderId)});

							callback({status: 'success', action: 'remove', result: data});
						}
						else {

							toastr.error(toastrText.remove.error);
						}
					});

					ngDialog.close();
				};

				$scope.updateOrder = function(type) {

					updatedOrder = order;

					if (type === 'schedule') {

						ngDialog.close();

						callback({status: 'success', action: 'update', result: _.pick($scope.order, ['startDate', 'endDate', 'startPeriod', 'endPeriod', 'oneDay'])});
					}
					else {

						$scope.$parent.updateOrder(order);
					}
				};
			}]
		});
	}

	function createOrder(order, callback) {

		var room = _.find($scope.rooms, {id: order.roomId});

		ngDialog.open({
			template: templates.createOrder,
			scope: $scope,
			controller: ['$scope', function($scope) {

				$scope.order = _.assign(order, {
					costPeriod: dataStorage.calculateOrderOfPeriods(room.prices, _.omit(order, ['roomId'])),
					costServices: 0,
					costGuests: 0,
					total: 0,
					comment: '',
					services: []
				});

				$scope.$watchGroup(['order.costPeriod', 'order.costServices', 'order.costGuests'], function(values) {

					$scope.order.total = _.sum(values);
				});

				$scope.cancelOrder = function() {

					ngDialog.close();

					callback({status: 'canceled'});
				};

				$scope.saveOrder = function() {

					dataStorage.createOrder($scope.order)
						.then(function(response) {

							// created
							if (response.status === 201) {

								var properties = response.data;

								if (properties.oneDay) {

									room.orders[properties.startDate].push(properties);
								}
								else {

									room.orders[properties.startDate].push(_.assign(properties, {
										endDate: properties.startDate,
										endPeriod: _.last(_.keys(CONSTANTS.periods))
									}));

									room.orders[properties.endDate].push(_.assign(properties, {
										startDate: properties.endDate,
										startPeriod: _.first(_.keys(CONSTANTS.periods))
									}));
								}

								toastr.success(toastrText.create.success);

								callback({status: 'success', result: response.data});
							}
							else {

								toastr.error(toastrText.create.error);

								callback({status: 'error', result: null});
							}

							ngDialog.close();
						})
						.catch(function () {

							ngDialog.close();

							toastr.error(toastrText.create.error);

							callback({status: 'error', result: null});
						});
				};

				$scope.selectServices = function(services) {

					$timeout(function() {
						$scope.order.services = services;
						$scope.order.costServices = dataStorage.calculateOrderOfServices($scope.bathhouse.services, services);
					}, 0);
				};

				$scope.selectGuests = function(count) {

					//$scope.order.costGuests = dataStorage.calculateOrderOfGuests(count);
				};
			}]
		});
	}

	function updateOrder(order, callback) {

		callback = _.isFunction(callback) ? callback : function() {};

		var room = _.find($scope.rooms, {id: order.roomId});

		ngDialog.open({
			template: templates.updateManagerOrder,
			scope: $scope,
			controller: ['$scope', function($scope) {

				$scope.order = _.assign(updatedOrder, order);
				$scope.order.costPeriod = dataStorage.calculateOrderOfPeriods(room.prices, _.omit(order, ['roomId']));

				console.log(updatedOrder);
				console.log(order);
				console.log($scope.order);

				$scope.close = function() {

					ngDialog.close();

					callback({status: 'canceled'});
				};

				$scope.updateOrder = function() {

					dataStorage.updateOrder($scope.order)
						.then(function(response) {

							if (response.status === 201) {

								toastr.success(toastrText.update.success);

								updatedOrder = {};

								ngDialog.closeAll();

								//TODO: add update for order for this room

								callback({status: 'success', result: $scope.order});
							}
							else {

								toastr.error(toastrText.update.error);

								updatedOrder = {};

								ngDialog.closeAll();

								callback({status: 'error', result: null});
							}
						})
						.catch(function(response) {

							toastr.error(toastrText.update.error);

							updatedOrder = {};

							ngDialog.closeAll();

							callback({status: 'error', result: null});
						});
				};

				$scope.$watchGroup(['order.costPeriod', 'order.costServices', 'order.costGuests'], function(values) {

					$scope.order.total = _.sum(values);
				});

				$scope.selectServices = function(services) {

					$timeout(function() {
						$scope.order.services = services;
						$scope.order.costServices = dataStorage.calculateOrderOfServices($scope.bathhouse.services, services);
					}, 0);
				};

				$scope.selectGuests = function(count) {

					//$scope.order.costGuests = dataStorage.calculateOrderOfGuests(count);
				};
			}]
		});
	}

	function getOrders(roomId, startDate, endDate) {

		endDate = endDate || moment(startDate).add(1, 'days').format(CONSTANTS.format);

		dataStorage.loadOrders(roomId, startDate, endDate).then(function(orders) {

			var room = _.find($scope.rooms, {id: roomId});

			room.orders = _.assign(room.orders, orders);
		});
	}

	function logout() {

		localStorage.setToken();
		localStorage.setData();

		$state.go('login');
	}


	var templates = {
		createOrder: 'templates/partials/createOrder.html',
		showManagerOrder: 'templates/partials/showManagerOrder.html',
		showServiceOrder: 'templates/partials/showServiceOrder.html',
		updateManagerOrder: 'templates/partials/updateManagerOrder.html'
	};

	var toastrText = {
		create: {
			success: 'Заказ успешно создан',
			error: 'Неудачное создание заказа'
		},
		update: {
			success: 'Заказ успешно обновлен',
			error: 'Неудачное изменение заказа'
		},
		remove: {
			success: 'Заказ успешно удален',
			error: 'Неудачное удаление заказа'
		}
	};


	socket.emit('manager:init', localStorage.getData());
}

module.exports = ManagerController;