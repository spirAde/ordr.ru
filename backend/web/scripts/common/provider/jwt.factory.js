'use strict';

jwt.$inject = [];

function jwt() {

	var factory = {
		urlBase64Decode: urlBase64Decode,
		decodeToken: decodeToken,
		getTokenExpirationDate: getTokenExpirationDate,
		isTokenExpired: isTokenExpired
	};

	return factory;

	function urlBase64Decode(str) {

		var output = str.replace(/-/g, '+').replace(/_/g, '/');

		switch (output.length % 4) {
			case 0: { break; }
			case 2: { output += '=='; break; }
			case 3: { output += '='; break; }
			default: {
				throw 'Illegal base64url string!';
			}
		}

		return decodeURIComponent(escape(window.atob(output)));
	}

	function decodeToken(token) {

		var parts = token.split('.');

		if (parts.length !== 3) {
			throw new Error('JWT must have 3 parts');
		}

		var decoded = factory.urlBase64Decode(parts[1]);

		if (!decoded) {
			throw new Error('Cannot decode the token');
		}

		return JSON.parse(decoded);
	}

	function getTokenExpirationDate() {

		var decoded;
		decoded = factory.decodeToken(token);

		if(!decoded.exp) {
			return null;
		}

		var d = new Date(0);
		d.setUTCSeconds(decoded.exp);

		return d;
	}

	function isTokenExpired() {

		var d = factory.getTokenExpirationDate(token);

		if (!d) {
			return false;
		}

		// Token expired?
		return !(d.valueOf() > new Date().valueOf());
	}
}

module.exports = jwt;