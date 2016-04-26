// Ionic radiuz8 App
var domain = 'http://celebrity-connect.cruxservers.in/api/?action=';
angular.module('radiuz8', ['ionic', 'ngCordova', 'radiuz8.controllers', 'radiuz8.services', 'radiuz8.directives', 'ion-autocomplete', 'angularMoment', 'ngtweet', 'ion-gallery'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
     setTimeout(function() {
      try { 
        navigator.splashscreen.hide();
      } catch(e) { 
        console.log('It will work on app only');
      }
    }, 300);
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
.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
  
 $sceDelegateProvider.resourceUrlWhitelist(['self', new RegExp('^(http[s]?):\/\/(w{3}.)?youtube\.com/.+$')]);

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
    url: '/celebrity-detail/:name',
    views: {
      'menuContent': {
        templateUrl: 'templates/celebrity-detail.html',
        controller: 'DetailCtrl'
      }
    }
  })
  .state('app.chat-listing', {
    url: '/chat-listing',
    views: {
      'menuContent': {
        templateUrl: 'templates/chat-listing.html',
        controller: 'ChatListingCtrl'
      }
    }
  })
  .state('app.chat', {
    url: '/chat/:celebId?name',
    views: {
      'menuContent': {
        templateUrl: 'templates/chat.html',
        controller: 'ChatCtrl'
      }
    }
  })
  .state('app.user-profile', {
    url: '/user-profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/user-profile.html',
        controller: 'userProfileCtrl'
      }
    }
  })
  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html' 
      }
    }
  })
  .state('app.terms', {
    url: '/terms',
    views: {
      'menuContent': {
        templateUrl: 'templates/terms.html' 
      }
    }
  })
  .state('app.contact-celeb', {
    url: '/contact-celeb/:celebId?name',
    views: {
      'menuContent': {
        templateUrl: 'templates/contact-celeb.html',
        controller: 'ContactCelebCtrl' 
      }
    }
  })
  .state('app.contact', {
    url: '/contact',
    views: {
      'menuContent': {
        templateUrl: 'templates/contact.html' 
      }
    }
  })
  .state('app.feeds', {
    cache: false,
    url: '/feeds',
    views: {
      'menuContent': {
        templateUrl: 'templates/feeds.html',
        controller: 'FeedsCtrl'
      }
    }
  })
  .state('app.followedCelebs', {
    cache: false,
    url: '/followed-celebrity',
    views: {
      'menuContent': {
        templateUrl: 'templates/followed-celeb.html',
        controller: 'FollowedCelebCtrl'
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
}) 