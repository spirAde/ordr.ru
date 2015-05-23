(function(undefined){
  'use strict';

  var mixins = {
    slice: function (array, start, end) {
      start || (start = 0);
      if (typeof end == 'undefined') {
        end = array ? array.length : 0;
      }
      var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = array[start + index];
      }
      return result;
    }
  }

  _.mixin(mixins);
})();