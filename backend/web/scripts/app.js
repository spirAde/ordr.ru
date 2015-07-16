'use strict';

var angular = require('angular');
var uiRouter = require('angular-ui-router');
var ngTouch = require('angular-touch');

var moment = require('moment');

require('../../../node_modules/moment/locale/ru.js');

var jwt = require('./common/provider/jwt.factory');
var localStorage = require('./common/provider/localstorage.factory');
var httpInterceptor = require('./common/provider/http-interceptor.factory');

var TemplatesModule = require('./common/templates.module');

var LoginModule = require('./component/login');
var ManagerModule = require('./component/manager');

var app = angular.module('controlApp', [
	uiRouter,
	ngTouch,

	TemplatesModule.name,

	LoginModule.name,
	ManagerModule.name
]);

app.factory('jwt', jwt);
app.factory('localStorage', localStorage);
app.factory('httpInterceptor', httpInterceptor);

var appConfig = require('./config.js');
var appRoute = require('./route.js');

app.config(appConfig);
app.config(appRoute);

app.run(function($state, $location, jwt, localStorage) {

	moment.locale('ru');

	var token = localStorage.getToken();

	if ($state.current.name !== 'login' && !token) {

		$state.go('login');
	}
	else {

		var userData = localStorage.getData();

		if (!userData) {

			userData = jwt.decodeToken(token);

			localStorage.setData(userData);

			$state.go('manager');
		}
		else {

			$state.go('manager');
		}
	}
});

module.exports = app;