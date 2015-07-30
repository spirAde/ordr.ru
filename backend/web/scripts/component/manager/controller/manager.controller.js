'use strict';

var _ = require('lodash');

ManagerController.$inject = ['$scope', '$state', '$timeout', 'localStorage', 'dataStorage'];

function ManagerController($scope, $state, $timeout, localStorage, dataStorage) {

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

			dataStorage.loadOrders(room.id).then(function(orders) {

				room.orders = orders;
			});
		});
	});

	$timeout(function() {
		console.log($scope.rooms);
	}, 5000);

	$scope.logout = logout;

	function logout() {

		localStorage.setToken();
		localStorage.setData();

		$state.go('login');
	}
}

module.exports = ManagerController;