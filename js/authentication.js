
visDispApp.factory("Authentication", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);