'use strict';

var angular = require('angular');

var auth = require('./provider/auth.factory');

var LoginController = require('./controller/login.controller');

var LoginModule = angular.module('LoginModule', []);

LoginModule.factory('auth', auth);

LoginModule.controller('LoginController', LoginController);

module.exports = LoginModule;