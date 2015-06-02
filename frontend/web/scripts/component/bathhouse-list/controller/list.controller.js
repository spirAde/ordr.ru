'use strict';

var _ = require('lodash');

ListController.$inject = ['$scope', '$rootScope', '$timeout', 'dataStorage', 'userStorage', 'CONSTANTS'];

function ListController($scope, $rootScope, $timeout, dataStorage, userStorage, CONSTANTS) {

	$scope.rooms = [];

	$scope.order = 'popularity';
	$scope.reverse = true;

	$scope.isEmptyResult = false; // flag for case, when nothing to offer

	$scope.showFullDescription = showFullDescription;
	$scope.sortList = sortList;
	$scope.checkOrder = checkOrder;
	$scope.createOrder = createOrder;
	$scope.fullResetFilters = fullResetFilters;

	dataStorage.getRooms(1).then(function(rooms) {

		$scope.rooms = rooms;
		console.log($scope.rooms);
	});

	function showFullDescription(id) {

		_.forEach($scope.rooms, function(room) {

			if (room.roomId !== id) {
				room.active = false;
			}
			else {
				room.active = !room.active;
			}
		});
	}

	function sortList() {}

	function checkOrder() {}

	function createOrder() {}

	function fullResetFilters() {}
}

module.exports = ListController;