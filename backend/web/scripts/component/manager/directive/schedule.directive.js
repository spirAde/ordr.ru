'use strict';

var _ = require('lodash');
var moment = require('moment');
var Hamster = require('hamsterjs');

Schedule.$inject = ['$rootScope', '$document', '$window', '$compile', 'CONSTANTS'];

function Schedule($rootScope, $document, $window, $compile, CONSTANTS) {

	var ESC_KEY = 27;

	var options = {
		margin: 0,
		responsive: [{breakpoint: 800, items: 12}, {breakpoint: 1024, items: 16}, {breakpoint: 1600, items: 24}],
		scrollItems: 3
	};

	var template = {

		panel: '<div class="schedule-panel schedule-carousel schedule-loaded"></div>',

		stageOuter: '<div class="schedule-stage-outer"></div>',
		stageOrder: '<div class="order-stage"></div>',
		stageTime: '<div class="time-stage"></div>',

		itemOuter: '<div class="schedule-item"></div>',
		itemOrder: '<div class="order-item"></div>',
		itemTime: '<div class="time-item"></div>'
	};

	var orderItemClasses = {
		service: 'service-order',
		manager: 'manager-order'
	};
	
	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: template.panel,
		scope: {
			orders: '=orders',
			roomId: '=roomId',
			minDuration: '=minDuration',
			currentDate: '=currentDate',

			showOrder: '&showOrder',
			getOrders: '&getOrders',
			createOrder: '&createOrder'
		},
		link: function($scope, $element) {

			var $stageOuter, $stageOrder, $stageTime;

			var viewportItems = 0;  // items contains in viewport
			var totalWidth = 0;     // total width of all elements
			var dayWidth = 0;       // total width of elements for one day
			var itemWidth = 0;      // one element width
			var shift = 0;          // shift when scrolling in pixels
			var transform = 0;      // transform of carousel
			var current = 0;        // current single item position
			var totalItems = 0;     // total count of items
			var lastDate = '';
			var currentDate = '';

			var items = [];         // each cells with data
			var timeLineItems = [];

			var order = {
				roomId: $scope.roomId,
				startDate: '',
				endDate: '',
				startPeriod: undefined,
				endPeriod: undefined,

				startIndex: undefined,
				endIndex: undefined
			};

			$scope.$watch('orders', function(newVal, oldVal) {

				// First render
				if (_.isEmpty(newVal) && _.isEmpty(oldVal)) {

					_initialize();
					_subscribe();
					_preCalculate();
				}

				// New data
				else if (!_.isEmpty(newVal)) {

					// Build only new dates
					var newDates = _.difference(_.keys(newVal), _.keys(oldVal));

					if (newDates.length) {

						var data = _buildData(newDates);

						items = items.concat(data);

						_postCalculate();
						_renderOrder(data);
						_renderTime(newDates.length);
					}
				}
			}, true);

			$rootScope.$on('date-paginator:changeDate', function(event, data) {

				if (data.scroll) {

					var diff = moment(data.date).diff(moment().format('YYYY-MM-DD'), 'days');

					transform = -diff * 1000 * dayWidth / 1000;
					current = diff * 48;
					currentDate = data.date;

					_scroll();
				}
			});

			$rootScope.$on('schedule:changePosition', function(event, data) {

				if (data.id !== $scope.roomId) {

					_changePosition(data.delta, false);

					_scroll();
				}
			});


			// DOM manipulation

			function _initialize() {

				$stageOuter = angular.element(template.stageOuter);
				$stageOrder = angular.element(template.stageOrder);
				$stageTime = angular.element(template.stageTime);

				$stageOuter.append($stageTime);
				$stageOuter.append($stageOrder);
				$element.append($stageOuter);

				$compile($stageOuter)($scope);
			}

			function _subscribe() {

				Hamster($element[0]).wheel(function(event, delta) {

					event.preventDefault();

					_changePosition(delta, true);

					var scroll = _.throttle(_.bind(_scroll, this, delta), 750);

					scroll();
				});

				$stageOrder.bind('click', function(event) {

					event.preventDefault();

					var target = event.target;
					var classList = target.classList;

					var index = _.indexOf(this.children, target.parentElement);

					if (_.indexOf(classList, 'disabled') === -1) {

						if (_.indexOf(classList, orderItemClasses.service) !== -1) {

							_showOrder(target.dataset.order, index);
						}
						else if (_.indexOf(classList, orderItemClasses.manager) !== -1) {

							_showOrder(target.dataset.order, index);
						}
						else {

							_createOrder(index);
						}
					}
				});

				$document.bind('keydown keypress', function(event) {

					if (event.keyCode === ESC_KEY) {

						if (order.startDate && !order.endDate) {

							_resolveClosestItems(order.startIndex);
							_resetOrder();
						}
					}
				});
			}

			function _preCalculate() {

				var viewPort = $element.parent()[0].offsetWidth;
				var match = -1;
				var overwrites = options.responsive;

				_.forEach(overwrites, function(data) {

					if (data.breakpoint <= viewPort && data.breakpoint > match) {
						viewportItems = data.items;
					}
				});

				itemWidth = (viewPort / viewportItems).toFixed(3);

				shift = ((itemWidth * 1000 + options.margin * 1000) * options.scrollItems) / 1000;

				dayWidth = ((itemWidth * 1000 + options.margin * 1000) * 48) / 1000;

				var odd = true;

				_.forEach(_.range(0, 144, 3), function(periodId) {

					timeLineItems.push({
						time: odd ? CONSTANTS.periods[periodId] : null,
						margin: odd ? -1 : 0
					});

					odd = !odd;
				});

				currentDate = moment().format('YYYY-MM-DD');
			}

			function _postCalculate() {

				var dates = _.keys($scope.orders);

				totalItems = dates.length * 48;

				totalWidth = (_.sum(items, 'itemWidth') + 50).toFixed(3);

				lastDate = _.last(dates);
			}

			function _scroll() {

				$stageOuter.css({
					transform: 'translate3d(' + transform + 'px' + ',0px, 0px)',
					transition: (250 / 1000) + 's'
				});
			}

			function _buildData(dates) {

				var data = [];
				var skip = 0;
				var lessMinDuration = false;

				_.forEach(dates, function(date) {

					var orders = $scope.orders[date];

					var startPeriodsId = _
						.chain(orders)
						.pluck('startPeriod')
						.map(function(periodId) { return parseInt(periodId, 10); })
						.value();

					var endPeriodsId = _
						.chain(orders)
						.pluck('endPeriod')
						.map(function(periodId) { return periodId - 3; })
						.value();

					_.forEach(_.range(0, 144, 3), function(periodId) {

						var startOrderIndex = _.indexOf(startPeriodsId, periodId);

						// Данная ячейка не относится к заказу
						if (skip === 0) {

							// Данная ячейка является началом заказа
							if (startOrderIndex !== -1) {

								lessMinDuration = false;

								var order = _.find(orders, function(order) { return parseInt(order.startPeriod) === periodId});
								var orderDuration;

								if (!order.oneDay && date !== _.last(dates) && order.startPeriod !== 0) {

									var nextDay = moment(date).add(1, 'days').format('YYYY-MM-DD');

									var endNextDayOrderPeriod = parseInt($scope.orders[nextDay][0].endPeriod);

									orderDuration = (144 - parseInt(startPeriodsId[startOrderIndex]) + parseInt(endNextDayOrderPeriod)) / 3;
								}
								else {

									orderDuration = (parseInt(endPeriodsId[startOrderIndex]) - parseInt(startPeriodsId[startOrderIndex]) + 3) / 3;
								}

								skip = orderDuration - 1;

								if (!_.isUndefined(startPeriodsId[startOrderIndex + 1])) {

									var durationBetweenOrders = startPeriodsId[startOrderIndex + 1] - endPeriodsId[startOrderIndex] - 3;
									lessMinDuration = durationBetweenOrders < $scope.minDuration && durationBetweenOrders !== 0;
								}

								data.push({
									periodId: periodId,
									date: date,
									merge: orderDuration,
									itemWidth: (((parseInt(itemWidth * 1000) + parseInt(options.margin * 1000)) * orderDuration) / 1000).toFixed(3),
									lessMinDuration: lessMinDuration,
									throughSite: order.throughSite,
									orderId: order.id,
									oneDay: order.oneDay
								});
							}
							else {

								data.push({
									periodId: periodId,
									date: date,
									merge: 1,
									itemWidth: ((parseFloat(itemWidth * 1000) + parseInt(options.margin * 1000)) / 1000).toFixed(3),
									lessMinDuration: lessMinDuration,
									throughSite: null,
									orderId: null,
									oneDay: null
								});
							}
						}
						else {

							skip--;
						}
					});
				});

				return data;
			}

			function _renderTime(repeat) {

				_.forEach(_.range(0, repeat), function() {

					_.forEach(timeLineItems, function(timeItem) {

						var $itemTime = angular.element(template.itemTime);
						var $itemOuter = angular.element(template.itemOuter);

						if (timeItem.time) {

							$itemTime[0].innerHTML = timeItem.time;
							$itemTime.addClass('left');
						}
						else {

							$itemTime.addClass('right');
						}

						$itemOuter[0].style.width = itemWidth + 'px';
						$itemOuter[0].style.marginLeft = timeItem.margin + 'px';

						$itemOuter.append($itemTime);
						$stageTime.append($itemOuter);
					});
				});
			}

			function _renderOrder(data) {

				$stageOuter[0].style.width = totalWidth + 'px';

				_.forEach(data, function(item) {

					var $itemOrder = angular.element(template.itemOrder);
					var $itemOuter = angular.element(template.itemOuter);

					$itemOuter[0].style.width = item.itemWidth + 'px';

					var classes = [];

					if (item.orderId) $itemOrder.attr('data-order', item.orderId);

					if (!_.isNull(item.throughSite)) {

						item.throughSite ? classes.push('item service-order') : classes.push('item manager-order');
					}

					if (item.lessMinDuration) classes.push('disabled');

					$itemOrder
						.attr('data-merge', item.merge)
						.attr('data-period', item.periodId);

					$itemOrder.addClass(classes.join(' '));

					$itemOuter.append($itemOrder);
					$stageOrder.append($itemOuter);
				});

				if (!data[0].oneDay) {

					var allItemsLength = $stageOrder[0].childNodes.length;
					var newDatesItemsLength = data.length;

					if (allItemsLength !== newDatesItemsLength) {

						var needMergedElements = [
							$stageOrder[0].childNodes[allItemsLength - newDatesItemsLength - 1],
							$stageOrder[0].childNodes[allItemsLength - newDatesItemsLength]
						];

						var needMergedItems = [
							items[allItemsLength - newDatesItemsLength - 1],
							items[allItemsLength - newDatesItemsLength]
						];

						var item = {
							periodId: needMergedItems[0].periodId,
							date: needMergedItems[0].date,
							merge: _.sum(needMergedItems, 'merge'),
							itemWidth: _.sum(needMergedItems, 'itemWidth'),
							lessMinDuration: needMergedItems[0].lessMinDuration,
							throughSite: needMergedItems[0].throughSite,
							orderId: needMergedItems[0].orderId,
							oneDay: needMergedItems[0].oneDay
						};

						_.forEach(needMergedElements, function(element) {

							element.parentNode.removeChild(element);
						});

						_.pullAt(items, allItemsLength - newDatesItemsLength - 1);

						var $itemOrder = angular.element(template.itemOrder);
						var $itemOuter = angular.element(template.itemOuter);

						$itemOuter[0].style.width = item.itemWidth + 'px';

						var classes = [];

						if (item.orderId) $itemOrder.attr('data-order', item.orderId);

						if (!_.isNull(item.throughSite)) {

							item.throughSite ? classes.push('item service-order') : classes.push('item manager-order');
						}

						if (item.lessMinDuration) classes.push('disabled');

						$itemOrder
							.attr('data-period', item.periodId)
							.attr('data-merge', item.merge);

						$itemOrder.addClass(classes.join(' '));

						$itemOuter.append($itemOrder);

						$stageOrder[0].insertBefore($itemOuter[0], $stageOrder[0].children[allItemsLength - newDatesItemsLength - 1]);

						items[allItemsLength - newDatesItemsLength - 1] = item;
					}
				}
			}

			function _changePosition(delta, notify) {

				var shifting = shift * (-delta);
				var prev = current;

				transform = Math.min(transform + parseFloat(shifting), 0);
				transform = Math.max(transform, -totalWidth + viewportItems * itemWidth);

				current += options.scrollItems * (delta);
				current = Math.min(Math.max(current, 0), totalItems);

				// TODO: incorrect for fast scrolling, doesn't switch date in datepaginator
				if (current % 48 === 0 && delta > 0) {

					console.log('change on next date');

					currentDate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
					$scope.$emit('schedule:changeDate', {date: currentDate});
					
					if (moment(lastDate).diff(moment(currentDate), 'days') === 0) {

						_getOrders();
					}
				}
				else if (prev !== 0 && prev % 48 === 0 && delta < 0) {

					console.log('change on prev date');

					currentDate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
					$scope.$emit('schedule:changeDate', {date: currentDate});
				}

				if (notify) $scope.$emit('schedule:changePosition', {id: $scope.roomId, delta: delta});
			}

			function _rejectClosestItems(index) {

				var from = Math.max(index - ($scope.minDuration / 3) + 1, 0);
				var to = Math.min(index + ($scope.minDuration / 3) - 1, items.length);

				var childrenBefore = _.slice(_.toArray($stageOrder[0].childNodes), from, index);
				var childrenAfter = _.slice(_.toArray($stageOrder[0].childNodes), index, to);

				_.forEach(childrenBefore.reverse(), function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, orderItemClasses.service) !== -1 || _.indexOf(classes, orderItemClasses.manager) !== -1) return false;

					child.childNodes[0].className += ' disabled';
				});

				_.forEach(childrenAfter, function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, orderItemClasses.service) !== -1 || _.indexOf(classes, orderItemClasses.manager) !== -1) return false;

					child.childNodes[0].className += ' disabled';
				});
			}

			function _resolveClosestItems(index) {

				var from = Math.max(index - ($scope.minDuration / 3) + 1, 0);
				var to = Math.min(index + ($scope.minDuration / 3) - 1, items.length);

				var childrenBefore = _.slice(_.toArray($stageOrder[0].childNodes), from, index);
				var childrenAfter = _.slice(_.toArray($stageOrder[0].childNodes), index, to);

				_.forEach(childrenBefore.reverse(), function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, orderItemClasses.service) !== -1 || _.indexOf(classes, orderItemClasses.manager) !== -1) return false;

					child.childNodes[0].classList.remove('disabled');
				});

				_.forEach(childrenAfter, function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, orderItemClasses.service) !== -1 || _.indexOf(classes, orderItemClasses.manager) !== -1) return false;

					child.childNodes[0].classList.remove('disabled');
				});
			}

			function _checkClosestItemsAfterMerge(index) {

				var from = Math.max(index - ($scope.minDuration / 3), 0);
				var to = Math.min(index + ($scope.minDuration / 3) + 1, items.length);

				var childrenBefore = _.slice(_.toArray($stageOrder[0].childNodes), from, index);
				var childrenAfter = _.slice(_.toArray($stageOrder[0].childNodes), index + 1, to);

				var before = [];
				var after = [];

				_.forEach(childrenBefore.reverse(), function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, orderItemClasses.service) !== -1 || _.indexOf(classes, orderItemClasses.manager) !== -1) {

						return false;
					}

					before.push(child.childNodes[0]);
				});

				_.forEach(childrenAfter, function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, orderItemClasses.service) !== -1 || _.indexOf(classes, orderItemClasses.manager) !== -1) {

						return false;
					}

					after.push(child.childNodes[0]);
				});

				// If previous cells length less than minDuration
				if (before.length !== $scope.minDuration / 3) {

					_.forEach(before, function(child) {

						var classes = child.classList;

						if (_.indexOf(classes, 'disabled') === -1) {

							child.className += ' disabled';
						}
					});
				}

				// Clear temporary disable
				else {

					_.forEach(before, function(child) {

						child.classList.remove('disabled');
					});
				}

				if (after.length !== $scope.minDuration / 3) {

					_.forEach(after, function(child) {

						var classes = child.classList;

						if (_.indexOf(classes, 'disabled') === -1) {

							child.className += ' disabled';
						}
					});
				}
			}

			function _mergeItems() {

				var duration = order.endIndex - order.startIndex + 1;

				var item = {
					periodId: order.startPeriod,
					date: order.startDate,
					merge: duration,
					itemWidth: (((parseInt(itemWidth * 1000) + parseInt(options.margin * 1000)) * duration) / 1000).toFixed(3),
					lessMinDuration: false,
					throughSite: false,
					orderId: null
				};

				_.forEach(_.range(order.startIndex, order.endIndex + 1), function() {

					var node = $stageOrder[0].childNodes[order.startIndex];

					node.parentNode.removeChild(node);
				});

				_.pullAt(items, _.range(order.startIndex, order.endIndex));

				var $itemOrder = angular.element(template.itemOrder);
				var $itemOuter = angular.element(template.itemOuter);

				$itemOuter[0].style.width = item.itemWidth + 'px';

				var classes = [];

				if (item.orderId) $itemOrder.attr('data-order', item.orderId);

				if (!_.isNull(item.throughSite)) {

					item.throughSite ? classes.push('item service-order') : classes.push('item manager-order');
				}

				if (item.lessMinDuration) classes.push('disabled');

				$itemOrder
					.attr('data-merge', item.merge);

				$itemOrder.addClass(classes.join(' '));

				$itemOuter.append($itemOrder);

				$stageOrder[0].insertBefore($itemOuter[0], $stageOrder[0].children[order.startIndex]);

				items[order.startIndex] = item;
			}

			function _unmergeItems(index, order) {

			}


			// Order manipulation

			function _showOrder(id, index) {

				$scope.showOrder({roomId: $scope.roomId, orderId: id, callback: function(data) {

					if (data.status === 'removed') {

						_unmergeItems(index, data.order);
					}
				}});
			}

			function _createOrder(index) {

				var item = items[index];

				// start creating order
				if (!order.startDate && !order.startPeriod) {

					order.startDate = item.date;
					order.startPeriod = item.periodId;

					order.startIndex = index;

					_rejectClosestItems(index);
				}
				else if (!order.endDate && !order.endPeriod) {

					order.endDate = item.date;
					order.endPeriod = item.periodId + 3;

					order.endIndex = index;

					$scope.createOrder({order: order, callback: function(data) {

						if (data.status === 'created') {

							_mergeItems();
							_checkClosestItemsAfterMerge(order.startIndex);
						}
						else {

							_resolveClosestItems(order.startIndex);
						}

						_resetOrder();
					}});
				}
			}

			function _getOrders() {

				console.log('_getOrders', lastDate);

				$scope.getOrders({roomId: $scope.roomId, date: moment(lastDate).add(1, 'days').format('YYYY-MM-DD')});
			}

			function _resetOrder() {

				order = {
					roomId: $scope.roomId,
					startDate: '',
					endDate: '',
					startPeriod: undefined,
					endPeriod: undefined,

					startIndex: undefined,
					endIndex: undefined
				};
			}


			// Smth

			function _check() {

				var summ = 0;

				_.forEach(_.toArray($stageOrder[0].childNodes), function(node) {
					summ += Number(node.style.width.slice(0, -2));
				});

				console.log('summ elements', summ);
				console.log('summ items', _.sum(items, 'itemWidth'));
			}
		}
	}
}

module.exports = Schedule;