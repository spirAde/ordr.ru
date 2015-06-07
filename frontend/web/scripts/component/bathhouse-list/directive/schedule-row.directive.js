'use strict';

var _ = require('lodash');
var moment = require('moment');

ScheduleRow.$inject = ['$compile'];

function ScheduleRow($compile) {

	return {
		restrict: 'EA',
		replace: true,
		require: '^schedulePanel',
		scope: {
			date: '=date',
			periods: '=periods',
			reset: '&reset'
		},
		template: '<div class="schedule-row"></div>',
		controller: function($scope, $element) {

			var skip = true;

			$scope.$watch('periods', function(periods) {

				// Пропускаем первый $watch
				if (skip) {
					skip = false;
				}
				else {
					console.log(periods);
					/*angular.forEach($element.find('.schedule-cells').children(), function(cell, idx) {
						var periodId = idx * 3;
						if (!periods[periodId].enable) {
							$(cell)
								.removeClass('cell-ordered cell')
								.addClass('cell-disabled');
						}
					});*/
				}
			}, true);
		},
		link: function($scope, $element, $attrs, parentController) {

			var $inputField = angular.element(document.getElementById('order-datetime-field'));
			var $totalCostField = angular.element(document.getElementsByClassName('total-cost'));
			var $orderCostField = angular.element(document.getElementById('order-cost-field'));
			
			var $dateElement = angular.element([
				'<div class="schedule-info clear">',
					'<div class="date">' + moment($scope.date).format('LL') + '</div>',
					'<div class="types">',
						'<div class="type type-3">Занятое время</div>',
						'<div class="type type-2">Свободное время</div>',
						'<div class="type type-4">Ваша бронь</div>',
					'</div>', 
				'</div>'
			].join(''));

			var $rowElement = angular.element('<div class="schedule-cells clear">');

			_.forEach($scope.periods, function(period, periodId) {

				var cellClass = period.enable ? 'cell' : 'cell-disabled';

				var cell = angular.element([
					'<span class="schedule-cell">',
						period.time,
					'</span>'].join('')
				).addClass(cellClass);

				$rowElement.append(cell);
			});

			$element.append($dateElement);
			$element.append($rowElement);

			$compile($dateElement)($scope);
			$compile($rowElement)($scope);

			if ($scope.$parent.$last) $element.addClass('last');

			parentController.$rows.push($element[0]);
		}
	}
}

module.exports = ScheduleRow;