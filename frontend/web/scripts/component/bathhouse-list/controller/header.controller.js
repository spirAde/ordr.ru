'use strict';

var _ = require('lodash');

HeaderController.$inject = ['CONSTANTS', '$scope', '$stateParams', '$location'];

function HeaderController(CONSTANTS, $scope, $stateParams, $location) {

	var vm = this;

	vm.cities = _.zipObject(
		_.pluck(CONSTANTS.city, 'id'),
		_.pluck(CONSTANTS.city, 'city')
	);

	vm.mode = $stateParams.mode;

	vm.order = 'popularity';
	vm.reverse = false;
	vm.opened = true;

	vm.toggleMode = toggleMode;
	vm.sortList = sortList;

	function toggleMode(mode) {

		vm.mode = mode;

		$location.search('mode', vm.mode);

		$scope.$emit('header:toggleMode', mode); // ->list && map && filter && review
	}

	function sortList(order) {

		if (vm.order === order) {
			vm.reverse = !vm.reverse;
		}
		else {
			vm.reverse = false;
			vm.order = order;
		}
	}
}

module.exports = HeaderController;