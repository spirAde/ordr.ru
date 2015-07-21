'use strict';

var _ = require('lodash');

ManagerController.$inject = ['$scope', '$state', 'localStorage', 'dataStorage'];

function ManagerController($scope, $state, localStorage, dataStorage) {

	$scope.rooms = [];
	$scope.orders = [];

	$scope.user = {
		name: 'Петухова Ольга',
		bathhouse: 'Бани на Малиновой'
	};

	dataStorage.loadData().then(function(rooms) {

		$scope.rooms = rooms;

		dataStorage.loadOrders().then(function(orders) {

			_.forEach($scope.rooms, function(room) {

				room.orders = [];

				room.orders = _.where(orders, {room_id: room.id});
			});
		});
	});

	$scope.logout = logout;

	function logout() {

		localStorage.setToken();
		localStorage.setData();

		$state.go('login');
	}
}

module.exports = ManagerController;