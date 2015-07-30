'use strict';

var _ = require('lodash');

dataStorage.$inject = ['$rootScope', '$http', '$q', 'localStorage'];

function dataStorage($rootScope, $http, $q, localStorage) {

	var user = localStorage.getData();

	var storage = {
		rooms: [],
		loadData: loadData,
		loadOrders: loadOrders
	};

	return storage;

	function loadData() {

		return $http.get('http://api.ordr.ru/closed/rooms?bathhouseId=' + user.organizationId + '&limit=100&expand=settings,schedule')
			.then(function(response) {

				storage.rooms = response.data.items;

				return response.data.items;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function loadOrders(id) {

		return $http.get('http://api.ordr.ru/closed/orders/sorted?limit=1000&room_id=' + id + '&start=2015-07-30&end=2015-08-06')
			.then(function(response) {

				return response.data;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}
}

module.exports = dataStorage;