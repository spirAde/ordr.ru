'use strict';

var env = process.env.NODE_ENV || 'development';
var config = require('./config/' + env);
var storage = require('./storage');

var _ = require('lodash');

var server = require('http').createServer();
var io = require('socket.io')(server);

var managers = [];
var bathhouses = [];
var cities = [];

storage.getCities(function(error, data) {

  if (error) throw new Error(error);

  cities = data;

  storage.getBathhouses(function(error, data) {

    if (error) throw new Error(error);

    bathhouses = data;

    start();
  });
});

server.listen(config.PORT);

var start = function() {

  io.sockets.on('connection', function(socket) {

    socket.on('manager:init', function(manager) {

      managers.push({organizationId: manager.organizationId, socket: socket});
    });

    socket.emit('daemon:smth', {smth: 'smth'});

    socket.on('disconnect', function() {

    });
  });
};