(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./common/provider/http-interceptor.factory":2,"./common/templates.module":3,"./config.js":4,"./route.js":5,"angular":"angular","angular-touch":"angular-touch","angular-ui-router":"angular-ui-router"}],2:[function(require,module,exports){
'use strict';

httpInterceptor.$inject = ['authToken'];

function httpInterceptor(authToken) {

	return {
		request: setHeaders
	};


	function setHeaders(config) {

		config.headers = config.headers || {};

		// Api Version
		var apiVersion = '1.0';

		config.headers.Accept = 'application/json; version='+apiVersion;

		// JWT Token
		var token = authToken.getToken();

		if (token) {
			config.headers.Token = 'Bearer ' + token;
		}

		return config;
	}
}

module.exports = httpInterceptor;
},{}],3:[function(require,module,exports){
'use strict';

var angular = require('angular');

var TemplatesModule = angular.module('templates', []);

module.exports = TemplatesModule;
},{"angular":"angular"}],4:[function(require,module,exports){
'use strict';

appConfig.$inject = ['$compileProvider', '$httpProvider', '$provide'];

function appConfig($compileProvider, $httpProvider, $provide) {

	$httpProvider.interceptors.push('httpInterceptor');

	if ("dev" === 'prod') {
		$compileProvider.debugInfoEnabled(false);
	}

	$provide.decorator('$exceptionHandler', function($delegate) {

		return function(exception, cause) {

			setTimeout(
				function() {
					console.error(exception.stack);
					//throw exception;
				},
				0
			);
		};
	});
}

module.exports = appConfig;
},{}],5:[function(require,module,exports){
'use strict';

appRoute.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider'];

function appRoute($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

	$locationProvider.html5Mode(true);

	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: '/templates/home/page.html',
			controller: 'homePage'
		})

		.state('bathhouses', {
			abstract: true,
			url: '/bathhouses',
			templateUrl: '/templates/bathhouses/page.list.html'
		})
		.state('bathhouses.list', {
			url: '/?city&mode',
			reloadOnSearch: false,
			params: {
				city: null,
				mode: 'list'
			},
			onEnter: ['$stateParams', 'socketservice', function($stateParams, socketservice) {
				socketservice.emit('user:init', {city: $stateParams.city});
			}],
			views: {
				'header': {
					controller: 'header',
					templateUrl: '/templates/bathhouses/header.html'
				},
				'filter': {
					controller: 'filter',
					templateUrl: '/templates/bathhouses/filter.html'
				},
				'bathhouses': {
					controller: 'bathhousesList',
					templateUrl: '/templates/bathhouses/bathhouses.list.html'
				},
				'map': {
					controller: 'map',
					templateUrl: '/templates/bathhouses/map.html'
				},
				'review': {
					controller: 'review',
					templateUrl: '/templates/bathhouses/review.html'
				}
			}
		})
		.state('bathhouses.detail', {
			url: '/:bathhouseId',
			reloadOnSearch: false,
			views: {
				'detail': {
					controller: 'bathhousesDetail',
					templateUrl: '/templates/bathhouses/bathhouses.detail.html'
				}
			},
			onEnter: ['$stateParams', 'socketservice', function($stateParams, socketservice) {
				socketservice.emit('user:init', {bathhouseId: $stateParams.bathhouseId});
			}]
		})

		.state('carwashes', {});

	$urlRouterProvider.otherwise('/stream/all/top');
}

module.exports = appRoute;
},{}]},{},[1])


//# sourceMappingURL=bundle.js.map