'use strict';

var _ = require('lodash');
var moment = require('moment');

Schedule.$inject = ['$rootScope', '$compile'];

function Schedule($rootScope, $compile) {

	var now = moment().format('YYYY-MM-DD'),
		itemsLength = undefined,

	// Так как прокрутка в owl-carousel работает некорректно для merge ячеек, мы будем слайдить в обход ее,
	// поэтому фиксируем:
		currentSlide = undefined,       // текущую позицию карусели, индекс крайней левой видимой ячейки
		currentOrdersShift = undefined, // общее смещение относительно начала карусели с заказами
		currentTimeShift = undefined;   // общее смещение относительно начала карусели с временем

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: '<div class="schedule-panel"></div>',
		scope: {
			orders: '=orders',
			roomId: '=roomId',
			minDuration: '=minDuration',
			changePosition: '=changePosition',

			showOrder: '&showOrder',
			getOrders: '&getOrders',
			newOrder: '&newOrder'
		},
		link: function($scope, $element) {

			var itemsIndexes, itemsPeriods, // каждая ячейка карусели будет рассписываться в массиве индексов и периодов

				visibleItemsLength,// Количество ячеек всего за исключением, той части, что остается видимой всегда

			// Забираем ширину ячейки, и настройки влияющие на анимацию
				itemOrderWidth,
				itemTimeWidth,

			// Эти флаги просто дублирование настроек owl-carousel, необходимы для animateScroll
				support3d,
				isTouch;

			// данные о заказе, который на данный момент создает манагер
			var newOrder = {
				roomId: undefined,
				startDate: undefined,
				endDate: undefined,
				startPeriodId: undefined,
				endPeriodId: undefined
			};

			var startOrderIndex;

			var lessMinDuration = false,  // флаг, на случай если расстояние между заказами меньше min_duration

				skip = 0,                   // при построении карусели, когда будет текущий период попадать на начало заказа,
			                              // высчитываем его продолжительность, именно столько раз надо будет пропустить
			                              // все последующие итерации

				tempDisabledCellsIndex = [],// при первом клике(начало заказа) мы будем фиксировать индексы ячеек, которые лежат
			                              // на удалении меньше, чем minDuration

				moveLeftFromStart = false,  // указываем в какую сторону повел манагер после начала оформления начала заказа

				mouseMoveIndexes = [],      // при начале оформления заказа, фиксируем здесь ячейки, которые встречаются по ходу
			                              // вождения мышкой по ячейкам
				isOdd = true,

				$owlOrdersContainer = $('<div class="owl-orders"></div>'),
				$owlTimeContainer = $('<div class="owl-time"></div>'),

				$orderItem,
				$timeItem,

				$owlOrdersStage,
				$owlTimeStage;

			// Поехали! Создаем просто каркас самой карусели с заказами и временем
			init();

			function init() {

				$element.append($owlTimeContainer);
				$element.append($owlOrdersContainer);
				$compile($element)($scope);

				$owlTimeContainer.owlCarousel({
					responsiveClass: true,
					items: 24,
					nav: false,
					merge: true,
					//stagePadding: 20,
					//mergeFit: false,
					dots: false,
					responsive: {
						1024: {
							items: 16
						},
						1400: {
							items: 24
						}
					},
					onInitialized: function() {

						isTouch = this.state.isTouch;
						support3d = this.support3d;

						$owlTimeStage = this.$stage[0];

						if (_.isUndefined(currentSlide)) {
							itemsLength = this.settings.items;
							currentSlide = 0;
							currentOrdersShift = 0;
							currentTimeShift = 0;
						}
					},
					onRefreshed: function() {

						_.forEach(this._items, function($item, idx) {

							if (idx % 2 === 0) {

								$($item).css('margin-left', -1);
							}
						});

						visibleItemsLength = _.size($scope.orders) * 48 - this.settings.items;

						itemsLength = this.settings.items;

						itemTimeWidth = (this._width / this.settings.items).toFixed(3);
					}
				});

				$owlOrdersContainer.owlCarousel({
					responsiveClass: true,
					items: 24,
					merge: true,
					nav: false,
					//loop: true,
					//margin: 10,
					//stagePadding: 25,
					mergeFit: false,
					dots: false,
					responsive: {
						1024: {
							items: 16
						},
						1400: {
							items: 24
						}
					},
					onInitialized: function () {
						$owlOrdersStage = this.$stage[0];

						/*$owlOrdersStage.addEventListener('click', function(e) {
						 actionOrder(e);
						 }, false);*/

						/*$owlOrdersStage.addEventListener('mouseover', function(e) {
						 actionMouseMove(e);
						 }, false);

						 $owlOrdersStage.addEventListener('mouseout', function(e) {
						 actionMouseMove(e);
						 }, false);*/
					},
					onRefreshed: function() {
						itemsIndexes = this._mergers;
						itemsPeriods = [];

						_.reduce(itemsIndexes, function(sum, num) {
							sum += num * 3;
							itemsPeriods.push(sum);
							return sum;
						}, 0);

						itemOrderWidth = (this._width / this.settings.items).toFixed(3);
					}
				});

				$owlOrdersContainer.on('mousewheel', '.owl-stage', function(e) {

					var dateDiff, nextDate, prevDate;

					if (e.deltaY > 0) {

						if (currentSlide < visibleItemsLength) {

							currentSlide++;
							currentOrdersShift -= parseFloat(itemOrderWidth);
							currentTimeShift -= parseFloat(itemTimeWidth);

							if ((currentSlide - itemsLength) % 48 === 0) {

								dateDiff = ((currentSlide - itemsLength) / 48);
								nextDate = moment(now).add(dateDiff + 1, 'days').format('YYYY-MM-DD');

								if (_.indexOf(_.keys($scope.orders), nextDate) === -1) {
									$scope.$emit('getNextPrevDateOrders', nextDate);
								}
							}
							else if (currentSlide % 48 === 0) {

								dateDiff = ((currentSlide - itemsLength) / 48);
								nextDate = moment(now).add(dateDiff + 1, 'days').format('YYYY-MM-DD');

								$scope.$emit('timeCalendarCarousel:setDate', nextDate);
							}

							$scope.$emit('scrollAllRooms');
						}
					}
					else {

						if (currentSlide > 0) {

							currentSlide--;
							currentOrdersShift += parseFloat(itemOrderWidth);
							currentTimeShift += parseFloat(itemTimeWidth);

							if ((currentSlide + 1) % 48 === 0) {

								dateDiff = currentSlide / 48;
								prevDate = moment(now).add(dateDiff, 'days').format('YYYY-MM-DD');

								$scope.$emit('timeCalendarCarousel:setDate', prevDate);
							}

							$scope.$emit('scrollAllRooms');
						}
					}

					e.preventDefault();
				});
			}

			var addDays = function(dates) {

				_.forEach(dates, function (date, dateIdx) {

					var startPeriodsId = _
						.chain($scope.orders[date])
						.pluck('startPeriod')
						.map(function (periodId) {
							return parseInt(periodId, 10);
						})
						.value();

					var endPeriodsId = _
						.chain($scope.orders[date])
						.pluck('endPeriod')
						.map(function (periodId) {
							return periodId - 3;
						})
						.value();

					_.forEach(_.range(0, 144, 3), function (periodId, idx, self) {

						// Сперва выстраиваем временнУю линию
						var showTime = periodId,
							$owlItem;

						$timeItem = isOdd ?
							$('<div class="time-item left">' + showTime + '</div>') :
							$('<div class="time-item right"></div>');

						$owlItem = $('<div class="owl-item"></div>');
						$owlItem.append($timeItem);
						$owlTimeContainer.trigger('add', [$owlItem]);

						isOdd = !isOdd;

						// Затем саму карусель с заказами
						var startOrderIndex = _.indexOf(startPeriodsId, periodId);

						// Данная ячейка не относится к заказу
						if (skip === 0) {

							// Данная ячейка является началом заказа
							if (startOrderIndex !== -1) {

								lessMinDuration = false;

								var order = _.find($scope.orders[date], function (order) {
									return order.startPeriod == periodId;
								});

								// Определяем через манагера или через сайт был создан заказ
								var className = order.managerId ? 'item manager-order' : 'item service-order',
									orderDuration;

								// Если заявка двухдневная, пересчитываем продолжительность
								if (!order.oneDay && date !== _.last(dates) && order.startPeriod !== 0) {

									var nextDay = moment(date).add(1, 'days').format('YYYY-MM-DD');
									var endNextDayOrderPeriod = parseInt($scope.orders[nextDay][0].endPeriod);

									orderDuration = (144 - startPeriodsId[startOrderIndex] + endNextDayOrderPeriod) / 3;

								}
								else {
									orderDuration = (endPeriodsId[startOrderIndex] - startPeriodsId[startOrderIndex] + 3) / 3;
								}

								skip = orderDuration - 1;

								if (!_.isUndefined(startPeriodsId[startOrderIndex + 1])) {
									var durationBetweenOrders = startPeriodsId[startOrderIndex + 1] - endPeriodsId[startOrderIndex] - 3;
									lessMinDuration = durationBetweenOrders < $scope.minDuration && durationBetweenOrders !== 0;
								}

								$orderItem = $('<div data-order="' + order.id + '" class="' + className + '" ' +
								'data-merge="' + orderDuration + '"></div>');

								$owlItem = $('<div class="owl-item"></div>');
								$owlItem.append($orderItem);
								$owlOrdersContainer.trigger('add', [$owlItem]);
							}
							else {
								$orderItem = $('<div class="item" data-merge="1"></div>');

								if (lessMinDuration) {
									$orderItem.addClass('disabled');
								}

								$owlItem = $('<div class="owl-item"></div>');
								$owlItem.append($orderItem);
								$owlOrdersContainer.trigger('add', [$owlItem]);
							}
						}
						else {
							skip--;
						}
					});
				});

				$owlTimeContainer.trigger('refresh');
				$owlOrdersContainer.trigger('refresh');
			};

			$scope.$watch('orders', function(newVal, oldVal) {

				if (!_.isUndefined(newVal)) {

					// Достраиваем только даты, которых еще нету в карусели
					var newDates = _.difference(_.keys(newVal), _.keys(oldVal));
					if (newDates.length) addDays(newDates);
				}
			}, true);

			$rootScope.$on('scrollAllRooms', function(event) {
				animateScrollStage.call($owlOrdersStage, currentOrdersShift);
				animateScrollStage.call($owlTimeStage, currentTimeShift);
			});

			function animateScrollStage(coordinate) {
				if (support3d) {
					$(this).css({
						transform: 'translate3d(' + coordinate + 'px' + ', 0px, 0px)',
						transition: (250 / 1000) + 's'
					});
				}
				else if (isTouch) {
					this.css({
						left: coordinate + 'px'
					});
				}
				else {
					this.animate({
						left: coordinate
					}, 250 / 1000);
				}
			}
		}
	}
}

module.exports = Schedule;