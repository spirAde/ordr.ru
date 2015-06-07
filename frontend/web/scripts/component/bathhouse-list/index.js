'use strict';

var angular = require('angular');

require('angular-leaflet-directive');

var HeaderController = require('./controller/header.controller');
var FilterController = require('./controller/filter.controller');
var ListController = require('./controller/list.controller');
var ReviewController = require('./controller/review.controller');
var MapController = require('./controller/map.controller');

var RusifyFilter = require('../../common/filter/rusify.filter');

var SelectServicesDirective = require('./directive/select-services.directive');
var FilterScrollDirective = require('./directive/filter-scroll.directive');
var PopupScrollDirective = require('./directive/popup-scroll.directive');
var StickyDirective = require('./directive/sticky.directive');

var SchedulePanelDirective = require('./directive/schedule-panel.directive');
var ScheduleRowDirective = require('./directive/schedule-row.directive');
var SchedulePanelScrollDirective = require('./directive/schedule-panel-scroll.directive');

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

BathhouseListModule.directive('selectServices', SelectServicesDirective);
BathhouseListModule.directive('filterScroll', FilterScrollDirective);
BathhouseListModule.directive('popupScroll', PopupScrollDirective);
BathhouseListModule.directive('sticky', StickyDirective);

BathhouseListModule.directive('schedulePanel', SchedulePanelDirective);
BathhouseListModule.directive('scheduleRow', ScheduleRowDirective);
BathhouseListModule.directive('schedulePanelScroll', SchedulePanelScrollDirective);

BathhouseListModule.factory('dataStorage', dataStorage);

module.exports = BathhouseListModule;