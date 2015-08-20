'use strict';

var angular = require('angular');

var ManagerController = require('./controller/manager.controller');

var dataStorage = require('./provider/data-storage.factory');
//var socket = require('./provider/socket.factory');

var DatePaginator = require('./directive/date-paginator.directive');
var ScheduleDirective = require('./directive/schedule.directive');
var SelectServices = require('./directive/select-services.directive');

var ManagerModule = angular.module('ManagerModule', []);

ManagerModule.controller('ManagerController', ManagerController);

ManagerModule.directive('datePaginator', DatePaginator);
ManagerModule.directive('schedule', ScheduleDirective);
ManagerModule.directive('selectServices', SelectServices);

ManagerModule.factory('dataStorage', dataStorage);
//ManagerModule.factory('socket', socket);

module.exports = ManagerModule;