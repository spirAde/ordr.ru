(function() {
  'use strict';

  angular
    .module('socketservice', [])
    .factory('socketservice', socketservice);

  socketservice.$inject = ['$rootScope'];

  function socketservice($rootScope) {

    var throttle = function (func, wait) {

      var context, args, timeout, result;
      var previous = 0;

      var later = function() {
        previous = new Date();
        timeout = null;
        result = func.apply(context, args);
      };

      return function() {
        var now = new Date();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;

        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        }
        else if (!timeout) {
          timeout = setTimeout(later, remaining);
        }

        return result;
      };
    };

    var socket = io.connect('http://ordr.ru:3000');

    return {
      on: function (eventName, callback) {
        socket.on(eventName, throttle(function() {
          var args = [].slice.call(arguments);
          $rootScope.$apply(function() {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        }, 500));
      },

      emit: function (eventName, data, callback) {

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
    };
  }
}());