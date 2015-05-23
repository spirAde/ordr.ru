(function() {
	'use strict';

	angular
		.module('order-modal-directive', [])
		.directive('orderModal', orderModal);

	orderModal.$inject = ['$compile', '$templateCache', '$http'];

	function orderModal($compile, $templateCache, $http) {

		return {
			restrict: 'EA',
			replace: true,
			transclude: true,
			scope: {
				modalData: '=modalData'
			},
			template: '<div class="md-modal md-effect-5" id="modal-1"></div>',
			controller: function($scope, $element) {
				this.loadTemplateUrl = function(tmpl, config) {
					return $http.get(tmpl, (config || {})).then(function(res) {
						return res.data || '';
					});
				};

				this.loadTemplate = function(tmpl) {
					return $templateCache.get(tmpl) || this.loadTemplateUrl(tmpl, {cache: true});
				}
			},
			link: function(scope, element, attrs, controller) {

				function loadTemplate(tmpl) {
					if ($templateCache.get(tmpl)) {
						return $templateCache.get(tmpl);
					}
					else {
						return $http.get(tmpl, ({cache: true})).then(function(res) { return res.data; });
					}
				}

				scope.$watch('modalData', function() {

					if (scope.modalData.template) {


					}
				});
			}
		}
	}
}());