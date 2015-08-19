'use strict';

var _ = require('lodash');

ListController.$inject = ['$scope', '$rootScope', '$stateParams', '$timeout', 'dataStorage', 'userStorage', 'socket', 'CONSTANTS'];

function ListController($scope, $rootScope, $stateParams, $timeout, dataStorage, userStorage, socket, CONSTANTS) {

	$scope.rooms = [];

	$scope.activeRoom = undefined;

	$scope.order = 'popularity';
	$scope.reverse = true;

	$scope.listMode = $stateParams.mode === 'list';

	$scope.isEmptyResult = false; // flag for case, when nothing to offer

	$scope.showFullDescription = showFullDescription;
	$scope.checkOrder = checkOrder;
	$scope.createOrder = createOrder;
	$scope.fullResetFilters = fullResetFilters;

	//TODO: after add check for city
	dataStorage.loadData(1).then(function(rooms) {
		$scope.rooms = rooms;
	});

	function showFullDescription(id) {

		_.forEach($scope.rooms, function(room) {

			if (room.id !== id) {

				room.active = false;
			}
			else {

				$scope.activeRoom = room;

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

	$rootScope.$on('dataStorage:updateRooms', function(event, data) {

		!data.length ? $scope.isEmptyResult = true : $scope.isEmptyResult = false;

		$timeout(function() {

			_.forEach($scope.rooms, function(room) {

				room.show = _.indexOf(data, room.id) !== -1;
			});
		}, 0);
	});

	$rootScope.$on('header:toggleMode', function(event, mode) {

		if (!$scope.listMode && mode === 'list') {

			$scope.listMode = true;
		}
		else if ($scope.listMode && mode === 'map') {

			$scope.listMode = false;
		}
	});
}

module.exports = ListController;