'use strict';

auth.$inject = ['$http', 'jwt', 'localStorage'];

function auth($http, jwt, localStorage) {

	return {
		login: login
	};


	function login(credentials) {

		var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJtYW5hZ2VyIiwidHlwZSI6ImJhdGgiLCJmdWxsX25hbWUiOiIiLCJwaG9uZSI6bnVsbCwib3JnYW5pemF0aW9uX2lkIjoxLCJvcmdhbml6YXRpb25fbmFtZSI6Ilx1MDQxY1x1MDQzZVx1MDQ0MVx1MDQzYVx1MDQzZVx1MDQzMlx1MDQ0MVx1MDQzYVx1MDQzMFx1MDQ0ZiBcdTA0MzFcdTA0MzBcdTA0M2RcdTA0NGYiLCJjaXR5X2lkIjoxfQ.pRvJOIf2Yk7uQvHQ-L27SYlSvS_tgucvx3SYbkqMiHk';

		var decoded = jwt.decodeToken(token);

		localStorage.setToken(token);
		localStorage.setData(decoded);

		return true;
		/*return $http.post('http://control.ordr.ru/login', credentials)
			.then(function(response) {

				return response.data;
			});*/
	}
}

module.exports = auth;