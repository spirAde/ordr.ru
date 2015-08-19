'use strict';

var env = process.env.NODE_ENV || 'development';
var config = require('./config/' + env);
var storage = require('./storage');

var _ = require('lodash');

var server = require('http').createServer();
var io = require('socket.io')(server);

var bathhouses = [];
var cities = [];

var managers = [];

storage.getCities(function(error, data) {

  if (error) throw new Error(error);

  cities = data;

  storage.getBathhouses(function(error, data) {

    if (error) throw new Error(error);

    bathhouses = data;

    io.sockets.on('connection', function(socket) {

      //
    });
  });
});

server.listen(config.PORT);