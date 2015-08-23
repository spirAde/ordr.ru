'use strict';

var _ = require('lodash');
var io = require('socket.io-client');

socket.$inject = ['$rootScope', '$window'];

function socket($rootScope) {

	var port = 3000;
	var hostname = $window.location.hostname;
	var origin = hostname.substr(hostname.indexOf('.') + 1);

	var socket = io.connect(origin + ':' + port, {
    reconnect: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 2000,
    reconnectionAttempts: Infinity
	});

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
