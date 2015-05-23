(function() {
	'use strict';

	angular
		.module('datepaginator-directive', [])
		.directive('datepaginator', datepaginator);

	datepaginator.$inject = ['$compile', '$rootScope'];

	function datepaginator($compile, $rootScope) {
		return {
			restrict: 'EA',
			replace: true,
			transclude: true,
			template: '<div class="date clear"></div>',
			link: function(scope, element) {
				var wrap = angular.element('<div class="wrap clear"></div>');

				element.append(wrap);
				$compile(wrap)(scope);

				wrap.datepaginator({
					itemWidth: 90,
					selectedItemWidth: 200,
					navItemWidth: 50,
					startDate: moment().format('YYYY-MM-DD'),
					onSelectedDateChanged: function(event, date, activateEmit) {

            // Всем костылям, костыль, но разбираться нету времени, суть в том, что:
            // Если происходит смена даты по скроллингу, то в недрах пикера она активирует триггер на onSelectedDateChanged
            // он в свою очередь прокручивает сразу всю дату, вместо одной ячейки
            if (activateEmit) $rootScope.$emit('datepaginator:changeDate', date.format('YYYY-MM-DD'));
					}
				});

        $rootScope.$on('timeCalendarCarousel:setDate', function(event, date) {
          wrap.datepaginator('setSelectedDate', date);
        });
			}
		}
	}
}());