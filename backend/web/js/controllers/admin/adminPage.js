(function() {
	'use strict';

	angular
		.module('ordrControlApp.adminPage', [
			'adminPage.header',
			'adminPage.aside',
			'adminPage.content',
			'adminPage.footer'
		])
		.controller('adminPage', adminPage);

	adminPage.$inject = ['$scope', '$rootScope'];

	function adminPage($scope, $rootScope) {

		$scope.screen = $rootScope.screen;

		$rootScope.screenMode = undefined;

		$scope.changeTemplates = changeTemplates;

		$scope.$watch('screen', function(data) {
			$scope.screen = data;
			$scope.changeTemplates();
		});

		$scope.changeTemplates();

		function changeTemplates() {
			if ($scope.screen.width > 1600) {
				$scope.headerTemplateUrl          = '/partials/desktop/admin/header.html';
				$scope.asideTemplateUrl          = '/partials/desktop/admin/aside.html';
				$scope.contentTemplateUrl          = '/partials/desktop/admin/content.html';
				$scope.footerTemplateUrl          = '/partials/desktop/admin/footer.html';

				$rootScope.screenMode = 'large';
			}
			else if ($scope.screen.width > 1024 && $scope.screen.width <= 1600) {
				$scope.headerTemplateUrl          = '/partials/desktop/admin/header.html';
				$scope.asideTemplateUrl          = '/partials/desktop/admin/aside.html';
				$scope.contentTemplateUrl          = '/partials/desktop/admin/content.html';
				$scope.footerTemplateUrl          = '/partials/desktop/admin/footer.html';

				$rootScope.screenMode = 'medium';
			}
			else {
				$scope.headerTemplateUrl          = '/partials/desktop/admin/header.html';
				$scope.asideTemplateUrl          = '/partials/desktop/admin/aside.html';
				$scope.contentTemplateUrl          = '/partials/desktop/admin/content.html';
				$scope.footerTemplateUrl          = '/partials/desktop/admin/footer.html';

				$rootScope.screenMode = 'mini';
			}
		}
	}
}());