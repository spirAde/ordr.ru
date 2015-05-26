'use strict';

var _ = require('lodash');

MapController.$inject = ['CONSTANTS', '$rootScope', '$stateParams'];

function MapController(CONSTANTS, $rootScope, $stateParams) {

	var vm = this;

	var city = CONSTANTS.city[0];

	L.mapbox.accessToken = 'pk.eyJ1Ijoic3BpcmFkZSIsImEiOiJMV1ZvLU04In0.j6dZfUFsE9JyctT4kiOq4g';

	vm.map = {};
	vm.room = {};
	vm.showRoom = false;
	vm.bathhouse = undefined;
	vm.popupHeight = undefined;

	vm.mapMode = $stateParams.mode === 'map' || false;

	var includedMarkers = []; //Список отфильтрованных маркеров
	var mapObject = {};
	var markers = []; // Всегда содержит полный список маркеров
	var controlZoom = {};
	var targetPoint;

	vm.map = {
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
			scrollWheelZoom: vm.mapMode ? true : false,
			dragging: vm.mapMode ? true : false,
			zoomControl: false
		},
		markers: {}
	};

	vm.events = {
		markers: {
			enable: ['click'],
			logic: 'emit'
		}
	};
}

module.exports = MapController;