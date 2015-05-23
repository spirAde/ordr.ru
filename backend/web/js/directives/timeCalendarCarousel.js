(function() {
	'use strict';

	angular
		.module('time-calendar-carousel-directive', [
      'period-to-time-filter'
    ])
		.directive('timeCalendarCarousel', timeCalendarCarousel);

	timeCalendarCarousel.$inject = ['$filter', '$compile', '$rootScope', '$window', '$document', 'orderservice'];

	function timeCalendarCarousel($filter, $compile, $rootScope, $window, $document, orderservice) {

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
			scope: {
				orders: '=orders',
        roomId: '=roomId',
        minDuration: '=minDuration',
        changePosition: '=changePosition',

        showOrder: '&showOrder',
        getOrders: '&getOrders',
        newOrder: '&newOrder'
			},
			template: '<div class="timecalendar-carousel"></div>',
      controller: function() {
        this.getTime = function(periodId) {
          return $filter('periodToTime')(periodId);
        }
      },
			link: function(scope, element, attrs, controller) {

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
          roomId:         undefined,
          startDate:      undefined,
          endDate:        undefined,
          startPeriodId:  undefined,
          endPeriodId:    undefined
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

          $owlOrdersContainer = angular.element('<div class="owl-orders"></div>'),
          $owlTimeContainer = angular.element('<div class="owl-time"></div>'),

          $orderItem,
          $timeItem,

          $owlOrdersStage,
          $owlTimeStage;

        // Поехали! Создаем просто каркас самой карусели с заказами и временем
        init();

        // Все взаимодействие с заказами, и ячейками по клику происходят тут
        var actionOrder = function(e) {
          var elem = e.target,
            dataset = elem.dataset,
            elemIndex;

          // Данная ячейка является заказом
          if (dataset.order) {
            elemIndex = $(elem.parentNode).index();

            // callback на удаление
            scope.showOrder({roomId: scope.roomId, orderId: dataset.order, callback: function(response) {
              if (response === 200) {
                unmergeItems(dataset.order, elemIndex);
              }
            }});
          }
          else if (!elem.classList.contains('disabled') && elem.classList.contains('item')) {

            elemIndex = $(elem.parentNode).index();

            // Первый клик говорит нам о начале создания заказа
            if (_.isUndefined(newOrder.startDate)) {

              var startOrderData = convertIndexToDateAndPeriodId(elemIndex);
              startOrderIndex = elemIndex;

              newOrder.roomId = scope.roomId;
              newOrder.startDate = startOrderData.date;
              newOrder.startPeriodId = startOrderData.periodId;

              // Так же в зависимости от minDuration закрашиваем соседние ячейки в disabled
              for (var i = elemIndex, lenR = elemIndex + (parseInt(scope.minDuration) / 3) - 1; i < lenR; i++) {
                if (!dataset.order) {
                  tempDisabledCellsIndex.push(i);
                  $($owlOrdersStage)
                    .find('div.owl-item:eq(' + i + ')')
                    .children()
                    .addClass('disabled');
                }
              }

              for (var j = elemIndex, lenL = elemIndex - (parseInt(scope.minDuration) / 3); j > lenL; j--) {
                if (!dataset.order) {
                  tempDisabledCellsIndex.push(j);
                  $($owlOrdersStage)
                    .find('div.owl-item:eq(' + j + ')')
                    .children()
                    .addClass('disabled');
                }
              }

              // Несмотря на то, что ячейка disabled, красим в manager-order для визуальности
              /*$($owlOrdersStage)
                .find('div.owl-item:eq(' + elemIndex + ')')
                .children()
                .addClass('manager-order');*/
            }

            // О времени окончания
            else if (!_.isUndefined(newOrder.startDate) && _.isUndefined(newOrder.endDate)) {

              var endOrderData = convertIndexToDateAndPeriodId(elemIndex);

              newOrder.endDate = endOrderData.date;
              newOrder.endPeriodId = endOrderData.periodId + 3;

              _(tempDisabledCellsIndex).forEach(function(idx) {
                $($owlOrdersStage)
                  .find('div.owl-item:eq(' + idx + ')')
                  .children()
                  .removeClass('disabled');
              });

              tempDisabledCellsIndex = [];

              // проверяем, чтобы манагер не сделал заказ в обратном порядке, то есть startDate/startPeriodId и
              // endDate/endPeriodId не были поменяны местами, исправляем:
              if (moment(newOrder.startDate).isSame(newOrder.endDate)) {

                if (newOrder.startPeriodId > newOrder.endPeriodId) {
                  var tmp = newOrder.endPeriodId;
                  newOrder.endPeriodId = newOrder.startPeriodId + 3;
                  newOrder.startPeriodId = tmp - 3;
                }
              }
              else if (moment(newOrder.endDate).isBefore(newOrder.startDate)) {
                var tmp = newOrder.endDate;
                newOrder.endDate = newOrder.startDate;
                newOrder.startDate = tmp;
              }

              scope.newOrder({order: newOrder, callback: function(response) {

                if (response.status === 200) {

                  mergeItems(newOrder.startDate, newOrder.startPeriodId,
                    newOrder.endDate, newOrder.endPeriodId - 3, response.data.id);
                }

                newOrder = {
                  roomId:         undefined,
                  startDate:      undefined,
                  endDate:        undefined,
                  startPeriodId:  undefined,
                  endPeriodId:    undefined
                };
              }});
            }
          }
        };

        var actionMouseMove = function(e) {
/*          if (e.target.classList.contains('item')) {
            console.log(e);
          }*/
          if (!_.isUndefined(newOrder.startDate)) {
            if (e.target.classList.contains('item')) {

              var elem = e.target,
                dataset = elem.dataset,
                elemIndex =  $(elem.parentNode).index();

              if (startOrderIndex < elemIndex) {
                console.log('right');
                if (e.type === 'mouseover') {

                }
                else if (e.type === 'mouseout') {
                  //console.log('out', elemIndex);
                }
              }
              else if (startOrderIndex > elemIndex) {
                console.log('left');
                if (e.type === 'mouseover') {

                }
                else if (e.type === 'mouseout') {
                  //console.log('out', elemIndex);
                }
              }
            }
          }
        };

        // В зависимости, от того как будут приходить данные будем достраивать дополнительные дни в каруселях
        var addDays = function(dates) {

          _(dates).forEach(function(date, dateIdx) {

            var startPeriodsId = _
              .chain(scope.orders[date])
              .flatten('time_from')
              .map(function(periodId) { return parseInt(periodId, 10); })
              .value();

            var endPeriodsId = _
              .chain(scope.orders[date])
              .flatten('time_to')
              .map(function(periodId) { return periodId - 3; })
              .value();

            _(_.range(0, 144, 3)).forEach(function(periodId, idx, self) {

              // Сперва выстраиваем временнУю линию
              var showTime = controller.getTime(periodId),
                $owlItem;

              $timeItem = isOdd ?
              angular.element('<div class="time-item left">' + showTime + '</div>') :
              angular.element('<div class="time-item right"></div>');

              $owlItem = angular.element('<div class="owl-item"></div>');
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

                  var order = _.find(scope.orders[date], function(order) { return order.time_from == periodId; });

                  // Определяем через манагера или через сайт был создан заказ
                  var className = order.through_site ? 'item service-order' : 'item manager-order',
                    orderDuration;

                  // Если заявка двухдневная, пересчитываем продолжительность
                  if (!order.one_day && date !== _.last(dates) && order.time_from !== 0) {
                    var nextDay = moment(date).add(1, 'days').format('YYYY-MM-DD');
                    var endNextDayOrderPeriod = parseInt(scope.orders[nextDay][0].time_to);

                    orderDuration = (144 - startPeriodsId[startOrderIndex] + endNextDayOrderPeriod) / 3;
                  }
                  else {
                    orderDuration = (endPeriodsId[startOrderIndex] - startPeriodsId[startOrderIndex] + 3) / 3;
                  }

                  skip = orderDuration - 1;

                  if (!_.isUndefined(startPeriodsId[startOrderIndex + 1])) {
                    var durationBetweenOrders = startPeriodsId[startOrderIndex + 1] - endPeriodsId[startOrderIndex] - 3;
                    lessMinDuration = durationBetweenOrders < scope.minDuration && durationBetweenOrders !== 0;
                  }

                  $orderItem = angular.element('<div data-order="' + order.id + '" class="' + className + '" ' +
                  'data-merge="' + orderDuration + '"></div>');

                  $owlItem = angular.element('<div class="owl-item"></div>');
                  $owlItem.append($orderItem);
                  $owlOrdersContainer.trigger('add', [$owlItem]);
                }
                else {
                  $orderItem = angular.element('<div class="item" data-merge="1"></div>');

                  if (lessMinDuration) {
                    $orderItem.addClass('disabled');
                  }

                  $owlItem = angular.element('<div class="owl-item"></div>');
                  $owlItem.append($orderItem);
                  $owlOrdersContainer.trigger('add', [$owlItem]);
                }
              }
              else {
                skip--;
              }
            });
          });

          // Важный момент! При добавлении новых дней с заказами, может получиться ситуация такая:
          // Что до добавления новых дней, самая последняя ячейка была заказом с флагом one_day = false,
          // но в силу того, что она последняя она обрезается на времени 00:00, так как мы добавляем новые дни,
          // следовательно самая первая ячейка в новых днях будет продолжением недостроенной последней(до добавления)
          // Значит, нам надо поменять data-merge у последней ячейки(недостроенной), а новосозданное продолжение удалить
          /*var firstDate = _.first(dates),
            firstOrder = scope.orders[firstDate][0];

          if (firstOrder) {

            if (parseInt(firstOrder.time_from) === 0 && !firstOrder.one_day) {

              var prevDate = moment(firstDate).subtract(1, 'days').format('YYYY-MM-DD'),
                lastOrder = _.last(scope.orders[prevDate]);

              var totalDuration = (144 - parseInt(lastOrder.time_from) + parseInt(firstOrder.time_to)) / 3,
                thatIndex = convertPeriodIdToIndex(firstDate, 0);

              $owlOrdersContainer.trigger('delete', [thatIndex + 1]);
              $owlOrdersContainer.trigger('delete', [thatIndex]);

              var className = lastOrder.through_site ? 'item service-order' : 'item manager-order';

              $orderItem = angular.element('<div data-order="' + lastOrder.id + '" class="' + className + '" ' +
                'data-merge="' + totalDuration + '"></div>');

              var $owlItem = angular.element('<div class="owl-item"></div>');
              $owlItem.append($orderItem);
              $owlOrdersContainer.trigger('add', [$owlItem, thatIndex]);
             }
          }*/

          // Обязательно перегружаем карусели, для пересчета всех индексов
          $owlTimeContainer.trigger('refresh');
          $owlOrdersContainer.trigger('refresh');
        };

        // Объединение ячеек в зависимости от заказа
        var mergeItems = function(startDate, startPeriodId, endDate, endPeriodId, orderId) {

          // Находим начальный, конечный индесы заказа, и продолжительность
          var firstIndex = convertPeriodIdToIndex(startDate, startPeriodId + 3),
            secondIndex = convertPeriodIdToIndex(endDate, endPeriodId + 3),
            duration = secondIndex - firstIndex + 1;

          // Удаляем все ячейки, которые относятся к выделенной области
          for (var i = firstIndex; i <= secondIndex; i++) {
            $owlOrdersContainer.trigger('delete', [firstIndex]);
          }

          var $owlItem = angular.element('<div class="owl-item"></div>'),
            $newItem = angular.element('' +
              '<div class="item manager-order" data-merge="' + duration + '" data-order="' + orderId + '">' +
              '</div>' +
            '');

          $owlItem.append($newItem);

          // ... и вставляем, перезагружаем
          $owlOrdersContainer.trigger('add', [$owlItem, firstIndex]).trigger('refresh');

          //Смотрим, чтобы расстояние до ближайшего заказа не было меньше min_duration
          var rightIndexes = itemsIndexes.slice(firstIndex + 1, firstIndex + (parseInt(scope.minDuration) / 3) + 1),
            leftIndexes = (itemsIndexes.slice(firstIndex - (parseInt(scope.minDuration) / 3), firstIndex)).reverse();

          var closestRightOrderIndex = [], closestLeftOrderIndex = [];

          _(rightIndexes).forEach(function(idx) {
            if (idx > 1) return false;

            closestRightOrderIndex.push(idx);
          });

          _(leftIndexes).forEach(function(idx) {
            if (idx > 1) return false;

            closestLeftOrderIndex.push(idx);
          });

          if (closestRightOrderIndex.length !== (parseInt(scope.minDuration) / 3)) {
            _(closestRightOrderIndex).forEach(function(idx, key) {
              $($owlOrdersStage)
                .find('div.owl-item:eq(' + (firstIndex + key + 1) + ')')
                .children()
                .addClass('disabled');
            });
          }

          if (closestLeftOrderIndex.length !== (parseInt(scope.minDuration) / 3)) {
            _(closestLeftOrderIndex).forEach(function(idx, key) {
              $($owlOrdersStage)
                .find('div.owl-item:eq(' + (firstIndex - key - 1) + ')')
                .children()
                .addClass('disabled');
            });
          }
        };

        // Разъединение ячеек в зависимости от заказа
        var unmergeItems = function(orderId, orderIndex) {

          var duration = $($owlOrdersStage)
            .find('div.owl-item:eq(' + orderIndex + ')')
            .children()
            .data('merge');

          $owlOrdersContainer.trigger('delete', [orderIndex]);

          for (var i = orderIndex, len = orderIndex + duration - 1; i <= len; i++) {
            var $owlItem = angular.element('<div class="owl-item"></div>'),
              $newItem = angular.element('<div class="item " data-merge="1"></div>');

            $owlItem.append($newItem);
            $owlOrdersContainer.trigger('add', [$owlItem, i]);
          }

          $owlOrdersContainer.trigger('refresh');

          //Очищаем ближайшие ячейки от disabled
          var closestLeftIndexes = _.range(orderIndex + 1 - scope.minDuration / 3, orderIndex),
            closestRightIndexes = _.range(orderIndex + duration, (orderIndex + duration - 1) + scope.minDuration / 3);

          _(closestRightIndexes).forEach(function(idx) {
            $($owlOrdersStage)
              .find('div.owl-item:eq(' + idx + ')')
              .children()
              .removeClass('disabled');
          });

          _(closestLeftIndexes).forEach(function(idx) {
            $($owlOrdersStage)
              .find('div.owl-item:eq(' + idx + ')')
              .children()
              .removeClass('disabled');
          });
        };

        var convertPeriodIdToIndex = function(date, periodId) {
          var datesDiff = moment(date).diff(moment(now), 'days'),
            currPeriodId = datesDiff * 144 + periodId;

          return _.indexOf(itemsPeriods, currPeriodId);
        };

        var convertIndexToDateAndPeriodId = function(index) {
          var interval = itemsIndexes.slice(0, index);

          var periodsSumm = _.reduce(interval, function(sum, num) {
            return sum + num;
          }, 0);

          var fullDays = Math.floor(periodsSumm / 48);
          return {
            date: moment(now).add(fullDays, 'days').format('YYYY-MM-DD'),
            periodId: (periodsSumm - fullDays * 48) * 3
          }
        };

        function animateScrollStage(coordinate) {
          if (support3d) {
            $(this).css({
              transform: 'translate3d(' + coordinate + 'px' + ',0px, 0px)',
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

        scope.$watch('orders', function(newVal, oldVal) {

          if (!_.isUndefined(newVal)) {

            // Достраиваем только даты, которых еще нету в карусели
            var newDates = _.difference(_.keys(newVal), _.keys(oldVal));
            if (newDates.length) addDays(newDates);
          }
        }, true);

        scope.$watch('changePosition', function(newVal) {
          if (!_.isUndefined(newVal) && scope.roomId == newVal.roomId) {
            var currIndex = convertPeriodIdToIndex(newVal.startDate, newVal.startPeriodId);

            currentSlide = currIndex;
            currentOrdersShift = -currIndex * itemOrderWidth;
            currentTimeShift = -currIndex * itemTimeWidth;

            scope.$emit('scrollAllRooms');
          }
        });

        $rootScope.$on('scrollAllRooms', function(event) {
          animateScrollStage.call($owlOrdersStage, currentOrdersShift);
          animateScrollStage.call($owlTimeStage, currentTimeShift);
        });

        $rootScope.$on('datepaginator:changeDate', function(event, date) {

          var datesDiff = moment(date).diff(moment(now), 'days');

          if (_.indexOf(_.keys(scope.orders), date) === -1) {
            var lastDate = moment(_.last(_.keys(scope.orders))).add(1, 'days').format('YYYY-MM-DD');

            scope.getOrders({roomId: scope.roomId, startDate: lastDate, endDate: date});
          }

          currentSlide = datesDiff * 48;
          currentOrdersShift = -currentSlide * itemOrderWidth;
          currentTimeShift = -currentSlide * itemTimeWidth;

          scope.$emit('scrollAllRooms');
        });

        $rootScope.$on('getNextPrevDateOrders', function(event, date) {
          scope.getOrders({roomId: scope.roomId, startDate: date, endDate: date});
        });

        function init() {

          element.append($owlTimeContainer);
          element.append($owlOrdersContainer);
          $compile(element)(scope);

          $owlTimeContainer.owlCarousel({
            responsiveClass:true,
            items: 24,
            nav:false,
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

              _(this._items).forEach(function($item, idx) {
                if (idx % 2 === 0) {
                  $($item).css('margin-left', -1);
                }
              });

              visibleItemsLength = _.size(scope.orders) * 48 - this.settings.items;
              itemsLength = this.settings.items;
              itemTimeWidth = (this._width / this.settings.items).toFixed(3);
            }
          });

          $owlOrdersContainer.owlCarousel({
            responsiveClass: true,
            items: 24,
            nav: false,
            merge: true,
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
            onInitialized: function() {
              $owlOrdersStage = this.$stage[0];

              $owlOrdersStage.addEventListener('click', function(e) {
                actionOrder(e);
              }, false);

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

          $owlOrdersContainer.on('mousewheel', '.owl-stage', function (e) {

            var dateDiff, nextDate, prevDate;

            if (e.deltaY > 0) {
              if (currentSlide < visibleItemsLength) {
                currentSlide++;
                currentOrdersShift -= parseFloat(itemOrderWidth);
                currentTimeShift -= parseFloat(itemTimeWidth);

                if ((currentSlide - itemsLength) % 48 === 0) {
                  dateDiff = ((currentSlide - itemsLength) / 48);
                  nextDate = moment(now).add(dateDiff + 1, 'days').format('YYYY-MM-DD');

                  if (_.indexOf(_.keys(scope.orders), nextDate) === -1) {
                    scope.$emit('getNextPrevDateOrders', nextDate);
                  }
                }
                else if (currentSlide % 48 === 0) {
                  dateDiff = ((currentSlide - itemsLength) / 48);
                  nextDate = moment(now).add(dateDiff + 1, 'days').format('YYYY-MM-DD');

                  scope.$emit('timeCalendarCarousel:setDate', nextDate);
                }

                scope.$emit('scrollAllRooms');
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

                  scope.$emit('timeCalendarCarousel:setDate', prevDate);
                }

                scope.$emit('scrollAllRooms');
              }
            }

            e.preventDefault();
          });
        }
      }
		}
	}

}());