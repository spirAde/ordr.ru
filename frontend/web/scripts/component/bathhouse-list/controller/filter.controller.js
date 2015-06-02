'use strict';

var _ = require('lodash');

FilterController.$inject = ['$scope', '$rootScope', 'dataStorage', 'CONSTANTS'];

function FilterController($scope, $rootScope, dataStorage, CONSTANTS) {

	$scope.filters = {
		datetime: {
			minDate: '2015-05-26',
			maxDate: '2015-06-26'
		},
		options: {},
		price: {},
		distance: {},
		guest: {},
		types: {},
		prepayment: undefined
	};

	$scope.offers = CONSTANTS.offers[1].roomCount;

	var optionsList = _.values(CONSTANTS.options.bathhouseOptions).concat(_.values(CONSTANTS.options.roomOptions));

	_.forEach(optionsList, function(option) {
		$scope.filters.options[option] = false;
	});

	_.forEach(CONSTANTS.bathhouseType, function(type) {
		$scope.filters.types[type] = false;
	});

	$scope.openedTop = true;
	$scope.openedBottom = false;
	$scope.openedTopAndBottom = false;

	$scope.$watchGroup(['$scope.openedTop', '$scope.openedBottom'], function() {
		$scope.openedTopAndBottom = $scope.openedTop && $scope.openedBottom;
	});

	$scope.attached = false;

	$scope.openFilters = openFilters;
	$scope.closeFilters = closeFilters;

	$scope.cancelFilter = cancelFilter;

	$scope.changeOptions = changeOptions;
	$scope.changeType = changeType;
	$scope.changePrepayment = changePrepayment;
	$scope.searchByName = searchByName;

	$scope.typedName = '';

	function cancelFilter(tag) {
		/*switch (tag) {
			case 'distance':
				var distanceFloor = defaultData.distance[0],
					distanceCeil = defaultData.distance[1];

				$scope.filters.distance = {
					min: defaultData.distance[0],
					max: defaultData.distance[1],
					ceil: distanceCeil,
					floor: distanceFloor
				};
				break;

			case 'options':
				_(defaultData.options).forEach(function(option) {
					$scope.filters.options[option] = false;
				});
				break;

			case 'price':
				var priceFloor = defaultData.price[0],
					priceCeil = defaultData.price[1];

				$scope.filters.price = {
					min: defaultData.price[0],
					max: defaultData.price[1],
					ceil: priceCeil,
					floor: priceFloor
				};
				break;

			case 'datetime':
				$scope.filters.datetime = {
					minDate: defaultData.datetime.minDate,
					maxDate: defaultData.datetime.maxDate,
					step: 30
				};
				break;

			case 'types':
				$scope.filters.types = {
					bathhouse: false,
					sauna: false,
					hammam: false
				};
				break;

			case 'guests':
				break;

			case 'name':
				$scope.typedName = '';
				break;

			case 'prepayment':
				$scope.filters.prepayment = undefined;
				break;
		}

		dataservice.resetListByTag(tag);

		_.pull($scope.tags, tag);*/
	}

	function openFilters() {

		if ($scope.mode === 'map') $scope.openedTop = true;

		$scope.openedBottom = true;

		$scope.$emit('$activate'); // -> filterScroll-directive
	}

	function closeFilters() {

		if ($scope.mode === 'map') $scope.openedTop = false;

		$scope.openedBottom = false;

		$scope.$emit('$destroy'); // ->filterScroll-directive
	}

	$scope.translate = function(value) {
		return '< ' + value;
	};

	$rootScope.$on('datetimeEnded', function(event, data) {

		/*if (data.date && data.time && data.duration) {
			var start = data.date + ' ' + data.time,
				end = moment(start).add(parseInt(data.duration), 'hours').format('YYYY-MM-DD HH:mm');

			dataservice.filterList('datetime', {
				start: start,
				end: end
			});
		}
		else {
			return false;
		}

		$timeout(function() {
			if (start && end) {
				if (!_.contains($scope.tags, 'datetime')) {
					$scope.tags.push('datetime');
				}
			}
			else {
				_.pull($scope.tags, 'datetime');
			}
		}, 0);*/
	});

	$rootScope.$on('slideEnded', function(event, type) {

		/*if (type === 'distance') {

			dataservice.filterList('distance', parseInt($scope.filters.distance.max));

			if ($scope.filters.distance.max !== $scope.filters.distance.ceil) {
				if (!_.contains($scope.tags, 'distance')) {
					$scope.tags.push('distance');
				}
			}
			else {
				_.pull($scope.tags, 'distance');
			}
		}
		else if (type === 'price') {

			dataservice.filterList('price', [parseInt($scope.filters.price.min), parseInt($scope.filters.price.max)]);

			if ($scope.filters.price.max !== $scope.filters.price.ceil ||
				$scope.filters.price.min !== $scope.filters.price.floor) {
				if (!_.contains($scope.tags, 'price')) {
					$scope.tags.push('price');
				}
			}
			else {
				_.pull($scope.tags, 'price');
			}
		}
		else if (type === 'guests') {
			//
		}*/
	});

	function changeOptions(option) {

		/*dataservice.filterList('options', [option, $scope.filters.options[option]]);

		$scope.filters.options[option] ? trueOptions.push(option) : _.pull(trueOptions, option);

		if (trueOptions.length) {
			if (!_.contains($scope.tags, 'options')) {
				$scope.tags.push('options');
			}
		}
		else {
			_.pull($scope.tags, 'options');
		}*/
	}

	function changeType(type) {

		/*dataservice.filterList('types', [type, $scope.filters.types[type]]);

		$scope.filters.types[type] ? trueTypes.push(type) : _.pull(trueTypes, type);

		if (trueTypes.length) {
			if (!_.contains($scope.tags, 'types')) {
				$scope.tags.push('types');
			}
		}
		else {
			_.pull($scope.tags, 'types');
		}*/
	}

	function changePrepayment(prepayment) {
		/*dataservice.filterList('prepayment', prepayment);

		if (!angular.isUndefined(prepayment)) {
			if (!_.contains($scope.tags, 'prepayment')) {
				$scope.tags.push('prepayment');
			}
		}
		else {
			_.pull($scope.tags, 'prepayment');
		}*/
	}

	function searchByName(typedName) {

		/*dataservice.filterList('name', typedName);

		if (typedName.length){
			if (!_.contains($scope.tags, 'name')) {
				$scope.tags.push('name');
			}
		}
		else {
			_.pull($scope.tags, 'name');
		}*/
	}

	$rootScope.$on('dataservice:updateOffersCount', function(event, data) {
		//$scope.offers = data;
	});

	$rootScope.$on('bathhouseList:fullResetFilters', function(event) {
		/*var tags = _.keys(dataservice.excludedRooms);
		_.map(tags, function(tag) {
			$scope.cancelFilter(tag);
		});*/
	});

	$rootScope.$on('header:toggleMode', function(event, mode) {

		if (mode === 'map') {

			$scope.openedTop = false;
			$scope.openedBottom = false;

			$scope.mode = 'map';
		}
		else if (mode === 'list') {

			$scope.openedTop = true;
			$scope.openedBottom = false;

			$scope.mode = 'list';
		}

		if ($scope.openedTopAndBottom) $scope.$emit('$destroy'); // ->filterScroll-directive
	});

	$rootScope.$on('header:openFilters', function(event) {

	});

	$rootScope.$on('closeFilters', function(event) {

	});
}

module.exports = FilterController;