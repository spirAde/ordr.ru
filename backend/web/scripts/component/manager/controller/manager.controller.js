'use strict';

var _ = require('lodash');
var moment = require('moment');

ManagerController.$inject = ['$scope', '$state', '$timeout', 'ngDialog', 'localStorage', 'dataStorage', 'CONSTANTS'];

function ManagerController($scope, $state, $timeout, ngDialog, localStorage, dataStorage, CONSTANTS) {

	$scope.rooms = [];
	$scope.orders = [];

	$scope.user = {
		name: 'Петухова Ольга',
		bathhouse: 'Бани на Малиновой'
	};

	dataStorage.loadData().then(function(rooms) {

		$scope.rooms = rooms;

		_.forEach(rooms, function(room) {

			room.orders = {};

			dataStorage.loadOrders(room.id, moment().format('YYYY-MM-DD')).then(function(orders) {

				room.orders = orders;
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
			template: templates.showManagerOrder,
			scope: $scope,
			controller: ['$scope', function($scope) {

				$scope.order = _.pick(orders[0], ['id', 'roomId', 'startDate', 'startPeriod']);

				$scope.order = _.assign($scope.order, {
					startTime: CONSTANTS.periods[orders[0].startPeriod],
					endDate: orders.length > 1 ? orders[1].endDate : orders[0].endDate,
					endTime: orders.length > 1 ? CONSTANTS.periods[orders[1].endPeriod] : CONSTANTS.periods[orders[0].endPeriod]
				});

				$scope.cancelOrder = function() {
					ngDialog.close();
				};

				$scope.removeOrder = function() {

					dataStorage.removeOrder(orders[0].id).then(function(data) {

						console.log(data);
					});

					ngDialog.close();
				};

				$scope.updateOrder = function() {};
			}]
		});
	}

	function createOrder(order, callback) {

		ngDialog.open({
			template: templates.createOrder,
			scope: $scope,
			controller: ['$scope', function($scope) {

				$scope.order = _.pick(order, ['roomId', 'startDate', 'endDate']);

				$scope.order = _.assign($scope.order, {
					startTime: CONSTANTS.periods[order.startPeriod],
					endTime: CONSTANTS.periods[order.endPeriod],
					comment: '',
					summ: 0
				});

				$scope.cancelOrder = function() {

					ngDialog.close();

					callback({status: 'canceled'});
				};

				$scope.saveOrder = function() {

					var data = _.pick(order, ['roomId', 'startDate', 'endDate', 'startPeriod', 'endPeriod']);

					dataStorage.createOrder(data)
						.then(function(response) {

							// created
							if (response.status === 201) {

								var room = _.find($scope.rooms, {id: response.data.roomId});
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
							}

							ngDialog.close();
						})
						.catch(function(response) {

							callback({status: 'error', result: null});

							ngDialog.close();
						});
				}
			}]
		});

	}

	function getOrders(roomId, startDate, endDate) {

		endDate = endDate || moment(startDate).add(1, 'days').format('YYYY-MM-DD');

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
		showSiteOrder: 'templates/partials/showServiceOrder.html'
	};
}

module.exports = ManagerController;