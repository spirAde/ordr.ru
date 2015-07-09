'use strict';

var angular = require('angular');

var ManagerController = require('./controller/manager.controller');

var ManagerModule = angular.module('ManagerModule', []);

ManagerModule.controller('ManagerController', ManagerController);

module.exports = ManagerModule;