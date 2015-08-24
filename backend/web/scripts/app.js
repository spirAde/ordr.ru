'use strict';

var angular = require('angular');
var uiRouter = require('angular-ui-router');
var ngTouch = require('angular-touch');
var ngDialog = require('ng-dialog');
var toastr = require('angular-toastr');

var moment = require('moment');
var ru = require('moment/locale/ru.js');

var jwt = require('./common/provider/jwt.factory');
var localStorage = require('./common/provider/localstorage.factory');
var httpInterceptor = require('./common/provider/http-interceptor.factory');
var rusify = require('./common/filter/rusify.filter');
var formatDate = require('./common/filter/format-date.filter');
var formatTime = require('./common/filter/format-time.filter');

var TemplatesModule = require('./common/templates.module');

var LoginModule = require('./component/login');
var ManagerModule = require('./component/manager');

var app = angular.module('controlApp', [
	uiRouter,
	ngTouch,
	ngDialog,
	toastr,

	TemplatesModule.name,

	LoginModule.name,
	ManagerModule.name
]);

app.factory('jwt', jwt);
app.factory('localStorage', localStorage);
app.factory('httpInterceptor', httpInterceptor);
app.filter('rusify', rusify);
app.filter('formatDate', formatDate);
app.filter('formatTime', formatTime);

var appConfig = require('./config.js');
var appRoute = require('./route.js');

app.constant('CONSTANTS', {
	periods: {
		0: '00:00', 3: '00:30', 6: '01:00', 9: '01:30', 12: '02:00', 15: '02:30', 18: '03:00', 21: '03:30',
		24: '04:00', 27: '04:30', 30: '05:00', 33: '05:30', 36: '06:00', 39: '06:30', 42: '07:00', 45: '07:30',
		48: '08:00', 51: '08:30', 54: '09:00', 57: '09:30', 60: '10:00', 63: '10:30', 66: '11:00', 69: '11:30',
		72: '12:00', 75: '12:30', 78: '13:00', 81: '13:30', 84: '14:00', 87: '14:30', 90: '15:00', 93: '15:30',
		96: '16:00', 99: '16:30', 102: '17:00', 105: '17:30', 108: '18:00', 111: '18:30', 114: '19:00', 117: '19:30',
		120: '20:00', 123: '20:30', 126: '21:00', 129: '21:30', 132: '22:00', 135: '22:30', 138: '23:00', 141: '23:30',
		144: '00:00'
	},
	format: 'YYYY-MM-DD'
});
app.config(appConfig);
app.config(appRoute);

app.run(function($state, $location, $timeout, jwt, localStorage) {

	moment.locale('ru');

	//localStorage.setToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJtYW5hZ2VyIiwidHlwZSI6ImJhdGgiLCJmdWxsTmFtZSI6Ilx1MDQxZlx1MDQzNVx1MDQ0Mlx1MDQ0M1x1MDQ0NVx1MDQzZVx1MDQzMlx1MDQzMCBcdTA0MWVcdTA0M2JcdTA0NGNcdTA0MzNcdTA0MzAiLCJwaG9uZSI6bnVsbCwib3JnYW5pemF0aW9uSWQiOjEsIm9yZ2FuaXphdGlvbk5hbWUiOiJcdTA0MWNcdTA0M2VcdTA0NDFcdTA0M2FcdTA0M2VcdTA0MzJcdTA0NDFcdTA0M2FcdTA0MzBcdTA0NGYgXHUwNDMxXHUwNDMwXHUwNDNkXHUwNDRmIiwiY2l0eUlkIjoxLCJ0b2tlbkxpZmV0aW1lIjoxNDQwMTcxNDgyfQ.k3uycse2YNyzOU4w3drL3ADsDmHga4QRKhmI-zZ3IU8');

	var token = localStorage.getToken();
	var path = 'login';

	if (token) {

		console.log(token);

		if (!jwt.isTokenExpired(token)) {

			var userData = localStorage.getData();

			if (!userData) {

				userData = jwt.decodeToken(token);

				localStorage.setData(userData);
			}

			path = 'manager';
		}
	}

	$timeout(function() {
		$state.go(path);
	}, 0);
});

module.exports = app;