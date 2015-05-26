'use strict';

var _ = require('lodash');

ListController.$inject = ['CONSTANTS'];

function ListController(CONSTANTS) {

	var vm = this;

	vm.smth = 'list';
}

module.exports = ListController;