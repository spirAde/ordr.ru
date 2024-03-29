'use strict';

var _ = require('lodash');
var moment = require('moment');

DatePaginator.$inject = ['$rootScope', '$compile', '$window'];

function DatePaginator($rootScope, $compile, $window) {

	var options = {

		selectedDate: moment().clone().startOf('day'),
		selectedDateFormat: 'YYYY-MM-DD',
		selectedItemWidth: 140,

		itemWidth: 75,
		itemDateFormat: 'Do MMM',

		navItemWidth: 20,

		startDate: moment(),
		startDateFormat: 'YYYY-MM-DD',
		endDate: moment().add(30, 'days'),
		endDateFormat: 'YYYY-MM-DD',

		offDays: 'сб,вс',
		offDaysFormat: 'ddd',

		startOfWeek: 'пн',
		startOfWeekFormat: 'ddd',

		text: 'ddd<br/>Do',
		textSelected: 'dddd<br/>Do, MMMM YYYY'
	};

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: '<div class="date clear"></div>',
		scope: {

		},
		link: function($scope, $element) {

			var $wrap, $datepaginator, $items;

			$rootScope.$on('schedule:changeDate', function(event, data) {

				_setSelectedDate(moment(data.date, options.selectedDateFormat), false);
				_render();
			});

			_initialize();
			_subscribe();
			_render();

			function _initialize() {

				$wrap = angular.element('<div class="wrap clear"></div>');
				$datepaginator = angular.element('<div class="datepaginator"></div>');
				$items = angular.element('<ul class="pagination"></ul>');

				$wrap.append($datepaginator);

				$element.append($wrap);
				$compile($wrap)($scope);
			}

			function _buildData() {

				var viewWidth = ($element.parent()[0].offsetWidth - ((options.selectedItemWidth - options.itemWidth) + (options.navItemWidth * 2)));
				var units = Math.floor(viewWidth / options.itemWidth);
				var unitsPerSide = parseInt(units / 2);

				var adjustedItemWidth = Math.floor(viewWidth / units);
				var adjustedSelectedItemWidth = Math.floor(options.selectedItemWidth + (viewWidth - (units * adjustedItemWidth)));

				var today = moment().startOf('day');
				var start = options.selectedDate.clone().subtract(unitsPerSide, 'days');
				var end = options.selectedDate.clone().add(units - unitsPerSide, 'days');

				var data = {
					isSelectedStartDate: options.selectedDate.isSame(options.startDate) ? true : false,
					isSelectedEndDate: options.selectedDate.isSame(options.endDate) ? true : false,
					items: []
				};

				for (var m = start; m.isBefore(end); m.add(1, 'days')) {

					var valid = ((m.isSame(options.startDate.format(options.startDateFormat)) || m.isAfter(options.startDate)) &&
					(m.isSame(options.startDate.format(options.startDateFormat)) || m.isBefore(options.endDate))) ? true : false;

					data.items[data.items.length] = {
						m: m.clone().format(options.selectedDateFormat),
						isValid: valid,
						isSelected: (m.isSame(options.selectedDate)) ? true : false,
						isToday: (m.isSame(today)) ? true : false,
						isOffDay: (options.offDays.split(',').indexOf(m.format(options.offDaysFormat)) !== -1),
						isStartOfWeek: (options.startOfWeek.split(',').indexOf(m.format(options.startOfWeekFormat)) !== -1),
						text: (m.isSame(options.selectedDate)) ? m.format(options.textSelected) : m.format(options.text),
						hint: valid ? m.format(options.hint) : 'Invalid date',
						itemWidth: (m.isSame(options.selectedDate)) ? adjustedSelectedItemWidth : adjustedItemWidth
					};
				}

				return data;
			}

			function _render() {

				$items.empty();

				var data = _buildData();

				$items.append('' +
				'<li>' +
				'<a class="dp-nav dp-nav-left" style="width: ' + options.navItemWidth + 'px;">' +
				'<i class="glyphicon glyphicon-chevron-left dp-nav-left"></i>' +
				'</a>' +
				'</li>');

				_.forEach(data.items, function(item) {

					var $item = angular.element('<li></li>');

					var classes = ['dp-item'];

					if (item.isSelected) {
						classes.push('dp-selected');
					}

					if (item.isToday) {
						classes.push('dp-today');
					}

					if (item.isStartOfWeek) {
						classes.push('dp-divider');
					}

					if (item.isOffDay) {
						classes.push('dp-off');
					}

					if (!item.isValid) {
						classes.push('dp-no-select');
					}

					var $inner = angular.element('<a style="width: ' + item.itemWidth + 'px"></a>');

					$inner.attr('data-moment', item.m);

					$inner.addClass(classes.join(' '));

					$inner.append(item.text);
					$item.append($inner);
					$items.append($item);
				});

				$items.append('' +
				'<li>' +
				'<a class="dp-nav dp-nav-right" style="width: ' + options.navItemWidth + 'px;">' +
				'<i class="glyphicon glyphicon-chevron-right dp-nav-right"></i>' +
				'</a>' +
				'</li>');

				$datepaginator.append($items);
			}

			function _setSelectedDate(selectedDate, scroll) {

				if ((!selectedDate.isSame(options.selectedDate.format(options.selectedDateFormat))) &&
					(!selectedDate.isBefore(options.startDate.format(options.selectedDateFormat))) &&
					(!selectedDate.isAfter(options.endDate.format(options.selectedDateFormat)))) {

					options.selectedDate = selectedDate.startOf('day');

					$scope.$emit('date-paginator:changeDate', {date: selectedDate.clone(), scroll: scroll});
				}
			}

			function _subscribe() {

				$wrap.bind('click', function(e) {

					e.preventDefault();

					var target = angular.element(e.target);
					var classList = target.attr('class');

					if (classList.indexOf('dp-nav-left') != -1) {

						_setSelectedDate(options.selectedDate.clone().subtract(1, 'days'), true);
						_render();
					}
					else if (classList.indexOf('dp-nav-right') != -1) {

						_setSelectedDate(options.selectedDate.clone().add(1, 'days'), true);
						_render();
					}
					else if (classList.indexOf('dp-item') != -1) {

						_setSelectedDate(moment(target.attr('data-moment'), options.selectedDateFormat), true);
						_render();
					}
				});

				angular.element($window).bind('resize', _.throttle(_render, 100));
			}
		}
	}
}

module.exports = DatePaginator;