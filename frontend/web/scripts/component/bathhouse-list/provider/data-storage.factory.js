'use strict';

var _ = require('lodash');

dataStorage.$inject = ['$http', '$q', 'userStorage', 'CONSTANTS'];

function dataStorage($http, $q, userStorage, CONSTANTS) {

	return {
		rooms: [],
		excludedRooms: {
			datetime: [],
			price: [],
			distance: [],
			guests: [],
			options: [],
			types: [],
			name: [],
			prepayment: []
		},
		includedRooms: [],

		/*setRooms: setRooms,*/

		getRooms: getRooms,
		 /*getAdditionalData: getAdditionalData,
		 getFilters: getFilters,
		 getMarkers: getMarkers,
		 getBathhouse: getBathhouse,

		 getRoom: getRoom,*/

		filterList: filterList,
		resetListByTag: resetListByTag
	};

	function getRooms(cityId) {

		var _this = this;
		var pages;

		return $http.get('http://api.ordr.ru/rooms?city_id=' + cityId)
			.then(function(response) {

				pages = _.range(2, response.data._meta.pageCount + 1);

				_this.rooms = response.data.items;

				return _.map(response.data.items, _addProperties);
			})
			.catch(function(response) {

				return $q.reject(response);
			})
			.finally(function() {

				_.forEach(pages, function(page) {

					$http.get('http://api.ordr.ru/rooms?city_id=' + cityId + '&page=' + page)
						.then(function(response) {

							_this.rooms = _.union(_this.rooms, _.map(response.data.items, _addProperties));
						});
				});
			});
	}

	/*function setRooms(rooms) {
		var self = this;
		self.rooms = _.union(self.rooms, rooms);
	}*/

	/*function getAdditionalData(rooms, callback) {
		_(rooms).forEach(function(room) {
			$http
				.get('http://api.ordr.ru/v1/rooms/' + room['id'] + '?schedule&services&guests')
				.then(function(response) {
					callback(response.data);
				});
		});
	}

	function getFilters(callback) {
		return $http
			.get('http://api.ordr.ru/v1/starters/filter?city_id=1')
			.then(function(response) {
				callback(response.data);
			});
	}

	function getMarkers(callback) {
		var self = this;

		return $http
			.get('http://api.ordr.ru/v1/bathhouses/geo?city_id=1')
			.then(function(response) {
				callback(response.data);
			});
	}

	function getRoom(roomId) {
		var self = this;
		var room = _.find(self.rooms, function(room) { return room.id === roomId });
		return room;
	}

	function getBathhouse(bathhouseId, callback) {
		return $http
			.get('http://api.ordr.ru/v1/bathhouses/' + bathhouseId)
			.then(function(response) {
				callback(response.data);
			});
	}*/

	/**
	 * @desc  Фильтрация списка бань, по типу
	 * @param {string} type - тип фильтрации(дистанция, цена, ...)
	 * @param {Array|Object|string} data - значение данного типа
	 */
	function filterList(type, data) {

		var self = this;

		if (!_.size(self.rooms)) return;

		switch (type) {

			case 'datetime':

				var startDate = moment(data.start).format('YYYY-MM-DD'),
					startTime = moment(data.start).format('HH:mm'),
					endDate = moment(data.end).format('YYYY-MM-DD'),
					endTime = moment(data.end).format('HH:mm'),
					startPeriod = parseInt(self.invertPeriods[startTime]),
					endPeriod = parseInt(self.invertPeriods[endTime]);

				// В зависимости от того, дневная или ночная заявка(умещается в одну или в две даты) определяем
				// считаем длину периодов
				var periodLength = (startDate === endDate) ? ((endPeriod - startPeriod) / 3) + 1 :
				(((self.lastPeriodId - startPeriod) + endPeriod) / 3) + 1;

				var isOneDay = (startDate === endDate);

				_(self.rooms).forEach(function(room) {
					var list = [];

					if (isOneDay) {
						var startDatePeriods = room.schedule[startDate];

						_(startDatePeriods).forEach(function(period, periodId) {
							periodId = parseInt(periodId);
							if (periodId >= startPeriod && periodId <= endPeriod && period.enable) {
								list.push(periodId);
							}
							else return;
						});

						list.length === periodLength ?
							repartition(true, type, room.id, false) :
							repartition(false, type, room.id, false);
					}
					else {
						var startDatePeriods = room.schedule[startDate],
							endDatePeriods = room.schedule[endDate];

						_(startDatePeriods).forEach(function(period, periodId) {
							periodId = parseInt(periodId);
							if (periodId >= startPeriod && period.enable) {
								list.push(periodId);
							}
							else return;
						});

						_(endDatePeriods).forEach(function(period, periodId) {
							periodId = parseInt(periodId);
							if (periodId <= endPeriod && period.enable) {
								list.push(periodId);
							}
							else return;
						});

						// Вычитаем из списка 1 элемент, ибо не недо учитывать periodId = 0
						list.length - 1 === periodLength ?
							repartition(true, type, room.id, false) :
							repartition(false, type, room.id, false);
					}
				});
				break;

			case 'price':

				var min = data[0],
					max = data[1];

				_(self.rooms).forEach(function(room) {
					room.price >= min && max >= room.price  ?
						repartition(true, type, room.id, false) :
						repartition(false, type, room.id, false);
				});
				break;

			case 'distance':
				_(self.rooms).forEach(function(room) {
					room.distance <= data ?
						repartition(true, type, room.id, false) :
						repartition(false, type, room.id, false);
				});

				break;

			case 'options':
				var option = data[0],
					bool = data[1];

				_(self.rooms).forEach(function(room) {

					if (bool) {
						if (_.indexOf(room.options, option) !== -1) {
							repartition(true, type, room.id, true);
						}
						else {
							repartition(false, type, room.id, true);
						}
					}
					else {
						if (_.indexOf(room.options, option) === -1) {
							repartition(true, type, room.id, false);
						}
					}
				});

				break;

			case 'types':
				var kind = data[0],
					bool = data[1];

				_(self.rooms).forEach(function(room) {

					if (bool) {
						if (_.indexOf(room.types, kind) !== -1) {
							repartition(true, type, room.id, true);
						}
						else {
							repartition(false, type, room.id, true);
						}
					}
					else {
						if (_.indexOf(room.types, kind) === -1) {
							repartition(true, type, room.id, false);
						}
					}
				});

				break;

			case 'prepayment':
				var bool = data;
				if (angular.isUndefined(bool)) {
					_(self.rooms).forEach(function(room) {
						repartition(true, type, room.id, false);
					});
				}
				else {
					_(self.rooms).forEach(function(room) {
						if (bool) {
							if (room.prepayment) {
								repartition(true, type, room.id, false);
							}
							else {
								repartition(false, type, room.id, false);
							}
						}
						else {
							if (!room.prepayment) {
								repartition(true, type, room.id, false);
							}
							else {
								repartition(false, type, room.id, false);
							}
						}
					});
				}
				break;

			case 'name':
				var bathhouseName = data.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/),
					reg = new RegExp(bathhouseName.join('|'),'i');

				_(self.rooms).forEach(function(room) {
					if (reg.test(room.room_name) || reg.test(room.bathhouse_name)) {
						repartition(true, type, room.id, false);
					}
					else {
						repartition(false, type, room.id, false);
					}
				});
				break;
		}

		$rootScope.$emit('dataservice:updateRooms', self.includedRooms); // -> bathhouseList && map
		$rootScope.$emit('dataservice:updateOffersCount', _.size(self.includedRooms)); // -> filter
	}

	/**
	 * @desc  В зависимости от isTrue, добавляем или исключаем баню из массивов(excluded, included)
	 * @param {boolean} isTrue - выражение истино, фактически говорящее, что рума проходит по фильтру
	 * @param {string}  type - тип фильтра
	 * @param {number}  id  - id бани
	 * @param {boolean} isMulti - если true, то по данному типу баня может попадать в исключения несколько раз, например с опциями, или по типу бани
	 */
	function repartition(isTrue, type, id, isMulti) {
		if (isTrue) {
			if (_.indexOf(service.excludedRooms[type], id) !== -1 && !isMulti) {
				service.excludedRooms[type].splice(_.indexOf(service.excludedRooms[type], id), 1);
			}

			// Если данный id отсутствует во всех типах исключенных бань, то тогда его
			// можно добавить в includedRooms
			var existAnywhere = [];

			_(service.excludedRooms).forEach(function(type, idx) {
				if (_.indexOf(service.excludedRooms[idx], id) !== - 1) {
					existAnywhere.push(id);
				}
			});

			if (!existAnywhere.length && _.indexOf(service.includedRooms, id) === -1) {
				service.includedRooms.push(id);
			}
		}
		else {
			if (!isMulti) {
				if (_.indexOf(service.excludedRooms[type], id) === -1) {
					service.excludedRooms[type].push(id);
				}
			}
			else {
				service.excludedRooms[type].push(id);
			}

			if (_.indexOf(service.includedRooms, id) !== -1) {
				service.includedRooms.splice(_.indexOf(service.includedRooms, id), 1);
			}
		}
	}

	/**
	 * @desc  Сбрасываем бани из списка исключенных по определенному тегу/типу
	 * @param {string} tag - сам тег/тип
	 */
	function resetListByTag(tag) {
		var self = this;
		_(self.rooms).forEach(function(room) {

			// Чтобы не ломать repartition, было решено продублировать его часть таким образом

			// Удаляем полностью данную руму по данному тегу/типу
			_.pull(self.excludedRooms[tag], room.id);

			var existAnywhere = [];

			_(self.excludedRooms).forEach(function(type, idx) {
				if (_.indexOf(self.excludedRooms[idx], room.id) !== - 1) {
					existAnywhere.push(room.id);
				}
			});

			if (!existAnywhere.length && _.indexOf(self.includedRooms, room.id) === -1) {
				self.includedRooms.push(room.id);
			}
		});

		$rootScope.$emit('dataservice:updateRooms', self.includedRooms); // -> bathhouseList && map
		$rootScope.$emit('dataservice:updateOffersCount', _.size(self.includedRooms)); // -> filter
	}

	function _addProperties(room) {

		room.active = false;
		room.show = true;

		return room;
	}
}

module.exports = dataStorage;