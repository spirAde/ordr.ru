'use strict';

var angular = require('angular');
var uiRouter = require('angular-ui-router');
var ngTouch = require('angular-touch');

var TemplatesModule = require('./common/templates.module');

var app = angular.module('app', [
  uiRouter,
  ngTouch,
  TemplatesModule.name
]);

var httpInterceptor = require('./common/provider/http-interceptor.factory');

app.factory('httpInterceptor', httpInterceptor);

var appConfig = require('./config.js');
var appRoute = require('./route.js');

app.config(appConfig);
app.config(appRoute);

module.exports = app;