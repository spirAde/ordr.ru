'use strict';

var _ = require('lodash');
var moment = require('moment');

ManagerController.$inject = ['$scope', '$state', '$timeout', 'ngDialog', 'localStorage', 'dataStorage', 'CONSTANTS'];

function ManagerController($scope, $state, $timeout, ngDialog, localStorage, dataStorage, CONSTANTS) {

	$scope.bathhouse = {};
	$scope.rooms = [];
	$scope.orders = [];

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

	$scope.logout = logout;


	function showOrder(roomId, orderId, callback) {

		var room = _.find($scope.rooms, {id: roomId});
		var orders = _.where(_.flatten(_.toArray(room.orders)), {id: parseInt(orderId)}); // maybe 2days order

		ngDialog.open({
			template: orders[0].throughService ? templates.showServiceOrder : templates.showManagerOrder,
			scope: $scope,
			controller: ['$scope', function($scope) {

				$scope.order = _.assign(orders[0], {
					startTime: CONSTANTS.periods[orders[0].startPeriod],
					endDate: orders.length > 1 ? orders[1].endDate : orders[0].endDate,
					endPeriod: orders.length > 1 ? orders[1].endPeriod : orders[0].endPeriod,
					endTime: orders.length > 1 ? CONSTANTS.periods[orders[1].endPeriod] : CONSTANTS.periods[orders[0].endPeriod]
				});

				$scope.cancelOrder = function() {
					ngDialog.close();
				};

				$scope.removeOrder = function() {

					dataStorage.removeOrder(orders[0].id).then(function(response) {

						if (response.result === 'success') {

							callback({status: 'success', result: _.pick($scope.order, ['startDate', 'endDate', 'startPeriod', 'endPeriod', 'oneDay'])});
						}
						else {

							// need notify
						}
					});

					ngDialog.close();
				};

				$scope.updateOrder = function() {};
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
					startTime: CONSTANTS.periods[order.startPeriod],
					endTime: CONSTANTS.periods[order.endPeriod]
				});

				$scope.$watchGroup(['order.costPeriod', 'order.costServices', 'order.costGuests'], function(values) {

					$scope.order.total = _.sum(values);
				});

				$scope.cancelOrder = function() {

					ngDialog.close();

					callback({status: 'canceled'});
				};

				$scope.saveOrder = function() {

					var data = _.omit($scope.order, ['startTime', 'endTime']);

					dataStorage.createOrder(data)
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
										startDate: properties.startDate,
										startPeriod: _.first(_.keys(CONSTANTS.periods))
									}));
								}

								callback({status: 'success', result: response.data});
							}
							else {

								callback({status: 'error', result: null});

								// need notify
							}

							ngDialog.close();
						})
						.catch(function () {

							callback({status: 'error', result: null});

							// need notify

							ngDialog.close();
						});
				};

				$scope.selectServices = function(services) {

					$timeout(function() {
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
		showServiceOrder: 'templates/partials/showServiceOrder.html'
	};
}

module.exports = ManagerController;