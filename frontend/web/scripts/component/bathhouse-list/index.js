'use strict';

var angular = require('angular');

require('angular-leaflet-directive');

var HeaderController = require('./controller/header.controller');
var FilterController = require('./controller/filter.controller');
var ListController = require('./controller/list.controller');
var ReviewController = require('./controller/review.controller');
var MapController = require('./controller/map.controller');

var RusifyFilter = require('../../common/filter/rusify.filter');

var dataStorage = require('./provider/data-storage.factory');

var BathhouseListModule = angular.module('BathhouseListModule', [
	'leaflet-directive'
]);

BathhouseListModule.controller('HeaderController', HeaderController);
BathhouseListModule.controller('FilterController', FilterController);
BathhouseListModule.controller('ListController', ListController);
BathhouseListModule.controller('ReviewController', ReviewController);
BathhouseListModule.controller('MapController', MapController);

BathhouseListModule.filter('rusify', RusifyFilter);

BathhouseListModule.factory('dataStorage', dataStorage);

module.exports = BathhouseListModule;