'use strict';

var _ = require('lodash');

ListController.$inject = ['$scope', '$rootScope', 'dataStorage', 'userStorage', 'CONSTANTS'];

function ListController($scope, $rootScope, dataStorage, userStorage, CONSTANTS) {

	$scope.rooms = [];

	$scope.order = 'popularity';
	$scope.reverse = true;

	$scope.isEmptyResult = false; // flag for case, when nothing to offer

	$scope.showFullDescription = showFullDescription;
	$scope.checkOrder = checkOrder;
	$scope.createOrder = createOrder;
	$scope.fullResetFilters = fullResetFilters;

	dataStorage.getRooms(1).then(function(rooms) {

		$scope.rooms = rooms;
		console.log($scope.rooms);
	});

	function showFullDescription(id) {

		_.forEach($scope.rooms, function(room) {

			if (room.id !== id) {

				room.active = false;
			}
			else {

				room.active = !room.active;
			}
		});
	}

	function checkOrder() {}

	function createOrder() {}

	function fullResetFilters() {}

	$rootScope.$on('header:sortList', function(event, order) {

		$scope.order = order;
		$scope.reverse = !$scope.reverse;

		// After sorting close all boxes
		_.forEach($scope.rooms, function(room) {
			room.active = false;
		});
	});
}

module.exports = ListController;