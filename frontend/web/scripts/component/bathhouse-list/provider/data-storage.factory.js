'use strict';

var _ = require('lodash');

dataStorage.$inject = ['$rootScope', '$http', '$q', '$timeout', 'userStorage', 'CONSTANTS'];

function dataStorage($rootScope, $http, $q, $timeout, userStorage, CONSTANTS) {

	/**
	 * @param {Array|Object} rooms - массив содержащий все бани
	 * @param {Array|Object} markers - данные о положении на карте каждой бани
	 * @param {Array|Object} excludedBathhouses - массив содержащий ID всех исключенных бань по фильтрам
	 * @param {Array} includedBathhouses - массив содержащий ID всех включенных бань(show = true)
	 * @param {Array|Object} userParams - данные пользователя
	 * @param {Number} activeRoomId - ID room, которая активна на данный момент(default - undefined)
	 */
	var storage = {
		rooms: [],
		markers: [],
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

		getRooms: getRooms,
		getAdditionalData: getAdditionalData,
		getFilters: getFilters,
		getMarkers: getMarkers,
		getBathhouse: getBathhouse,

		getRoom: getRoom,

		filterList: filterList,
		resetListByTag: resetListByTag
	};

	return storage;

	function getRooms(cityId) {

		var _this = this;
		var pages;

		return $http.get('http://api.ordr.ru/rooms?cityId=' + cityId + '&expand=bathhouse,settings')
			.then(function(response) {

				pages = _.range(2, response.data._meta.pageCount + 1);

				_this.rooms = response.data.items;

				return _.map(response.data.items, _addProperties);
			})
			.catch(function(response) {

				return $q.reject(response);
			})
			.finally(function() {

				var promises = _.map(pages, function(page) {
					return $http.get('http://api.ordr.ru/rooms?cityId=' + cityId + '&page=' + page + '&expand=bathhouse,settings');
				});

				$q.all(promises)
					.then(function(responses) {

						_.forEach(responses, function(response) {

							_this.rooms = _.union(_this.rooms, response.data.items);
						});
					})
					.catch(function(responses) {

						return $q.reject(responses);
					})
					.finally(function() {

						_.forEach(_this.rooms, function(room) {

							var marker = _.find(_this.markers, {bathhouseId: room.bathhouse.id});

							if (marker) {

								marker.rooms.push({
									id: room.id,
									name: room.name,
									available: true
								});
							}
							else {
								_this.markers.push({
									bathhouseId: room.bathhouse.id,
									name: room.bathhouse.name,
									address: room.bathhouse.address,
									point: room.bathhouse.point,
									rooms: [{
										id: room.id,
										name: room.name,
										available: true
									}]
								});
							}
						});

						$rootScope.$emit('dataStorage:markers', _this.markers);
					});
			});
	}

	function getAdditionalData(rooms, callback) {
		_.forEach(rooms, function(room) {
			$http
				.get('http://api.ordr.ru/v1/rooms/' + room['id'] + '?schedule&storages&guests')
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
		var _this = this;

		return $http
			.get('http://api.ordr.ru/v1/bathhouses/geo?city_id=1')
			.then(function(response) {
				callback(response.data);
			});
	}

	function getRoom(id) {

		var _this = this;

		return _.find(_this.rooms, function(room) { return room.id === id });
	}

	function getBathhouse(bathhouseId, callback) {
		return $http
			.get('http://api.ordr.ru/v1/bathhouses/' + bathhouseId)
			.then(function(response) {
				callback(response.data);
			});
	}

	/**
	 * @desc  Фильтрация списка бань, по типу
	 * @param {string} type - тип фильтрации(дистанция, цена, ...)
	 * @param {Array|Object|string} data - значение данного типа
	 */
	function filterList(type, data) {

		var _this = this;

		if (!_this.rooms.length) return;

		switch (type) {

			case 'datetime':

				var startDate = moment(data.start).format('YYYY-MM-DD'),
					startTime = moment(data.start).format('HH:mm'),
					endDate = moment(data.end).format('YYYY-MM-DD'),
					endTime = moment(data.end).format('HH:mm'),
					startPeriod = parseInt(_this.invertPeriods[startTime]),
					endPeriod = parseInt(_this.invertPeriods[endTime]);

				// В зависимости от того, дневная или ночная заявка(умещается в одну или в две даты) определяем
				// считаем длину периодов
				var periodLength = (startDate === endDate) ? ((endPeriod - startPeriod) / 3) + 1 :
				(((_this.lastPeriodId - startPeriod) + endPeriod) / 3) + 1;

				var isOneDay = startDate === endDate ? true : false;

				_.forEach(_this.rooms, function(room) {
					var list = [];

					if (isOneDay) {
						var startDatePeriods = room.schedule[startDate];

						_.forEach(startDatePeriods, function(period, periodId) {
							periodId = parseInt(periodId);
							if (periodId >= startPeriod && periodId <= endPeriod && period.enable) {
								list.push(periodId);
							}
							else return;
						});

						list.length === periodLength ?
							_repartition(true, type, room.id, false) :
							_repartition(false, type, room.id, false);
					}
					else {
						var startDatePeriods = room.schedule[startDate],
							endDatePeriods = room.schedule[endDate];

						_.forEach(startDatePeriods, function(period, periodId) {
							periodId = parseInt(periodId);
							if (periodId >= startPeriod && period.enable) {
								list.push(periodId);
							}
							else return;
						});

						_.forEach(endDatePeriods, function(period, periodId) {
							periodId = parseInt(periodId);
							if (periodId <= endPeriod && period.enable) {
								list.push(periodId);
							}
							else return;
						});

						// Вычитаем из списка 1 элемент, ибо не недо учитывать periodId = 0
						list.length - 1 === periodLength ?
							_repartition(true, type, room.id, false) :
							_repartition(false, type, room.id, false);
					}
				});
				break;

			case 'price':

				var min = data[0],
					max = data[1];

				_.forEach(_this.rooms, function(room) {
					room.price >= min && max >= room.price  ?
						_repartition(true, type, room.id, false) :
						_repartition(false, type, room.id, false);
				});
				break;

			case 'distance':
				_.forEach(_this.rooms, function(room) {
					room.distance <= data ?
						_repartition(true, type, room.id, false) :
						_repartition(false, type, room.id, false);
				});

				break;

			case 'options':
				var option = data[0],
					bool = data[1];

				_.forEach(_this.rooms, function(room) {

					if (bool) {

						if (_.indexOf(room.options, option) !== -1 || _.indexOf(room.bathhouse.options, option) !== -1) {
							_repartition(true, type, room.id, true);
						}
						else if (_.indexOf(room.options, option) === -1 && _.indexOf(room.bathhouse.options, option) === -1) {
							_repartition(false, type, room.id, true);
						}
					}
					else {
						if (_.indexOf(room.options, option) === -1) {
							_repartition(true, type, room.id, false);
						}
					}
				});

				break;

			case 'types':
				var kind = data[0],
					bool = data[1];

				_.forEach(_this.rooms, function(room) {

					if (bool) {

						if (_.indexOf(room.types, kind) !== -1) {
							_repartition(true, type, room.id, true);
						}
						else {
							_repartition(false, type, room.id, true);
						}
					}
					else {

						if (_.indexOf(room.types, kind) === -1) {
							_repartition(true, type, room.id, false);
						}
					}
				});

				break;

			case 'prepayment':

				var bool = data;

				if (_.isUndefined(bool)) {
					_.forEach(_this.rooms, function(room) {
						_repartition(true, type, room.id, false);
					});
				}
				else {
					_.forEach(_this.rooms, function(room) {

						if (bool) {

							if (room.settings.prepayment) {
								_repartition(true, type, room.id, false);
							}
							else {
								_repartition(false, type, room.id, false);
							}
						}
						else {

							if (!room.settings.prepayment) {
								_repartition(true, type, room.id, false);
							}
							else {
								_repartition(false, type, room.id, false);
							}
						}
					});
				}
				break;

			case 'name':
				var bathhouseName = data.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/),
					reg = new RegExp(bathhouseName.join('|'),'i');

				_.forEach(_this.rooms, function(room) {

					if (reg.test(room.name) || reg.test(room.bathhouse.name)) {
						_repartition(true, type, room.id, false);
					}
					else {
						_repartition(false, type, room.id, false);
					}
				});
				break;
		}

		$rootScope.$emit('dataStorage:updateRooms', _this.includedRooms); // -> list && map
		$rootScope.$emit('dataStorage:updateOffersCount', _.size(_this.includedRooms)); // -> filter
	}

	/**
	 * @desc  В зависимости от isTrue, добавляем или исключаем баню из массивов(excluded, included)
	 * @param {boolean} isTrue - выражение истино, фактически говорящее, что рума проходит по фильтру
	 * @param {string}  type - тип фильтра
	 * @param {number}  id  - id бани
	 * @param {boolean} isMulti - если true, то по данному типу баня может попадать в исключения несколько раз, например с опциями, или по типу бани
	 */
	function _repartition(isTrue, type, id, isMulti) {

		if (isTrue) {
			if (_.indexOf(storage.excludedRooms[type], id) !== -1 && !isMulti) {
				storage.excludedRooms[type].splice(_.indexOf(storage.excludedRooms[type], id), 1);
			}

			// Если данный id отсутствует во всех типах исключенных бань, то тогда его
			// можно добавить в includedRooms
			var existAnywhere = [];

			_.forEach(storage.excludedRooms, function(type, idx) {
				if (_.indexOf(storage.excludedRooms[idx], id) !== - 1) {
					existAnywhere.push(id);
				}
			});

			if (!existAnywhere.length && _.indexOf(storage.includedRooms, id) === -1) {
				storage.includedRooms.push(id);
			}
		}
		else {
			if (!isMulti) {
				if (_.indexOf(storage.excludedRooms[type], id) === -1) {
					storage.excludedRooms[type].push(id);
				}
			}
			else {
				storage.excludedRooms[type].push(id);
			}

			if (_.indexOf(storage.includedRooms, id) !== -1) {
				storage.includedRooms.splice(_.indexOf(storage.includedRooms, id), 1);
			}
		}
	}

	/**
	 * @desc  Сбрасываем бани из списка исключенных по определенному тегу/типу
	 * @param {string} tag - сам тег/тип
	 */
	function resetListByTag(tag) {

		var _this = this;

		_.forEach(_this.rooms, function(room) {

			// Чтобы не ломать _repartition, было решено продублировать его часть таким образом

			// Удаляем полностью данную руму по данному тегу/типу
			_.pull(_this.excludedRooms[tag], room.id);

			var existAnywhere = [];

			_.forEach(_this.excludedRooms, function(type, idx) {
				if (_.indexOf(_this.excludedRooms[idx], room.id) !== - 1) {
					existAnywhere.push(room.id);
				}
			});

			if (!existAnywhere.length && _.indexOf(_this.includedRooms, room.id) === -1) {
				_this.includedRooms.push(room.id);
			}
		});

		$rootScope.$emit('dataStorage:updateRooms', _this.includedRooms); // -> list && map
		$rootScope.$emit('dataStorage:updateOffersCount',_this.includedRooms.length); // -> filter
	}
	
	function _addProperties(room) {
		
		room.active = false;
		room.show = true;
		
		return room;
	}
}

module.exports = dataStorage;