'use strict';

var _ = require('lodash');
var moment = require('moment');

dataStorage.$inject = ['$http', '$q', 'localStorage', 'CONSTANTS'];

function dataStorage($http, $q, localStorage, CONSTANTS) {

	var user = localStorage.getData();

	var storage = {
		rooms: [],
		loadBathhouse: loadBathhouse,
		loadRooms: loadRooms,
		loadOrders: loadOrders,
		createOrder: createOrder,
		removeOrder: removeOrder,
		updateOrder: updateOrder,

		calculateOrderOfPeriods: calculateOrderOfPeriods,
		calculateOrderOfServices: calculateOrderOfServices,
		calculateOrderOfGuests: calculateOrderOfGuests
	};

	return storage;


	function loadBathhouse() {

		return $http.get('http://api.ordr.ru/closed/bathhouses/1?expand=services')
			.then(function(response) {

				return response.data;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function loadRooms() {

		return $http.get('http://api.ordr.ru/closed/rooms?bathhouseId=' + user.organizationId + '&limit=100&expand=settings,prices')
			.then(function(response) {

				storage.rooms = response.data.items;

				return response.data.items;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function loadOrders(id, startDate, endDate) {

		endDate = endDate || moment(startDate).add(1, 'days').format(CONSTANTS.format);

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

				return response;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}

	function updateOrder(order) {

		return $http.put('http://api.ordr.ru/closed/orders/'+order.id, order)
			.then(function(response) {

				return response.data;
			})
			.catch(function(response) {

				return $q.reject(response);
			});
	}


	function calculateOrderOfPeriods(prices, order) {

		var summ = 0;
		var redeterminedOrder = {};

		// depending on the number of days of the order, overriding the order
		if (moment(order.startDate).isSame(order.endDate)) {
			redeterminedOrder[order.startDate] = [order.startPeriod, order.endPeriod];
		}
		else {
			redeterminedOrder[order.startDate] = [order.startPeriod, _.last(_.keys(CONSTANTS.periods))];
			redeterminedOrder[order.endDate] = [_.first(_.keys(CONSTANTS.periods)), order.endPeriod];
		}

		_.forEach(redeterminedOrder, function(dateOrders, date) {

			var selectedIndexes = [];
			var startDayIndex = moment(date).day();
			var dayPrices = prices[startDayIndex];
			var minIndex;
			var maxIndex;

			// find price periods for current order
			_.forEach(dayPrices, function(pricePeriod, idx) {

				if ((pricePeriod.period[0] <= dateOrders[0] && dateOrders[0] < pricePeriod.period[1]) ||
					(pricePeriod.period[0] <= dateOrders[1] && dateOrders[1] < pricePeriod.period[1])) {

					selectedIndexes.push(idx);
				}
			});

			minIndex = _.min(selectedIndexes);
			maxIndex = _.max(selectedIndexes);

			// in case the order covers more then 2 price-periods
			selectedIndexes = _.range(minIndex, maxIndex).concat(maxIndex);

			if (selectedIndexes.length === 1) {

				summ += prices[startDayIndex][selectedIndexes[0]]['price'] * (dateOrders[1] - dateOrders[0]);
			}
			else {

				_.forEach(selectedIndexes, function(index) {

					var price = prices[startDayIndex][index]['price'];

					if (index === minIndex) {

							summ += price * (prices[startDayIndex][index]['period'][1] - dateOrders[0]);
					}
					else if (index === maxIndex) {

						summ += price * (dateOrders[1] - prices[startDayIndex][index]['period'][0]);
					}
					else {

						summ += price * (prices[startDayIndex][index]['period'][1] - prices[startDayIndex][index]['period'][0]);
					}
				});
			}
		});

		return summ / 6;
	}

	function calculateOrderOfServices(services, selected) {

		var flatten = _.flatten(_.values(services));

		return _.reduce(selected, function(sum, serviceId) {

			var item = _.find(flatten, {id: serviceId});
			return sum + parseInt(item.price);
		}, 0);
	}

	function calculateOrderOfGuests(count) {
		return 0;
	}
}

module.exports = dataStorage;