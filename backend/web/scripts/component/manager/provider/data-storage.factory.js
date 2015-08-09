'use strict';

var _ = require('lodash');
var moment = require('moment');

dataStorage.$inject = ['$rootScope', '$http', '$q', 'localStorage'];

function dataStorage($rootScope, $http, $q, localStorage) {

	var user = localStorage.getData();

	var storage = {
		rooms: [],
		loadData: loadData,
		loadOrders: loadOrders,
		createOrder: createOrder,
		removeOrder: removeOrder
	};

	return storage;

	function loadData() {

		return $http.get('http://api.ordr.ru/closed/rooms?bathhouseId=' + user.organizationId + '&limit=100&expand=settings')
			.then(function(response) {

				storage.rooms = response.data.items;

				return response.data.items;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function loadOrders(id, startDate, endDate) {

		endDate = endDate || moment(startDate).add(1, 'days').format('YYYY-MM-DD');

		return $http.get('http://api.ordr.ru/closed/orders?limit=1000&room_id=' + id + '&start=' + startDate + '&end=' + endDate)
			.then(function(response) {

				return response.data;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function createOrder(order) {

		return $http.post('http://api.ordr.ru/closed/orders', order)
			.then(function(response) {

				return response.data;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function removeOrder(id) {

		return $http.delete('http://api.ordr.ru/closed/orders/' + id)
			.then(function(response) {

				console.log(response);
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}
}

module.exports = dataStorage;