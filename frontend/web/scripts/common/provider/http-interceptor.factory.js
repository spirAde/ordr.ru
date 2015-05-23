'use strict';

httpInterceptor.$inject = ['authToken'];

function httpInterceptor(authToken) {

	return {
		request: setHeaders
	};


	function setHeaders(config) {

		config.headers = config.headers || {};

		// Api Version
		var apiVersion = '1.0';

		config.headers.Accept = 'application/json; version='+apiVersion;

		// JWT Token
		var token = authToken.getToken();

		if (token) {
			config.headers.Token = 'Bearer ' + token;
		}

		return config;
	}
}

module.exports = httpInterceptor;