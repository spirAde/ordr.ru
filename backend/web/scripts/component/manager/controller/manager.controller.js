'use strict';

var _ = require('lodash');
var moment = require('moment');

ManagerController.$inject = ['$scope', '$state', '$timeout', 'ngDialog', 'localStorage', 'dataStorage'];

function ManagerController($scope, $state, $timeout, ngDialog, localStorage, dataStorage) {

	$scope.rooms = [];
	$scope.orders = [];

	$scope.currentDate = moment().format('YYYY-MM-DD');

	$scope.user = {
		name: 'Петухова Ольга',
		bathhouse: 'Бани на Малиновой'
	};

	dataStorage.loadData().then(function(rooms) {

		$scope.rooms = rooms;

		_.forEach(rooms, function(room) {

			room.orders = {};

			dataStorage.loadOrders(room.id).then(function(orders) {

				room.orders = orders;
			});
		});
	});

	$scope.showOrder = showOrder;
	$scope.createOrder = createOrder;

	$scope.selectDate = selectDate;
	$scope.logout = logout;


	function showOrder(roomId, orderId, callback) {

		var room = _.find($scope.rooms, {id: roomId});
		var orders = _.where(_.flatten(_.toArray(room.orders)), {id: orderId}); // maybe 2days order

		ngDialog.open({
			template: templates.showManagerOrder,
			scope: $scope,
			controller: ['$scope', function($scope) {

				$scope.cancelOrder = function() {
					ngDialog.close();
				};

			}]
		});
	}

	function createOrder(order, callback) {

		ngDialog.open({
			template: templates.createOrder,
			scope: $scope,
			controller: ['$scope', function ($scope) {

				$scope.cancelOrder = function() {

					ngDialog.close();

					callback({status: 'canceled'});
				};

				$scope.saveOrder = function() {

					ngDialog.close();

					callback({status: 'created'});
				}
			}]
		});

	}

	function selectDate(date) {

		$timeout(function() {
			$scope.currentDate = moment(date).format('YYYY-MM-DD');
		}, 0);
	}

	function logout() {

		localStorage.setToken();
		localStorage.setData();

		$state.go('login');
	}

	var templates = {
		createOrder: '/templates/templates/createOrder.html',
		showManagerOrder: '/templates/templates/showManagerOrder.html',
		showSiteOrder: '/templates/templates/showSiteOrder.html'
	};
}

module.exports = ManagerController;