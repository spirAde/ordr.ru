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

				var $cell = angular.element([
					'<span class="schedule-cell">',
						period.time,
					'</span>'].join('')
				).addClass(cellClass);

				$cell.bind('click', function(e) {

					var $this = angular.element(e.target);

					if (period.enable && !$this.hasClass('cell-reserved') && !$this.hasClass('cell-disabled')) {

						if (!parentController.startDate) {

							parentController.startDate = $scope.date;
							parentController.startTime = period.time;
							parentController.startPeriodIndex = periodId / 3;
							parentController.startRowIndex = $scope.$parent.$index;
							parentController.startPeriodId = periodId;
							parentController.$startRow = parentController.$rows[$scope.$parent.$index];
							parentController.startRowCells = parentController.$startRow[0].lastChild.childNodes;

							var $prevRow = parentController.$rows[parentController.startRowIndex - 1],
								$nextRow = parentController.$rows[parentController.startRowIndex + 1];

							var prevRowCells = $prevRow ? $prevRow[0].lastChild.childNodes : [];
							var nextRowCells = $nextRow ? $nextRow[0].lastChild.childNodes : [];

							var plusShift = parentController.startPeriodIndex + parseInt(parentController.room.settings.minDuration / 3) - 1,
								minusShift = parentController.startPeriodIndex - parseInt(parentController.room.settings.minDuration / 3) + 1;

							// Делаем недоступными ячейки для дат, которые находятся на удалении больше
							// чем +-1 сутки от даты начала заказа
							_.forEach(parentController.$rows, function($row, idx) {

								if (_.indexOf([parentController.startRowIndex - 1, parentController.startRowIndex, parentController.startRowIndex + 1], idx) === -1) {

									var $cellsWrapper = $row[0].getElementsByClassName('schedule-cells');

									_.forEach($cellsWrapper[0].children, function($cell) {
										$cell.classList.add('cell-disabled');
									});
								}
							});

							// После выбора первого времени находим все ячейки находящиеся в удаленности 24 часа
							// от первой даты(если по пути не встречаются ячейки с
							// disabled(в этом случае прячем и все ячейки после disabled)) и делаем их inactive
							// + ячейки вблизи minDuration от выбранной ячейки так же прячем в inactive
							if (plusShift <= 47 && minusShift >= 0) {

								for (var i = parentController.startPeriodIndex; i <= plusShift; i++) {
									angular.element(parentController.startRowCells.item(i)).addClass('cell-reserved').removeClass('cell cell-ordered');
								}

								for (var j = parentController.startPeriodIndex; j >= minusShift; j--) {
									angular.element(parentController.startRowCells.item(j)).addClass('cell-reserved').removeClass('cell cell-ordered');
								}
							}
							// Если переваливает на предыдущий день
							else if (minusShift < 0) {

								for (var i = 0; i <= plusShift; i++) {
									angular.element(parentController.startRowCells.item(i)).addClass('cell-reserved').removeClass('cell cell-ordered');
								}

								for (var j = 47; j > (47 + minusShift); j--) {
									angular.element(prevRowCells.item(j)).addClass('cell-reserved').removeClass('cell cell-ordered');
								}
							}
							// На следующий
							else if (plusShift > 47) {

								for (var i = minusShift; i <= 47; i++) {
									angular.element(parentController.startRowCells.item(i)).addClass('cell-reserved').removeClass('cell cell-ordered');
								}

								for (var j = 0; j < (plusShift - 47); j++) {
									angular.element(nextRowCells.item(j)).addClass('cell-reserved').removeClass('cell cell-ordered');
								}
							}

							var utmostFreeCellPeriods = parentController.getUtmostDisabledCellPeriods($scope.date, periodId);
							var disabledCellPeriods = parentController.getDisabledCellPeriods($scope.date, periodId);
							var chunkCells;

							console.log(utmostFreeCellPeriods);
							console.log(disabledCellPeriods);

							// 1) День полностью пустой
							if (_.isUndefined(utmostFreeCellPeriods.first) && _.isUndefined(utmostFreeCellPeriods.last)) {
								if (_.isUndefined(disabledCellPeriods.prev)) {

									chunkCells = Array.prototype.slice.call(prevRowCells, 1, parentController.startPeriodIndex);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}
								else {

									chunkCells = Array.prototype.slice.call(prevRowCells, 1, disabledCellPeriods.prev / 3);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}

								if (_.isUndefined(disabledCellPeriods.next)) {

									chunkCells = Array.prototype.slice.call(nextRowCells, parentController.startPeriodIndex);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}
								else {

									chunkCells = Array.prototype.slice.call(nextRowCells, disabledCellPeriods.next / 3);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}
							}

							// 2) Занятые ячейки находятся слева
							else if (!_.isUndefined(utmostFreeCellPeriods.first) && _.isUndefined(utmostFreeCellPeriods.last)) {

								chunkCells = Array.prototype.slice.call(parentController.startRowCells, 0, utmostFreeCellPeriods.first / 3);

								_.forEach(chunkCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});

								_.forEach(prevRowCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});

								if (_.isUndefined(disabledCellPeriods.next)) {

									chunkCells = Array.prototype.slice.call(nextRowCells, parentController.startPeriodIndex);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}
								else {

									chunkCells = Array.prototype.slice.call(nextRowCells, disabledCellPeriods.next / 3);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}
							}

							// 3) Занятые ячейки находятся справа
							else if (_.isUndefined(utmostFreeCellPeriods.first) && !_.isUndefined(utmostFreeCellPeriods.last)) {

								chunkCells = Array.prototype.slice.call(parentController.startRowCells, utmostFreeCellPeriods.last / 3);

								_.forEach(chunkCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});

								_.forEach(nextRowCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});

								if (_.isUndefined(disabledCellPeriods.prev)) {

									chunkCells = Array.prototype.slice.call(prevRowCells, 0, parentController.startPeriodIndex);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}
								else {

									chunkCells = Array.prototype.slice.call(prevRowCells, 0, disabledCellPeriods.prev / 3);

									_.forEach(chunkCells, function(cell) {
										angular.element(cell).addClass('cell-disabled');
									});
								}
							}

							// 4) Занятые ячейки и справа и слева
							else {

								chunkCells = Array.prototype.slice.call(parentController.$startRow, utmostFreeCellPeriods.last / 3);

								_.forEach(chunkCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});

								chunkCells = Array.prototype.slice.call(parentController.$startRow, 0, utmostFreeCellPeriods.first / 3);

								_.forEach(chunkCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});

								_.forEach(nextRowCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});

								_.forEach(prevRowCells, function(cell) {
									angular.element(cell).addClass('cell-disabled');
								});
							}
						}
						else if (parentController.startDate && !parentController.endDate) {

							parentController.endDate = $scope.date;
							parentController.endTime = period.time;
							parentController.$endRow = parentController.$rows[$scope.$parent.$index];
							parentController.endPeriodIndex = periodId / 3;
							parentController.endRowIndex = $scope.$parent.$index;
							parentController.endPeriodId = periodId;

							var startDateTime = parentController.startDate + ' ' + parentController.startTime,
								endDateTime = parentController.endDate + ' ' + parentController.endTime;

							// Если пользователь натыкал в обратном порядке даты и время, сами меняем все
							// местами
							if (!moment(startDateTime).isBefore(endDateTime)) {
								var $tmp = parentController.$startRow;
								parentController.$startRow = parentController.$endRow;
								parentController.$endRow = $tmp;

								var tmpPeriodIndex = parentController.startPeriodIndex;
								parentController.startPeriodIndex = pc.endPeriodIndex;
								parentController.endPeriodIndex = tmpPeriodIndex;

								var tmpRowIndex = parentController.startRowIndex;
								parentController.startRowIndex = parentController.endRowIndex;
								parentController.endRowIndex = tmpRowIndex;

								var tmpDate = parentController.startDate;
								parentController.startDate = parentController.endDate;
								parentController.endDate = tmpDate;

								var tmpTime = parentController.startTime;
								parentController.startTime = parentController.endTime;
								parentController.endTime = tmpTime;

								var tmpPeriodId = parentController.startPeriodId;
								parentController.startPeriodId = parentController.endPeriodId;
								parentController.endPeriodId = tmpPeriodId;
							}

							if (parentController.startRowIndex === parentController.endRowIndex) {
								for (var i = parentController.startPeriodIndex; i <= parentController.endPeriodIndex; i++) {

									angular.element(parentController.startRowCells.item(i))
										.removeClass('cell cell-ordered')
										.addClass('cell-disabled');
								}
							}
							else {
								for (var i = parentController.startPeriodIndex; i <= 47; i++) {

									angular.element(parentController.startRowCells.item(i))
										.removeClass('cell cell-ordered')
										.addClass('cell-disabled');
								}
								for (var j = 0; j <= parentController.endPeriodIndex; j++) {

									angular.element(parentController.startRowCells.item(j))
										.removeClass('cell cell-ordered')
										.addClass('cell-disabled');
								}
							}

							/*orderservice.order.time.startDate = pc.startDate;
							orderservice.order.time.endDate = pc.endDate;
							orderservice.order.time.startPeriodId = pc.startPeriodId;
							orderservice.order.time.endPeriodId = pc.endPeriodId;

							$inputField.val(pc.startDate + ' ' + pc.startTime + ' - ' + pc.endDate + ' ' + pc.endTime);*/

							//parentController.closeTimecalendar();

							/*var summ = orderservice.calculateOrder('time');
l
							$totalCostField.text(summ + ' руб');*/
							//$rootScope.$emit('checkOrder');
						}
					}
				});

				$rowElement.append($cell);
			});

			$element.append($dateElement);
			$element.append($rowElement);

			$compile($dateElement)($scope);
			$compile($rowElement)($scope);

			if ($scope.$parent.$last) $element.addClass('last');

			parentController.$rows.push($element);
		}
	}
}

module.exports = ScheduleRow;