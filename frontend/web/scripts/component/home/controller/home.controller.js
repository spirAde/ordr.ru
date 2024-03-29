'use strict';

var _ = require('lodash');

HomeController.$inject = ['$scope', '$timeout', '$state', 'userStorage', 'CONSTANTS'];

function HomeController($scope, $timeout, $state, userStorage, CONSTANTS) {

	console.log(CONSTANTS);

	$scope.cities = _.zipObject(
		_.pluck(CONSTANTS.city, 'id'),
		_.pluck(CONSTANTS.city, 'city')
	);

	$scope.types = {
		1: 'Бани и сауны',
		2: 'Автомойки'
	};

	$scope.selectedCityId = _.keys($scope.cities)[0];
	$scope.selectedTypeId = _.keys($scope.types)[0];
	$scope.offers = CONSTANTS.offers[$scope.selectedCityId].roomCount;

	$scope.selectCity = selectCity;
	$scope.selectType = selectType;
	$scope.nextPage = nextPage;

	function selectCity(id) {

		userStorage.data.cityId = id;

		$scope.selectedCityId = id;

		$timeout(function() {
			$scope.offers = CONSTANTS.offers[id].roomCount;
		}, 0);
	}

	function selectType(id) {
		console.log(id);
	}

	function nextPage() {

		var citySlug = _.find(CONSTANTS.city, {id: $scope.selectedCityId}).slug;

		$state.transitionTo(
			'bathhouses.list',
			{city: citySlug, mode: 'list'},
			{reload: false, inherit: true, notify: true}
		);
	}
}

module.exports = HomeController;