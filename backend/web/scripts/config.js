'use strict';

appConfig.$inject = ['$compileProvider', '$httpProvider', '$provide', 'ngDialogProvider'];

function appConfig($compileProvider, $httpProvider, $provide, ngDialogProvider) {

	ngDialogProvider.setDefaults({
		className: 'ngdialog-theme-default',
		plain: false,
		showClose: false,
		closeByDocument: true,
		closeByEscape: true,
		disableAnimation: true
	});

	$httpProvider.interceptors.push('httpInterceptor');

	if (process.env.NODE_ENV === 'prod') {
		$compileProvider.debugInfoEnabled(false);
	}

	$provide.decorator('$exceptionHandler', function($delegate) {

		return function(exception, cause) {

			setTimeout(function() {
				console.error(exception.stack);
			}, 0);
		};
	});
}

module.exports = appConfig;