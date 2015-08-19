'use strict';

var angular = require('angular');
var uiRouter = require('angular-ui-router');
var ngTouch = require('angular-touch');

var moment = require('moment');
var ru = require('moment/locale/ru.js');

require('picturefill');

var TemplatesModule = require('./common/templates.module');

var HomeModule = require('./component/home');
var BathhouseListModule = require('./component/bathhouse-list');
var BathhouseItemModule = require('./component/bathhouse-item');

var httpInterceptor = require('./common/provider/http-interceptor.factory');
var userStorage = require('./common/provider/user-storage.factory');
var socket = require('./common/provider/socket.factory');

var app = angular.module('app', [
  uiRouter,
  ngTouch,

  TemplatesModule.name,

  HomeModule.name,
  BathhouseListModule.name,
  BathhouseItemModule.name
]);

app.factory('httpInterceptor', httpInterceptor);
app.factory('userStorage', userStorage);
app.factory('socket', socket);

var appConfig = require('./config.js');
var appRoute = require('./route.js');

app.constant('CONSTANTS', _PRELOAD);
app.config(appConfig);
app.config(appRoute);

app.run(function() {

  moment.locale('ru');

});

module.exports = app;