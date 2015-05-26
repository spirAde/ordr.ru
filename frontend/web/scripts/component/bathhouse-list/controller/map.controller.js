'use strict';

var _ = require('lodash');

MapController.$inject = ['CONSTANTS', '$scope', '$rootScope', '$stateParams', 'leafletData'];

function MapController(CONSTANTS, $scope, $rootScope, $stateParams, leafletData) {

	var city = CONSTANTS.city[0];

	L.mapbox.accessToken = 'pk.eyJ1Ijoic3BpcmFkZSIsImEiOiJMV1ZvLU04In0.j6dZfUFsE9JyctT4kiOq4g';

	$scope.map = {};
	$scope.room = {};
	$scope.showRoom = false;
	$scope.bathhouse = undefined;
	$scope.popupHeight = undefined;

	$scope.mapMode = $stateParams.mode === 'map';

	var includedMarkers = []; //Список отфильтрованных маркеров
	var mapObject = {};
	var markers = []; // Всегда содержит полный список маркеров
	var controlZoom = {};
	var targetPoint;

	$scope.map = {
		center: {
			lat: parseFloat(city.latitude),
			lng: parseFloat(city.longitude),
			zoom: 14
		},
		layers: {
			baselayers: {
				city: {
					name: 'OpenStreetMap (XYZ)',
					url: 'https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png',
					type: 'xyz',
					layerOptions: {
						attribution: '<a href="https://www.mapbox.com/">Mapbox</a> - We love it =)'
					}
				}
			}
		},
		defaults: {
			scrollWheelZoom: $scope.mapMode ? true : false,
			dragging: $scope.mapMode ? true : false,
			zoomControl: false
		},
		markers: {}
	};

	$scope.events = {
		markers: {
			enable: ['click'],
			logic: 'emit'
		}
	};

	// Режим карта или список, в зависимости от флага
	$rootScope.$on('header:toggleMode', function(event, mode) {

		if (!$scope.mapMode && mode === 'map') {

			$scope.mapMode = !$scope.mapMode;

			// В режиме карты мы позволяем делать с картой все
			mapObject.dragging.enable();
			mapObject.scrollWheelZoom.enable();
			mapObject.doubleClickZoom.enable();
			mapObject.touchZoom.enable();

			controlZoom.addTo(mapObject);

			angular.extend($scope.map.markers, includedMarkers);
		}
		else if ($scope.mapMode && mode === 'list') {

			$scope.mapMode = !$scope.mapMode;

			// Если переключаемся на список, убираем открытую плашку
			$scope.room = {};
			$scope.showRoom = false;

			// Отрубаем опции для карты
			mapObject.dragging.disable();
			mapObject.scrollWheelZoom.disable();
			mapObject.doubleClickZoom.disable();

			controlZoom.removeFrom(mapObject);

			$scope.map.markers = {};
		}
	});

	// Дергаем саму карту по окончательной загрузке карты
	$scope.$on('leafletDirectiveMap.load', function(event) {

		leafletData.getMap().then(function(map) {

			mapObject = map;

			controlZoom = new L.Control.Zoom({ position: 'topright' });

			/*dataservice.getMarkers(function(pointers) {
				_(pointers).forEach(function(marker) {

					markers.push({
						lat: parseFloat(marker.latitude),
						lng: parseFloat(marker.longitude),
						name: marker.name,
						address: marker.address,
						bathhouse_id: marker.bathhouse_id,
						message: '<div ng-include="\'partials/templates/bathhousePopup.html\'"></div>',
						icon: {
							type: 'mapbox',
							'marker-symbol': _.size(marker.rooms),
							'marker-color': '#18B2AE'
						},
						rooms: marker.rooms,
						popupOptions: {
							minWidth: 170
						}
					});
				});

				includedMarkers = markers;

				if ($scope.mapMode) {
					$timeout(function() {
						$scope.map.markers = markers;
					}, 0);
				}
			});*/

			if ($scope.mapMode) {
				controlZoom.addTo(mapObject);
			}

			// Все цифры взяты на глаз, некогда автоматизировать
			/*var mapSizes = map.getSize();

			// Рассчитываем точку, в которой будем показывать попап
			if (userservice.screen.width > 1354) {
				targetPoint = new L.Point(((mapSizes.x - 1354 - 40 - 85) / 2) + 1354 - 95, mapSizes.y - 25);
			}
			else {
				targetPoint = new L.Point(((mapSizes.x - 1024) / 2) + 1024, mapSizes.y - 25);
			}*/
		});
	});
}

module.exports = MapController;