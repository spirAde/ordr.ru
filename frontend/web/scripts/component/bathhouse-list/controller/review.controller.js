'use strict';

var _ = require('lodash');

ReviewController.$inject = ['CONSTANTS'];

function ReviewController(CONSTANTS) {

	var vm = this;

	vm.smth = 'review';
}

module.exports = ReviewController;