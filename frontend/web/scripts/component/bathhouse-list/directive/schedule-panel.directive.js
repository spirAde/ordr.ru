'use strict';

var _ = require('lodash');
var moment = require('moment');

var Ps = require('perfect-scrollbar');

SchedulePanel.$inject = ['$timeout', 'CONSTANTS'];

function SchedulePanel($timeout, CONSTANTS) {

	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		scope: {
			schedule: '=schedule'
		},
		template: [
			'<div class="schedule">',
				'<div class="wrap">',
					'<div schedule-panel-scroll class="scroll">',
						'<schedule-row ng-repeat="(date, periods) in schedule track by date" periods="periods" date="date" reset="reset()"></schedule-row>',
					'</div>',
				'</div>',
			'</div>'
		].join(''),
		controller: function($scope, $element, $attrs) {

			$scope.reset = false;

			this.room = $scope.$parent.room;

			this.$rows = [];

			this.startDate = '';         // Первая дата выбранная пользователем в плашке календаре
			this.endDate = '';           // Последняя дата выбранная пользователем
			this.startTime = '';         // Первое время выбранное пользователем
			this.endTime = '';           // Последнее время выбранное пользователем
			//this.$startRow = $();        // Строка в которой была выбрана первая дата и время заказа
			//this.$endRow = $();          // Строка в которой была выбрана вторая дата и время заказа
			this.startPeriodIndex = 0;   // Индекс первой даты,относительно всех ячеек, выбранный пользователем
			this.endPeriodIndex = 0;     // Индекс второй даты,относительно всех ячеек, выбранный пользователем
			this.startRowIndex = 0;      // Индекс ряда, в котором выбранно первое время
			this.endRowIndex = 0;        // Индекс ряда, в котором выбранно второе время
			this.startPeriodId = 0;      // Период начала времени заказа
			this.endPeriodId = 0;        // Период окончания времени заказа

			// Возвращает цену и период этой цены, исходя из текущей ячейки принадлещей
			// этому периоду
			this.getCurrentPricePeriodText = function(day, current) {
				var timeFrom, timeTo,
					price = current['price'],
					priceDetailsTextTemplate = 'C timeFrom по timeTo цена price руб/час',
					templateKeys = 'timeFrom|timeTo|price',
					result;

				_.forEach(day, function(item, idx) {
					if (item['price-period'] === current['price-period'] && _.isUndefined(timeFrom)) {
						timeFrom = item.time;
					}
					if (item['price-period'] !== current['price-period'] && !_.isUndefined(timeFrom)) {
						timeTo = item.time;
						return false;
					}
				});

				// На случай, если у нас данная цена работает до конца дня, поправляем текст
				result = _.isUndefined(timeTo) ?
					{timeFrom: timeFrom, timeTo: '00:00', price: price} :
					{timeFrom: timeFrom, timeTo: timeTo, price: price};

				var reg = new RegExp(templateKeys, 'g');

				return priceDetailsTextTemplate.replace(reg, function(match) {
					return result[match];
				});
			};

			// Находим первые крайние занятые ячейки, исходя из выбранной пользователем первой даты и времени
			this.getUtmostDisabledCellPeriods = function(date, currPeriodId) {
				var periods = $scope.schedule[date],
					firstThreshold = parseInt(currPeriodId) - (parseInt(this.room['min_duration']) - 1) * 3,
					lastThreshold = parseInt(currPeriodId) + (parseInt(this.room['min_duration']) - 1) * 3,
					firstPeriod,
					lastPeriod,
					disabledPeriods = [];

				// В случае, если переваливаем за диапазон существующим периодов, выставляем крайние периоды
				if (firstThreshold < 0)
					firstThreshold = 0;

				if (lastThreshold > 141)
					lastThreshold = 141;

				// Забираем все занятые периоды в интервале
				_.forEach(periods, function(period, idx) {

					idx = parseInt(idx);

					if (idx > lastThreshold && idx < firstThreshold || !period.enable) {

						disabledPeriods.push(idx);
					}
					else if (idx === lastThreshold || idx === firstThreshold) {
						disabledPeriods.push(idx);
					}
				});

				// И берем следующую по ключу для правой, и предыдущую по ключу для левой
				firstPeriod = disabledPeriods[_.indexOf(disabledPeriods, firstThreshold) - 1];
				lastPeriod = disabledPeriods[_.indexOf(disabledPeriods, lastThreshold) + 1];

				return {first: firstPeriod, last: lastPeriod};
			};

			// Находим первую и последнюю крайнюю disabled ячейку для следующего и предыдущего дней
			// соответственно
			this.getDisabledCellPeriods = function(date, currentPeriodId) {
				var prevDate = moment(date).subtract(1, 'days').format('YYYY-MM-DD'),
					nextDate = moment(date).add(1, 'days').format('YYYY-MM-DD');

				var prevLastDisabledCellPeriodId = _
					.chain($scope.schedule[prevDate])
					.pick(function(item, idx) { return parseInt(idx) >= currentPeriodId; })
					.findLastKey(function(item) { return !item.enable })
					.value();

				var nextFirstDisabledCellPeriodId = _
					.chain($scope.schedule[nextDate])
					.pick(function(item, idx) { return parseInt(idx) <= currentPeriodId; })
					.findKey(function(item) { return !item.enable })
					.value();

				if (!_.isUndefined(nextFirstDisabledCellPeriodId))
					nextFirstDisabledCellPeriodId = parseInt(nextFirstDisabledCellPeriodId, 10);

				if (!_.isUndefined(prevLastDisabledCellPeriodId))
					prevLastDisabledCellPeriodId = parseInt(prevLastDisabledCellPeriodId, 10);

				return {next: nextFirstDisabledCellPeriodId, prev: prevLastDisabledCellPeriodId};
			};

			this.getTime = function(periodId) {
				return CONSTANTS.periods[periodId];
			};

			this.closeTimecalendar = function() {
				$element.removeClass('active');
			};
		},
		link: function($scope, $element, attrs, controller) {

			var $inputField, $totalCostField;

			$timeout(function() {

				$inputField = angular.element(document.getElementById('order-datetime-field'));

				/*$inputField = element.prev().find('#order-datetime-field');
				$totalCostField = element.prev().find('.total-cost');*/

				$inputField.bind('click', function() {
					$element.toggleClass('active');
				});

				controller.$inputField = $inputField;
			}, 0);
		}
	}
}

module.exports = SchedulePanel;