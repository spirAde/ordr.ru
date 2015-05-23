(function() {
  'use strict';

  angular
    .module('select-services-directive', [])
    .directive('selectServices', selectServices);

  selectServices.$inject = ['$rootScope', '$compile', 'orderservice'];

  function selectServices($rootScope, $compile, orderservice) {

    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      scope: {
        list: '=list',
        calculate: '&calculate'
      },
      template: '<div class="select-services"></div>',
      link: function(scope, element, attrs) {
        var outText = [],
          services = [];

        var placeholderSpan;

        var boxIsOpen = false;
        var $totalCostField = element.closest('.w50-left').next().find('.total-cost');
        var captionSelectBox = angular.element('<p class="caption-select-box"></p>');
        var emptyLabel = angular.element('<label><i></i></label>');

        // Если у бани нету услуг, просто пишем об этом и заканчиваем
        var isEmpty = _.every(scope.list, function(category) {
          return category.services.length === 0
        });

        if (isEmpty) {
          placeholderSpan = angular.element('<span class="placeholder">Дополнительные услуги отсутствуют</span>');
          captionSelectBox.append(placeholderSpan);

          element.append(captionSelectBox);
          $compile(captionSelectBox)(scope);

          return false;
        }

        placeholderSpan = angular.element('<span class="placeholder">Дополнительные услуги и удобства</span>')

        captionSelectBox.append(placeholderSpan);
        captionSelectBox.append(emptyLabel);

        var optionsWrapper = scope.multiple === true ?
          angular.element('<div class="options-wrapper multiple"></div>') :
          angular.element('<div class="options-wrapper"></div>');

        var scroll = angular.element('<div class="scroll"></div>');

        var optionsContainer = angular.element('<ul class="options"></ul>');

        angular.forEach(scope.list, function(category, categoryId) {

          if (category.services.length) {

            var optionElement = angular.element(
              '<li class="disabled"><span><i></i></span><label>' + category.name + '</label></li>'
            );

            optionsContainer.append(optionElement);

            angular.forEach(category['services'], function(service) {

              var optionElement = angular.element(
                '<li class=""><span><i></i></span><label><span class="main-text">'+
                service.name + '</span><span class="option-cost">' + service.price + '</span></label></li>');

              optionsContainer.append(optionElement);

              optionElement.bind('click', function(e) {

                e.preventDefault();
                var text = $(this).find('.main-text').text();

                $(this).hasClass('selected') ?
                  outText.splice(outText.indexOf(text), 1) :
                  outText.push(text);

                $(this).toggleClass('selected');
                setText();

                if (optionElement.hasClass('selected')) {
                  services.push(service.id);
                }
                else {
                  _.pull(services, service.id);
                }

                scope.calculate({services: services});
              });
            });
          }
        });

        scroll.append(optionsContainer);
        optionsWrapper.append(scroll);

        element.append(captionSelectBox);
        element.append(optionsWrapper);

        $compile(optionsWrapper)(scope);

        $(scroll).perfectScrollbar({
          suppressScrollX: true
        });

        var openBox = function() {
          boxIsOpen ? optionsWrapper.removeClass('open') : optionsWrapper.addClass('open');
          boxIsOpen = !boxIsOpen;
        }

        // Открытие/закрытие выпадающего списка
        captionSelectBox.bind('click', openBox);

        function setText() {
          if (outText.length) {
            placeholderSpan.removeClass('placeholder');

            outText.length <= 3 ?
              placeholderSpan.text(outText.join(', ')) :
              placeholderSpan.text('Выбранно ' + outText.length + ' услуг');
          }
          else {
            placeholderSpan.addClass('placeholder');
            placeholderSpan.text('Дополнительные услуги и удобства');
          }
        }
      }
    }
  }
}());