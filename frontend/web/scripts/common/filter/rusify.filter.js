'use strict';

function Rusify() {

	var words = {
		internet: 'Интернет',
		pool: 'Бассейн',
		jacuzzi: 'Джакузи',
		parking: 'Парковка',
		billiards: 'Бильярд',
		bar: 'Бар / Ресторан',
		kitchen: 'Кухня',
		icehole: 'Прорубь',

		bathhouses: 'Бани и сауны',
		carwashes: 'Бани и сауны',
		bathhouse: 'Баня',
		sauna: 'Сауна',
		hammam: 'Хаммам',

		distance: 'Дистанция',
		price: 'Цена',
		options: 'Удобства',
		types: 'Тип',
		name: 'Название',
		guests: 'Кол-во гостей',
		datetime: 'Дата/Время',
		prepayment: 'Предоплата'
	};

	return function(input) {
		return words[input];
	}
}

module.exports = Rusify;