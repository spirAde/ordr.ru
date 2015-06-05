'use strict';

appRoute.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider'];

function appRoute($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

	$locationProvider.html5Mode(true);

	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'templates/home/index.html',
			controller: 'HomeController'
		})

		.state('bathhouses', {
			abstract: true,
			url: '/bathhouses',
			template: '<ui-view />'
		})
		.state('bathhouses.list', {
			url: '/?city&mode',
			reloadOnSearch: false,
			params: {
				city: null,
				mode: 'list'
			},
			templateUrl: 'templates/bathhouse-list/index.html'
		})
		.state('bathhouses.item', {
			url: '/:id',
			reloadOnSearch: false,
			templateUrl: 'templates/bathhouse-item/index.html'
		});

	$urlRouterProvider.otherwise('/');
}

module.exports = appRoute;