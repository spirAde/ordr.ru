'use strict';

function Declination() {

	return function(input, words) {

		input = Math.abs(input);

		var word = '';

		if (input.toString().indexOf('.') > -1) {
			word = words[1];
		}
		else {
			word = (
				input % 10 == 1 && input % 100 != 11
					? words[0] : input % 10 >= 2 && input % 10 <= 4 && (input % 100 < 10 || input % 100 >= 20)
						? words[1] : words[2]
			);
		}

		return word;
	}
}

module.exports = Declination;