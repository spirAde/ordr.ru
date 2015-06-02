'use strict';

var angular = require('angular');

var HomeController = require('./controller/home.controller');

var OverflowBackground = require('./directive/overflowbg.directive');

var SelectSingleDirective = require('../../common/directive/select-single.directive');
var DeclinationFilter = require('../../common/filter/declination.filter');

var HomeModule = angular.module('HomeModule', []);

HomeModule.controller('HomeController', HomeController);

HomeModule.directive('selectSingle', SelectSingleDirective);
HomeModule.directive('overflowbg', OverflowBackground);

HomeModule.filter('declination', DeclinationFilter);

module.exports = HomeModule;