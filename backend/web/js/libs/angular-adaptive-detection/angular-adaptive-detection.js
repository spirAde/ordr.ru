(function() {
  'use strict';

  var adaptive = angular.module('adaptive.detection', []);

  adaptive.provider('$detection', [function() {

    this.userAgent = navigator.userAgent;

    this.setUserAgent = function(userAgent) {
      this.userAgent = userAgent;
    };

    this.device =
        (/(iPad|iPhone|iPod)/gi).test(this.userAgent) ||
        (/(Android)/gi).test(this.userAgent) ||
        (/(IEMobile)/gi).test(this.userAgent)
        ? 'mobile' : 'desktop';

    this.resolution = {width: window.innerWidth, height: window.innerHeight};

    this.$get = ['$window', function($window) {
      var userAgent = this.userAgent,
          screenWidth = $window.innerWidth,
          screenHeight = $window.innerHeight;

      return {
        getScreenResolution: function() {
          return {
            width: screenWidth,
            height: screenHeight
          }
        },
        getUserAgent: function(){
          return userAgent;
        },
        isiOS: function(){
          return (/(iPad|iPhone|iPod)/gi).test(userAgent);
        },
        isAndroid: function(){
          return (/(Android)/gi).test(userAgent);
        },
        isWindowsPhone: function(){
          return (/(IEMobile)/gi).test(userAgent);
        },
        isMobile: function() {
          return this.isAndroid() || this.isiOS() || this.isWindowsPhone();
        }
      };
    }];
  }]);

  adaptive.directive('resize', function ($window) {
    return {
      controller: function ($scope, $rootScope) {
        angular.element($window).bind('resize', function () {
          $scope.$apply(function () {
            $scope.screen = {
              width: $window.innerWidth,
              height: $window.innerHeight
            }
          });
        });
      }
    };
  });
})();