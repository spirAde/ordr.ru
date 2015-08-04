'use strict';

var _ = require('lodash');
var moment = require('moment');
var Hamster = require('hamsterjs');

Schedule.$inject = ['$rootScope', '$window', '$document', '$compile', '$filter'];

function Schedule($rootScope, $window, $document, $compile, $filter) {

	var ESC_KEY = 27;

	var options = {
		margin: 0,
		items: 24,
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

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: template.panel,
		scope: {
			orders: '=orders',
			roomId: '=roomId',
			minDuration: '=minDuration',
			changePosition: '=changePosition',
			currentDate: '=currentDate',

			showOrder: '&showOrder',
			getOrders: '&getOrders',
			createOrder: '&createOrder'
		},
		controller: function($scope, $element) {

			this.getTime = function(periodId) {

				return $filter('periodToTime')(periodId);
			};
		},
		link: function($scope, $element, $attrs, controller) {

			var $stageOuter, $stageOrder, $stageTime;

			var totalWidth = 0;
			var dayWidth = 0;
			var itemWidth = 0;
			var shift = 0;
			var transform = 0;
			var current = 0;

			var items = [];
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
					_calculate();
				}

				// New data
				else if (!_.isEmpty(newVal)) {

					// Build only new dates
					var newDates = _.difference(_.keys(newVal), _.keys(oldVal));

					if (newDates.length) {

						_buildData(newDates);
						_renderTime(newDates.length);
						_renderOrder();
					}
				}
			}, true);

			$scope.$watch('currentDate', function(newDate, oldDate) {

				if (!moment(newDate).isSame(oldDate)) {

					var diff = moment(newDate).diff(moment(), 'days');

					transform = -diff * 1000 * dayWidth / 1000;

					_scroll();
				}
			}, true);


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

					_changePosition(delta);

					var scroll = _.throttle(_.bind(_scroll, this, delta), 750);

					scroll();
				});

				$stageOrder.bind('click', function(event) {

					event.preventDefault();

					var target = event.target;
					var classList = target.classList;

					if (_.indexOf(classList, 'disabled') === -1) {

						if (_.indexOf(classList, 'service-order') !== -1) {

							_showOrder(target.dataset.order);
						}
						else if (_.indexOf(classList, 'manager-order') !== -1) {

							_showOrder(target.dataset.order);
						}
						else {

							var index = _.indexOf(this.children, event.target.parentElement);

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

			function _calculate() {

				if (!itemWidth) {

					var viewPort = $element.parent()[0].offsetWidth;

					itemWidth = (viewPort / options.items).toFixed(3);
				}

				if (!shift) {

					shift = ((itemWidth * 1000 + options.margin * 1000) * options.scrollItems) / 1000;
				}

				if (!dayWidth) {

					dayWidth = ((itemWidth * 1000 + options.margin * 1000) * 48) / 1000;
				}

				if (!timeLineItems.length) {

					var odd = true;

					_.forEach(_.range(0, 144, 3), function(periodId) {

						timeLineItems.push({
							time: odd ? controller.getTime(periodId) : null,
							margin: odd ? -1 : 0
						});

						odd = !odd;
					});
				}
			}

			function _scroll() {

				$stageOuter.css({
					transform: 'translate3d(' + transform + 'px' + ',0px, 0px)',
					transition: (250 / 1000) + 's'
				});
			}

			function _buildData(dates) {

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
						var cellWidth;

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

								items.push({
									periodId: periodId,
									date: date,
									merge: orderDuration,
									itemWidth: (((parseInt(itemWidth * 1000) + parseInt(options.margin * 1000)) * orderDuration) / 1000).toFixed(3),
									lessMinDuration: lessMinDuration,
									throughSite: order.throughSite,
									orderId: order.id
								});
							}
							else {

								items.push({
									periodId: periodId,
									date: date,
									merge: 1,
									itemWidth: ((parseFloat(itemWidth * 1000) + parseInt(options.margin * 1000)) / 1000).toFixed(3),
									lessMinDuration: lessMinDuration,
									throughSite: null,
									orderId: null
								});
							}
						}
						else {

							skip--;
						}
					});

					totalWidth = (_.sum(items, 'itemWidth') + 50).toFixed(3);
				});
			}

			function _renderTime(repeat) {

				_.forEach(_.range(0, repeat), function(idx) {

					_.forEach(timeLineItems, function(timeItem, index, _this) {

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

			function _renderOrder() {

				$stageOuter[0].style.width = totalWidth + 'px';

				_.forEach(items, function(item) {

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
			}

			function _changePosition(delta) {

				var shifting = shift * (-delta);

				transform = Math.min(transform + parseFloat(shifting), 0);
				transform = Math.max(transform, -totalWidth + options.items * itemWidth);

				var length = 0;

				_.forEach(items, function(item, idx) {

					length += parseInt(item.itemWidth);

					if (Math.abs(transform) < length) {

						current = idx;
						return false;
					}
				});
			}

			function _rejectClosestItems(index) {

				var from = Math.max(index - ($scope.minDuration / 3) + 1, 0);
				var to = Math.min(index + ($scope.minDuration / 3) - 1, items.length);

				var childrenBefore = _.slice(_.toArray($stageOrder[0].childNodes), from, index);
				var childrenAfter = _.slice(_.toArray($stageOrder[0].childNodes), index, to);

				_.forEach(childrenBefore.reverse(), function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, 'service-order') !== -1 || _.indexOf(classes, 'manager-order') !== -1) return false;

					child.childNodes[0].className += ' disabled';
				});

				_.forEach(childrenAfter, function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, 'service-order') !== -1 || _.indexOf(classes, 'manager-order') !== -1) return false;

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

					if (_.indexOf(classes, 'service-order') !== -1 || _.indexOf(classes, 'manager-order') !== -1) return false;

					child.childNodes[0].classList.remove('disabled');
				});

				_.forEach(childrenAfter, function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, 'service-order') !== -1 || _.indexOf(classes, 'manager-order') !== -1) return false;

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

					if (_.indexOf(classes, 'service-order') !== -1 || _.indexOf(classes, 'manager-order') !== -1) {

						return false;
					}

					before.push(child.childNodes[0]);
				});

				_.forEach(childrenAfter, function(child) {

					var classes = child.childNodes[0].classList;

					if (_.indexOf(classes, 'service-order') !== -1 || _.indexOf(classes, 'manager-order') !== -1) {

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


			// Order manipulation

			function _showOrder(id) {

				$scope.showOrder({roomId: $scope.roomId, orderId: id, callback: function(response) {

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
					order.endPeriod = item.periodId;

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
		}
	}
}

module.exports = Schedule;