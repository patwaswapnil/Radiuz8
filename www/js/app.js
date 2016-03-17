// Ionic radiuz8 App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'radiuz8' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'radiuz8.controllers' is found in controllers.js
angular.module('radiuz8', ['ionic', 'ngCordova', 'radiuz8.controllers', 'radiuz8.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('app.celebrity-listing', {
    url: '/celebrity-listing',
    views: {
      'menuContent': {
        templateUrl: 'templates/celebrity-listing.html',
        controller: 'ListingCtrl'
      }
    }
  })
  .state('app.celebrity-detail', {
    url: '/celebrity-detail',
    views: {
      'menuContent': {
        templateUrl: 'templates/celebrity-detail.html',
        controller: 'DetailCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
