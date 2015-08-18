'use strict';

var _ = require('lodash');

HeaderController.$inject = ['$scope', '$stateParams', '$location', 'CONSTANTS'];

function HeaderController($scope, $stateParams, $location, CONSTANTS) {

	$scope.cities = _.zipObject(
		_.pluck(CONSTANTS.city, 'id'),
		_.pluck(CONSTANTS.city, 'city')
	);

	$scope.mode = $stateParams.mode;

	$scope.order = 'popularity';
	$scope.reverse = false;
	$scope.opened = true;

	$scope.toggleMode = toggleMode;
	$scope.sortList = sortList;

	function toggleMode(mode) {

		$scope.mode = mode;

		$location.search('mode', $scope.mode);

		$scope.$emit('header:toggleMode', mode); // ->list && map && filter && review
	}

	function sortList(order) {

		if ($scope.order === order) {

			$scope.reverse = !$scope.reverse;
		}
		else {

			$scope.reverse = false;
			$scope.order = order;
		}

		$scope.$emit('header:sortList', order); // -> list
	}
}

module.exports = HeaderController;