'use strict';

var _ = require('lodash');
var io = require('socket.io-client');

socket.$inject = ['$rootScope'];

function socket($rootScope) {

	var socket = io.connect('http://ordr.ru:3000');

	return {
		on: on,
		emit: emit
	};

	function on(eventName, callback) {

		socket.on(eventName, _.throttle(function() {

			var args = [].slice.call(arguments);

			$rootScope.$apply(function() {
				if (callback) {
					callback.apply(socket, args);
				}
			});
		}, 500));
	}

	function emit(eventName, data, callback) {

		var args = [].slice.call(arguments), cb;

		if (typeof args[args.length - 1] == 'function') {

			cb = args[args.length - 1];

			args[args.length - 1] = function() {

				var args = [].slice.call(arguments);

				$rootScope.$apply(function() {

					if (cb) {
						cb.apply(socket, args);
					}
				});
			};
		}

		socket.emit.apply(socket, args);
	}
}

module.exports = socket;