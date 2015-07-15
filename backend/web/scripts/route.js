'use strict';

appRoute.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider'];

function appRoute($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

	$locationProvider.html5Mode(true);

	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

	$stateProvider
		.state('login', {
			url: '/',
			templateUrl: 'templates/login/index.html',
			controller: 'LoginController'
		})

		.state('manager', {
			url: '/manager',
			templateUrl: 'templates/manager/index.html',
			controller: 'ManagerController'
		});

	$urlRouterProvider.otherwise('/');
}

module.exports = appRoute;