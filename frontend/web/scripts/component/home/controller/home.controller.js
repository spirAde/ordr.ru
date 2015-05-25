'use strict';

var _ = require('lodash');

HomeController.$inject = ['CONSTANTS', '$timeout'];

function HomeController(CONSTANTS, $timeout) {

	console.log(CONSTANTS);

	var vm = this;

	vm.cities = _.zipObject(
		_.pluck(CONSTANTS.city, 'id'),
		_.pluck(CONSTANTS.city, 'city')
	);

	vm.types = {
		1: 'Бани и сауны',
		2: 'Автомойки'
	};

	vm.selectedCityId = _.keys(vm.cities)[0];
	vm.selectedTypeId = _.keys(vm.types)[0];
	vm.offers = CONSTANTS.offers[vm.selectedCityId].room_count;

	vm.selectCity = selectCity;
	vm.selectType = selectType;

	function selectCity(id) {

		vm.selectedCityId = id;

		$timeout(function() {
			vm.offers = CONSTANTS.offers[id].room_count;
		}, 0);
	}

	function selectType(id) {
		console.log(id);
	}
}

module.exports = HomeController;