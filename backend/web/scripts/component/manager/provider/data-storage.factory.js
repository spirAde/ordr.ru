'use strict';

var _ = require('lodash');

dataStorage.$inject = ['$rootScope', '$http', '$q'];

function dataStorage($rootScope, $http, $q) {

	var storage = {
		loadData: loadData,
		loadOrders: loadOrders
	};

	return storage;

	function loadData() {

		return $http.get('http://control.ordr.ru/rooms')
			.then(function(response) {

				return response.data.items;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function loadOrders() {

		return $http.get('http://control.ordr.ru/orders')
			.then(function(response) {

				return response.data.items;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}
}

module.exports = dataStorage;