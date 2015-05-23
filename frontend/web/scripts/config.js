'use strict';

appConfig.$inject = ['$compileProvider', '$httpProvider', '$provide'];

function appConfig($compileProvider, $httpProvider, $provide) {

	$httpProvider.interceptors.push('httpInterceptor');

	if (process.env.NODE_ENV === 'prod') {
		$compileProvider.debugInfoEnabled(false);
	}

	$provide.decorator('$exceptionHandler', function($delegate) {

		return function(exception, cause) {

			setTimeout(
				function() {
					console.error(exception.stack);
					//throw exception;
				},
				0
			);
		};
	});
}

module.exports = appConfig;