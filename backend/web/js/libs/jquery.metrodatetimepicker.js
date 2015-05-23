/*
 * Metro DateTime Picker
 *
 * @author Federico Ramírez <fedra.arg@gmail.com>
 *
 * Copyright Federico Ramirez 2014, unauthorized usage is strictly forbidden
 */
(function() {
    var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        __slice = [].slice;

    (function($, window) {
        var MetroDateTimePicker, NumberFormatter;
        NumberFormatter = (function() {
            function NumberFormatter() {}

            NumberFormatter.prototype.padLeft = function(num, size) {
                var i, len, result, _i, _ref;
                len = ('' + num).length;
                if (len >= size) {
                    return num;
                }
                result = '';
                for (i = _i = 1, _ref = size - len; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
                    result += '0';
                }
                return result + num;
            };

            return NumberFormatter;

        })();
        MetroDateTimePicker = (function() {
            MetroDateTimePicker.prototype.defaults = {
                time_format: '12h',
                show_date: true,
                effect: 'fadeIn',
                position: 'bottom',
                minutes_skip: 5,
                boxes: {
                    fontColor: 'ffffff',
                    color: 'f4b300',
                    fontSize: '13px',
                    fontFamily: 'Arial, sans-serif',
                    size: 100
                },
                visible_boxes: 5,
                months: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
                format: '{da}/{mo}/{ye} {ho}:{mi} {me}',
                scroll_peed: 'fast',
                initial_value: null
            };

            function MetroDateTimePicker(el, options) {
                this.boxClicked = __bind(this.boxClicked, this);
                this.clickedOutside = __bind(this.clickedOutside, this);
                var box, type, value, _ref;
                this.options = $.extend({}, this.defaults, options);
                this.$el = $(el);
                this.box_status = {};
                this.current_box_list = null;
                this.formatter = new NumberFormatter();
                if (['fadeIn', 'slideDown'].indexOf(this.options.effect) === -1) {
                    throw "Invalid effect, can only use 'fadeIn' and 'slideDown'.";
                }
                if (['12h', '24h', 'none'].indexOf(this.options.time_format) === -1) {
                    throw "Invalid time format, available formats: 'none', '12h', '24h'.";
                }
                if (['top', 'bottom', 'left', 'right'].indexOf(this.options.position) === -1) {
                    throw "Invalid position, available positions: 'top', 'bottom', 'left', 'right'.";
                }
                $(document).click(this.clickedOutside);
                this.buildMarkup();
                this.picker.hide();
                $('body').append(this.picker);
                this.current_date = {
                    day: 1,
                    month: 1,
                    year: new Date().getFullYear(),
                    hour: 12,
                    minute: 0,
                    ampm: 'am'
                };
                this.current_date = $.extend({}, this.current_date, this.options.initial_value);
                _ref = this.current_date;
                for (type in _ref) {
                    value = _ref[type];
                    box = this.getBox(type + 's', value);
                    this.selectBox(box);
                }
                this.$el.click((function(_this) {
                    return function() {
                        if (!_this.picker.is(':visible')) {
                            return _this.picker[_this.options.effect]();
                        }
                    };
                })(this));
            }

            MetroDateTimePicker.prototype.buildMarkup = function() {
                var container, day, div, hour, i, max_hours, min_hours, minute, month, opts, position, type, year, _i, _j, _k, _l, _len, _m, _n, _ref, _ref1, _results;
                position = {
                    top: this.$el.offset().top + this.$el.outerHeight() + 'px',
                    left: this.$el.offset().left + 'px'
                };
                if (this.options.position === 'top') {
                    position.top = this.$el.offset().top - this.options.boxes.size - 5 + 'px';
                }
                this.picker = $('<div />').css({
                    position: 'fixed',
                    zIndex: 100,
                    top: position.top,
                    left: 30
                });
                opts = {
                    overflow: 'auto',
                    paddingRight: '20px',
                    height: (this.options.boxes.size * this.options.visible_boxes) + 'px',
                    width: this.options.boxes.size + 'px'
                };
                this.days = $('<div />').attr({
                    'box-type': 'days'
                }).css(opts);
                this.months = $('<div />').attr({
                    'box-type': 'months'
                }).css(opts);
                this.years = $('<div />').attr({
                    'box-type': 'years'
                }).css(opts);
                this.hours = $('<div />').attr({
                    'box-type': 'hours'
                }).css(opts);
                this.minutes = $('<div />').attr({
                    'box-type': 'minutes'
                }).css(opts);
                this.ampm = $('<div />').attr({
                    'box-type': 'ampm'
                }).css(opts);
                this.buttons = $('<div />').attr({
                    'box-type': 'buttons'
                }).css(opts);
                this.ampm.append($('<div />').text('AM').attr({
                    'datetime-value': 'am',
                    'datetime-name': 'ampm'
                }));
                this.ampm.append($('<div />').text('PM').attr({
                    'datetime-value': 'pm',
                    'datetime-name': 'ampm'
                }));
                this.buttons.append($('<div />').attr({
                    'datetime-value': 'ok-btn'
                }).text('OK'));
                if (this.options.show_date) {
                    for (day = _i = 1; _i <= 31; day = ++_i) {
                        this.days.append($('<div />').attr({
                            'datetime-idx': day - 1,
                            'datetime-value': day,
                            'datetime-name': 'day'
                        }).text(this.formatter.padLeft(day, 2)));
                    }
                    for (month = _j = 0; _j <= 11; month = ++_j) {
                        this.months.append($('<div />').attr({
                            'datetime-idx': month,
                            'datetime-value': month + 1,
                            'datetime-name': 'month'
                        }).text(this.options.months[month]));
                    }
                    for (year = _k = 1950, _ref = new Date().getFullYear(); 1950 <= _ref ? _k <= _ref : _k >= _ref; year = 1950 <= _ref ? ++_k : --_k) {
                        this.years.append($('<div />').attr({
                            'datetime-idx': year - 1950,
                            'datetime-value': year,
                            'datetime-name': 'year'
                        }).text(year));
                    }
                }
                if (this.options.time_format !== 'none') {
                    min_hours = this.options.time_format === '12h' ? 1 : 0;
                    max_hours = this.options.time_format === '12h' ? 12 : 23;
                    for (hour = _l = min_hours; min_hours <= max_hours ? _l <= max_hours : _l >= max_hours; hour = min_hours <= max_hours ? ++_l : --_l) {
                        this.hours.append($('<div />').attr({
                            'datetime-idx': hour,
                            'datetime-value': hour,
                            'datetime-name': 'hour'
                        }).text(this.formatter.padLeft(hour, 2)));
                    }
                    for (minute = _m = 0; _m <= 59; minute = ++_m) {
                        if (minute % this.options.minutes_skip !== 0) {
                            continue;
                        }
                        this.minutes.append($('<div />').attr({
                            'datetime-idx': minute,
                            'datetime-value': minute,
                            'datetime-name': 'minute'
                        }).text(this.formatter.padLeft(minute, 2)));
                    }
                }
                _ref1 = [this.days, this.months, this.years, this.hours, this.minutes, this.ampm, this.buttons];
                _results = [];
                for (i = _n = 0, _len = _ref1.length; _n < _len; i = ++_n) {
                    div = _ref1[i];
                    type = div.attr('box-type');
                    if (type === 'ampm' && this.options.time_format !== '12h') {
                        continue;
                    }
                    if ((type === 'minutes' || type === 'hours') && this.options.time_format === 'none') {
                        continue;
                    }
                    if ((type === 'days' || type === 'months' || type === 'years') && !this.options.show_date) {
                        continue;
                    }
                    div.find('div').click(this.boxClicked).attr('box-type', type).css({
                        fontSize: this.options.boxes.fontSize,
                        fontFamily: this.options.boxes.fontFamily,
                        width: this.options.boxes.size + 'px',
                        height: this.options.boxes.size + 'px',
                        lineHeight: this.options.boxes.size + 'px',
                        color: 'white',
                        textAlign: 'center',
                        fontFamily: 'Arial, sans-serif',
                        border: '1px solid #999',
                        margin: '2px 0px',
                        cursor: 'pointer'
                    }).hide();
                    if (type === 'years') {
                        this.selectBox(div.find(':last-child'));
                    } else {
                        this.selectBox(div.find(':first-child'));
                    }
                    container = $('<div />').attr('class', 'metro-container').css({
                        height: (this.options.boxes.size * this.options.visible_boxes) + 'px',
                        width: this.options.boxes.size + 'px',
                        marginRight: '5px',
                        position: 'relative',
                        display: 'inline-block',
                        overflow: 'hidden'
                    }).append(div);
                    _results.push(this.picker.append(container));
                }
                return _results;
            };

            MetroDateTimePicker.prototype.persistCurrentDate = function() {
                var ampm, box, date, day, hour, int_month, minute, month, month_days, year;
                day = this.formatter.padLeft(this.current_date['day'], 2);
                month = this.formatter.padLeft(this.current_date['month'], 2);
                year = this.current_date['year'];
                hour = this.formatter.padLeft(this.current_date['hour'], 2);
                minute = this.formatter.padLeft(this.current_date['minute'], 2);
                ampm = this.current_date['ampm'];
                month_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                int_month = parseInt(month, 10);
                if (day > month_days[int_month - 1]) {
                    day = month_days[int_month - 1];
                    box = this.days.find('[datetime-value=' + day + ']');
                    this.selectBox(box);
                }
                date = this.options.format;
                if (this.options.show_date) {
                    date = date.replace(/\{da\}/, day);
                    date = date.replace(/\{mo\}/, month);
                    date = date.replace(/\{ye\}/, year);
                } else {
                    date = date.replace(/\{da\}/, '');
                    date = date.replace(/\{mo\}/, '');
                    date = date.replace(/\{ye\}/, '');
                }
                if (this.options.time_format === 'none') {
                    date = date.replace(/\{ho\}/, '');
                    date = date.replace(/\{mi\}/, '');
                    date = date.replace(/\{me\}/, '');
                } else {
                    date = date.replace(/\{ho\}/, hour);
                    date = date.replace(/\{mi\}/, minute);
                    date = this.options.time_format === '12h' ? date.replace(/\{me\}/, ampm) : date.replace(/\{me\}/, '');
                }
                return this.$el.val(date);
            };

            MetroDateTimePicker.prototype.selectBox = function(box) {
                return box.css({
                    backgroundColor: '#' + this.options.boxes.color,
                    color: '#' + this.options.boxes.fontColor,
                    border: 'none'
                }).attr('datetime-selected', 'true').show().siblings().css({
                    backgroundColor: '#333',
                    border: '1px solid #999'
                }).attr('datetime-selected', 'false').hide();
            };

            MetroDateTimePicker.prototype.getBox = function(type, value) {
                return this.picker.find('div[box-type=' + type + '] > div[datetime-value=' + value + ']');
            };

            MetroDateTimePicker.prototype.getSelectedBoxes = function() {
                var selected;
                selected = [];
                this.picker.find('[datetime-selected=true]').each(function(idx, el) {
                    return selected.push($(el));
                });
                return selected;
            };

            MetroDateTimePicker.prototype.clickedOutside = function(e) {
                var box, _i, _len, _ref;
                if ($(e.target)[0] === this.$el[0]) {
                    return;
                }
                _ref = this.getSelectedBoxes();
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    box = _ref[_i];
                    this.hideBoxListAndSelect(box);
                }
                return this.picker.hide();
            };

            MetroDateTimePicker.prototype.boxClicked = function(e) {
                var el, name, type, value;
                e.stopPropagation();
                el = $(e.target);
                type = el.attr('box-type');
                if (el.attr('datetime-value') === 'ok-btn') {
                    this.picker.hide();
                    this.persistCurrentDate();
                    return;
                }
                if (this.current_box_list !== null && this.current_box_list !== type) {
                    this.hideBoxList(this.current_box_list);
                }
                if (this.box_status[type] !== 'shown') {
                    return this.displayListFor(el);
                } else {
                    value = el.attr('datetime-value');
                    name = el.attr('datetime-name');
                    this.current_date[name] = value;
                    return this.hideBoxListAndSelect(el);
                }
            };

            MetroDateTimePicker.prototype.displayListFor = function(el) {
                var idx, type;
                type = el.attr('box-type');
                el.parent().parent().animate({
                    top: '-' + (this.options.boxes.size + 4) + 'px'
                }, 'fast');
                idx = parseInt(el.attr('datetime-idx'), 10) - 1;
                el.siblings().fadeIn();
                el.parent().animate({
                    'scrollTop': (idx * this.options.boxes.size) + (4 * idx)
                }, this.options.scroll_speed);
                this.box_status[type] = 'shown';
                return this.current_box_list = type;
            };

            MetroDateTimePicker.prototype.hideBoxListAndSelect = function(el) {
                var type;
                type = el.attr('box-type');
                el.parent().parent().animate({
                    top: '0px'
                }, 'fast');
                this.selectBox(el);
                this.box_status[type] = 'hidden';
                return this.current_box_list = null;
            };

            MetroDateTimePicker.prototype.hideBoxList = function(type) {
                var selected;
                selected = this.picker.find('div[box-type=' + type + '] > div[datetime-selected=true]');
                return this.hideBoxListAndSelect(selected);
            };

            return MetroDateTimePicker;

        })();
        return $.fn.extend({
            metroDateTimePicker: function() {
                var args, option;
                option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return this.each(function() {
                    var $this, data;
                    $this = $(this);
                    data = $this.data('metroDateTimePicker');
                    if (!data) {
                        $this.data('metroDateTimePicker', (data = new MetroDateTimePicker(this, option)));
                    }
                    if (typeof option === 'string') {
                        return data[option].apply(data, args);
                    }
                });
            }
        });
    })(window.jQuery, window);

}).call(this);