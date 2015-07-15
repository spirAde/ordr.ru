'use strict';

auth.$inject = ['$http', 'jwt', 'localStorage'];

function auth($http, jwt, localStorage) {

	return {
		login: login
	};


	function login(credentials) {

		return $http.post('http://control.ordr.ru/login', credentials)
			.then(function(response) {

				var token = response.data.token;

				var decoded = jwt.decodeToken(token);

				localStorage.setToken(token);
				localStorage.setData(decoded);

				return true;
			});
	}
}

module.exports = auth;