'use strict';

localStorage.$inject = ['$window'];

function localStorage($window) {

	var store = $window.localStorage;

	return {
		getToken: getToken,
		setToken: setToken,
		getData: getData,
		setData: setData
	};

	function getToken() {

		return store.getItem('jwtToken');
	}

	function setToken(token) {

		if (token) {
			store.setItem('jwtToken', token);
		}
		else {
			store.removeItem('jwtToken');
		}
	}

	function getData() {

		var userData = store.getItem('userData');

		return JSON.parse(userData);
	}

	function setData(data) {

		if (data) {
			store.setItem('userData', JSON.stringify(data));
		}
		else {
			store.removeItem('userData');
		}
	}
}

module.exports = localStorage;