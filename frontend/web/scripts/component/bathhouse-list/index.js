'use strict';

var angular = require('angular');

var HeaderController = require('./controller/header.controller');

var BathhouseListModule = angular.module('BathhouseListModule', []);

BathhouseListModule.controller('HeaderController', HeaderController);

module.exports = BathhouseListModule;