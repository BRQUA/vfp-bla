  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB-H7pmw71std48GKRCoRtMUKxI08zcuEs",
    authDomain: "vfp-bla.firebaseapp.com",
    databaseURL: "https://vfp-bla.firebaseio.com",
    projectId: "vfp-bla",
    storageBucket: "vfp-bla.appspot.com",
    messagingSenderId: "775389947535"
  };
  
firebase.initializeApp(config);

// create our angular module and inject firebase
var visDispApp = angular.module('visDispApp', [
  'ngRoute', 'viewControllers',  'firebase'
])

// for ngRoute
visDispApp.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/login");
    }
  });
}]);
//routes
visDispApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/main', {
        templateUrl: 'partials/main.html'
        ,controller: 'MainController'
    }).
    when('/area/:areaId', {
        templateUrl: 'partials/area.html'
        ,controller: 'MainController'
        }).
    when('/hub/', {
        templateUrl: 'partials/hub.html'
        ,controller: 'MainController'
        }).
    when('/hubUsers/:userId', {
        templateUrl: 'partials/hubUsers.html'
        ,controller: 'HubUsersController'
    }).
    when('/users/:areaId/:userId', {
        templateUrl: 'partials/nacUsers.html'
        ,controller: 'NacUsersController'
    }).
    when('/login', {
        templateUrl: 'partials/login.html'
        , controller: 'AuthController'
    }).
    when('/reporting', {
        templateUrl: 'partials/reporting.html'
        , controller: 'ReportingController'
    }).
    when('/register', {
        templateUrl: 'partials/register.html'
        , controller: 'AuthController'
    }).
    when('/config', {
        controller: 'ConfigController'
        ,templateUrl: 'partials/config.html'
         ,resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      'currentAuth': ['Authentication', function(Authentication) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $stateChangeError (see above)
        return Authentication.$requireSignIn();
      }]
    }
    }).
    when('/user2', {
        templateUrl: 'partials/user2.html'
        , controller: 'UserController2'  
    }).
    otherwise({
        redirectTo: '/main'
    });
}]);