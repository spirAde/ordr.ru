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