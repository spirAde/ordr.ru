'use strict';

var _ = require('lodash');

FilterController.$inject = ['CONSTANTS'];

function FilterController(CONSTANTS) {

	var vm = this;

	vm.filters = {
		datetime: {
			minDate: '2015-05-26',
			maxDate: '2015-06-26'
		},
		options: {},
		price: {},
		distance: {},
		guest: {},
		types: {},
		prepayment: undefined
	};

	var optionsList = _.values(CONSTANTS.options.bathhouseOptions).concat(_.values(CONSTANTS.options.roomOptions));

	_.forEach(optionsList, function(option) {
		vm.filters.options[option] = false;
	});

	_.forEach(CONSTANTS.bathhouseType, function(type) {
		vm.filters.types[type] = false;
	});
}

module.exports = FilterController;