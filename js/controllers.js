var viewControllers = angular.module('viewControllers', ['firebase', 'ngSanitize','angular-openweathermap', 'ngTouch', 'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping', 'ngTable']);

        var ref = firebase.database().ref();
        var firstLine = ref.child("V110");
        var firstLineInfo = firstLine.child("info");
        var secondLine = ref.child("V136");
        var secondLineInfo = secondLine.child("info");
        var thirdLine = ref.child("Finish");
        var thirdLineInfo = thirdLine.child("info");



        var nacelle = ref.child("nacelle");
        var nacinfo = nacelle.child("info");
        var hub = ref.child("hub");
        var hubinfo = hub.child("info");
        var config = ref.child("config");
        var supps = ref.child("supps");  
        var log = ref.child("log");

viewControllers.directive('myCurrentTime', ['$interval', 'dateFilter'
      , function ($interval, dateFilter) {
        // return the directive link function. (compile function not needed)
        return function (scope, element, attrs) {
            var format, // date format
                stopTime; // so that we can cancel the time updates
            // used to update the UI
            function updateTime() {
                element.text(dateFilter(new Date(), format));
            }
            // watch the expression, and update the UI on change.
            scope.$watch(attrs.myCurrentTime, function (value) {
                format = value;
                updateTime();
            });
            stopTime = $interval(updateTime, 1000);
            // listen on DOM destroy (removal) event, and cancel the next UI update
            // to prevent updating time after the DOM element was removed.
            element.on('$destroy', function () {
                $interval.cancel(stopTime);
            });
        }
      }]); // myCurrent Time Directive

viewControllers.controller('MainController', ['$scope', '$firebaseObject', '$routeParams', function ($scope, $firebaseObject, $routeParams) {

        var syncObject = $firebaseObject(firstLine);
        syncObject.$bindTo($scope, "firstLine");

        var syncObject2 = $firebaseObject(firstLineInfo);
        syncObject2.$bindTo($scope, "firstLineInfo");
    
            var syncObject = $firebaseObject(secondLine);
        syncObject.$bindTo($scope, "secondLine");

        var syncObject2 = $firebaseObject(secondLineInfo);
        syncObject2.$bindTo($scope, "secondLineInfo");
    
            var syncObject = $firebaseObject(thirdLine);
        syncObject.$bindTo($scope, "thirdLine");

        var syncObject2 = $firebaseObject(thirdLineInfo);
        syncObject2.$bindTo($scope, "thirdLineInfo");
    
        var syncObject = $firebaseObject(nacelle);
        syncObject.$bindTo($scope, "nacelle");

        var syncObject2 = $firebaseObject(nacinfo);
        syncObject2.$bindTo($scope, "nacInfo");
        
        var syncObject3 = $firebaseObject(hub);
        syncObject3.$bindTo($scope, "hub");
        
        var syncObject4 = $firebaseObject(hubinfo);
        syncObject4.$bindTo($scope, "hubInfo");
          
        var syncObject5 = $firebaseObject(config);
        syncObject5.$bindTo($scope, "config");

        var syncObject6 = $firebaseObject(supps);
        syncObject6.$bindTo($scope, "supps");
    
        $scope.areaItem = $routeParams.areaId;

}]); //main controller 

viewControllers.controller('HubUsersController', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$interval', function ($scope, $routeParams, $firebaseObject, $firebaseArray, $interval) { 
    
    var hubSubs = hub.child("subs");

    var syncObject = $firebaseObject(hub);
    var syncObject2 = $firebaseObject(hubSubs);
    var syncObject3 = $firebaseObject(hubinfo);
    var syncObject4 = $firebaseObject(config);

    syncObject.$bindTo($scope, "hub");  
    syncObject2.$bindTo($scope, "subs");
    syncObject3.$bindTo($scope, "hubInfo");
    syncObject4.$bindTo($scope, "config");
    
    //    Log for Arrays
    var tsRef = log.child("TS")
    var qRef = log.child("Q");
    var mRef = log.child("M")
    var lRef = log.child("L")
    
    $scope.tsLog = $firebaseArray(tsRef);
    $scope.qLog = $firebaseArray(qRef);
    $scope.lLog = $firebaseArray(lRef);
    $scope.mLog = $firebaseArray(mRef);
    $scope.log = $firebaseArray(log);
    
    //    Route params
    $scope.userItem = $routeParams.userId;
    
    //    Set reset, paus, and stop buttons to disabled upon load
    $scope.hubResetBtn = true;
    $scope.hubPauseBtn = true;
    $scope.hubStopBtn = true;

    //     Support Trigger function - checks hub items and support, triggers if false and starts logging function
    $scope.suppTrigger = function (userItem, from) {
        //      if sub not true, then make true, start log timer
        if (!$scope.hub.subs[userItem].trigger) {
            $scope.hub.subs[userItem].trigger = true;
            $scope.hub.subs[userItem].style = from;
            $scope.hub.subs[userItem].opStyle = from + '-op';
            $scope.hubStartLog(userItem, from);
        }
        //      if sub true, then make sub not true, stop timer
        else if ($scope.hub.subs[userItem].trigger) {
            $scope.hub.subs[userItem].trigger = false;
            $scope.hub.subs[userItem].style = "time-slot";
            $scope.hub.subs[userItem].opStyle = 'time-slot-op';
            $scope.hubStopLog(userItem, from);
        }
        
        return {
          from: from
        };
    }
    
    //     Logging Function
    var hubStopLog;
    var hubLogger = 0;
    
    //    Start Logging
    $scope.hubStartLog = function (userItem, from) {
        $scope.showElapsedTime = true;
        $scope.suppTrig = from;
        $scope.suppUser = userItem;
        $scope.elapsedTime = 0;
        
        // Don't start a new log if we are already loggin
        if ($scope.config.logging) {
            if (angular.isDefined(hubStopLog)) return;
            console.log("Logging Started");
            hubStopLog = $interval(function () {
                hubLogger += 0.1;
                console.log(hubLogger);
                $scope.elapsedTime = hubLogger;
            }, 6000);
        }
        else {
            console.log("Logging Disabled.");
        }
    };
    
    //    Stop Logging
    $scope.hubStopLog = function (userItem, from) {
        if (angular.isDefined(hubStopLog)) {
            $interval.cancel(hubStopLog);
            hubStopLog = undefined;
            if(hubLogger > 0.99){
                $scope.log.$add({
                Timestamp: firebase.database.ServerValue.TIMESTAMP
                , Area: userItem
                , Time: hubLogger
                , Support: from
            });
                console.log("Logged because > 0");
            }
            else {
                console.log("Not logged because < 1");
            }
            
        }
        hubLogger = 0;
        $scope.showElapsedTime = false;
    };
    $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed too
        $scope.hubStopLog();
    });
    
    //    Auto Timer
var clock;
$scope.hubStartTakt = function () {
// Don't start a new fight if we are already fighting
    if (angular.isDefined(clock)) return;
        $scope.hubStartBtn = true;
        $scope.hubStopBtn = false;
    console.log("Auto Takt Timer Started");
    $scope.hubTaktStart();
    clock = $interval(function () {
    var d = new Date();
    var minutes = d.getHours();    
    var seconds = d.getMinutes(); 
    var time = d.getTime();
//    console.log(minutes + ":" + seconds);

    var myMin = 0;
    var myMin1 = myMin +1;   
    var myMin2 = myMin +2; 
    var myMin3 = myMin +3; 
    var myMin6 = myMin +6; 
    var myMin7 = myMin +7;
    var myMin8 = myMin +8;
    var myMin9 = myMin +9;
    var myMin10 = myMin +10;
    var myMin11 = myMin +11;
    var myMin12 = myMin +12;
    var myMin13 = myMin +13;
    var myMin14 = myMin +14;
    var myMin15 = myMin +15;
    var myMin16 = myMin +16;
    var myMin17 = myMin +17;
    var myMin18 = myMin +18;
    var myMin19 = myMin +19;
    var myMin20 = myMin +20;
    var myMin21 = myMin +21;
    var myMin22 = myMin +22;
    var myMin23 = myMin +23;
                           
    //2nd Shift    
    if ($scope.hub.info.actualTakt == "x") $scope.hubStopTakt();    
    else if ((minutes == myMin && seconds >-1) && (minutes == myMin && seconds <60))  {$scope.hubTaktStart();}           // 60 mins work  0000-0100
    else if ((minutes == myMin1 && seconds >-1) && (minutes == myMin1 && seconds <16))  {$scope.hubTaktPause();}    // 15 mins break 0100-0115
    else if ((minutes == myMin1 && seconds >15) && (minutes == myMin1 && seconds <60))  {$scope.hubTaktStart();}    // 45 mins work  0116-0200
    else if ((minutes == myMin2 && seconds >-1) && (minutes == myMin2 && seconds <60)) {$scope.hubTaktStart();}    // 60 mins work  0200-0300
    else if ((minutes == myMin3 && seconds >30) && (minutes == myMin3 && seconds <60)) {$scope.hubTaktStart();}     // 30 mins work  0300-0330
    
    //1st Shift
    else if ((minutes == myMin6 && seconds >5) && (minutes == myMin6 && seconds <60))  {$scope.hubTaktStart();}     // 55 mins work  0605-0700
    else if ((minutes == myMin7 && seconds >-1) && (minutes == myMin7 && seconds <60)) {$scope.hubTaktStart();}     // 60 mins work  0700-0800    
    else if ((minutes == myMin8 && seconds >-1) && (minutes == myMin8 && seconds <16)) {$scope.hubTaktPause();}     // 15 mins break 0800-0815
    else if ((minutes == myMin8 && seconds >15) && (minutes == myMin8 && seconds <60)) {$scope.hubTaktStart();}     // 45 mins work  0816-0900
    else if ((minutes == myMin9 && seconds >-1) && (minutes == myMin9 && seconds <60)) {$scope.hubTaktStart();}     // 60 mins work  0900-1000
    else if ((minutes == myMin10 && seconds >-1) && (minutes == myMin10 && seconds <60)) {$scope.hubTaktStart();}   // 60 mins work  1000-1100
    else if ((minutes == myMin11 && seconds >-1) && (minutes == myMin11 && seconds <31)) {$scope.hubTaktPause();}   // 30 mins break 1100-1130
    else if ((minutes == myMin11 && seconds >30) && (minutes == myMin11 && seconds <60)) {$scope.hubTaktStart();}   // 30 mins work  1131-1200
    else if ((minutes == myMin12 && seconds >-1) && (minutes == myMin12 && seconds <60)) {$scope.hubTaktStart();}   // 60 mins work  1200-1300
    else if ((minutes == myMin13 && seconds >-1) && (minutes == myMin13 && seconds <16)) {$scope.hubTaktPause();}   // 15 mins break 1300-1315
    else if ((minutes == myMin13 && seconds >15) && (minutes == myMin13 && seconds <60)) {$scope.hubTaktStart();}   // 45 mins work  1316-1400
    else if ((minutes == myMin14 && seconds >-1) && (minutes == myMin14 && seconds <60)) {$scope.hubTaktStart();}   // 60 mins work  1400-1500
    else if ((minutes == myMin15 && seconds >-1) && (minutes == myMin15 && seconds <60)) {$scope.hubTaktStart();}   // 60 mins work  1500-1600
    else if ((minutes == myMin16 && seconds >-1) && (minutes == myMin16 && seconds <31)) {$scope.hubTaktStart();}   // 30 mins break 1600-1630
    
    //2nd Shift
    else if ((minutes == myMin17 && seconds >5) && (minutes == myMin17 && seconds <60))  {$scope.hubTaktStart();}    // 55 mins work  1705-1800
    else if ((minutes == myMin18 && seconds >-1) && (minutes == myMin18 && seconds <60)) {$scope.hubTaktStart();}    // 60 mins work  1800-1900    
    else if ((minutes == myMin19 && seconds >-1) && (minutes == myMin19 && seconds <16)) {$scope.hubTaktPause();}    // 15 mins break 1900-1915
    else if ((minutes == myMin19 && seconds >15) && (minutes == myMin19 && seconds <60)) {$scope.hubTaktStart();}    // 45 mins work  1916-2000
    else if ((minutes == myMin20 && seconds >-1) && (minutes == myMin20 && seconds <60)) {$scope.hubTaktStart();}    // 60 mins work  2000-2100
    else if ((minutes == myMin21 && seconds >-1) && (minutes == myMin21 && seconds <60)) {$scope.hubTaktStart();}    // 60 mins work  2100-2200
    else if ((minutes == myMin22 && seconds >-1) && (minutes == myMin22 && seconds <31)) {$scope.hubTaktPause();}    // 30 mins break 2200-2230
    else if ((minutes == myMin22 && seconds >30) && (minutes == myMin22 && seconds <60)) {$scope.hubTaktStart();}    // 30 mins work  2231-2300
    else if ((minutes == myMin23 && seconds >-1) && (minutes == myMin23 && seconds <60)) {$scope.hubTaktStart();}    // 60 mins work  2300-2400    
    
    else {$scope.hubStopTakt();} // STOP 0331-0605 && 1631-1705
        
    }, 1000);

};    
$scope.hubStopTakt = function () {
     $scope.hub.status = "Stopped";
     if (angular.isDefined(clock)) {
         $interval.cancel(clock);
         clock = undefined;
                     $scope.hub.info.accTime += $scope.hub.info.actualTakt;
            $scope.hub.info.actualTakt = $scope.hub.info.staticTakt;
            $scope.hubAccTimeColor();
         $scope.hubStartBtn = false;
         $scope.hubStopBtn = true;
     }
    $scope.hubTaktStop();
 };
    
    //  Hub Takt Timer
    var hubTakt;
    $scope.hubTaktStart = function() {
          // Don't start a new fight if we are already fighting
          if (angular.isDefined(hubTakt)) return;
            console.log("Start");
            if ($scope.hub.info.actualTakt == "x") {$scope.hubTaktStop();}
            $scope.hub.status = "Running";
            $scope.hubStopBtn = false;
            $scope.hubPauseBtn = false;
            $scope.hubStartBtn = true;
        
          hubTakt = $interval(function() {
            if ($scope.hub.info.actualTakt <= $scope.hub.info.staticTakt) {
                $scope.hub.info.actualTakt -= 0.1;
            } 
            else {
                $scope.hubTaktStop();
            }
            }, 6000);
    };
    $scope.hubTaktPause = function () {
        //     Pause timer and update status to paused
        if (angular.isDefined(hubTakt)) {
            $interval.cancel(hubTakt);
            hubTakt = undefined;
            $scope.hubStopBtn = true;
            $scope.hubStartBtn = false;
            $scope.hubPauseBtn = true;
            $scope.hub.status = "Paused";
            
        }
       
    };
    $scope.hubTaktStop = function () {
        //      add actual time to accumulated time and change status to stopped, reset takt to static
        $scope.hub.status = "Stopped";
        if (angular.isDefined(hubTakt)) {
            $interval.cancel(hubTakt);
            hubTakt = undefined;
            $scope.hubPauseBtn = true;
            $scope.hubStartBtn = false;
            $scope.hubStopBtn = true;
        }
    };
    $scope.hubTaktReset = function () {
        $scope.hub.info.accTime = 0;
        $scope.hub.info.actualGoal = 0;
        $scope.hubResetBtn = true;
    };
    $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed too
        $scope.hub.status = "Stopped";
        $scope.hubTaktStop();
    });
    
    //  Stop timer if user leaves page
    $scope.$on('$locationChangeStart', function( event ) {
        if(angular.isDefined(clock)) {
            var answer = confirm("Timer is running, leaving will stop it. Are you sure you want to leave this page?");
            if (!answer) {
                event.preventDefault();
            }
            else {
            $scope.hubStopTakt();
                console.log("Leaving page, stopped timer.");
                }
        }
        if(angular.isDefined(hubStopLog)) {
            var answer = confirm("Support Timer is running, leaving will stop it. Are you sure you want to leave this page?");
            if (!answer) {
                event.preventDefault();
            }
            else {    
            $scope.hubStopLog();
                console.log("Leaving page, stopped Log.");
                }
        }
});
  
    //  Hub Counter
    $scope.hubCountUp = function () {
        if ($scope.hub.info.actualGoal != $scope.hub.info.weeklyGoal) {
            $scope.hub.info.actualGoal += 1;
            $scope.hub.info.lastStep = Date.now();
        }
        else {
            alert("Goals have been met. Reset counts!");
            $scope.hubResetBtn = false;
        }
    }
    $scope.hubCountDown = function () {
            if ($scope.hubInfo.actualGoal > 0) {
                $scope.hubInfo.actualGoal -= 1;
                $scope.hubResetBtn = false;
            }
            else {
                alert("Cannot go below 0.");
            }
        }
    $scope.hubAccTimeColor = function() {
      if($scope.hub.info.accTime<0) {
          $scope.hub.info.accTimeColor = "red";
      }  
        else if($scope.hub.info.accTime>0) {
            $scope.hub.info.accTimeColor = "chartreuse";
        }
        else {
            $scope.hub.info.accTimeColor = "white";
        }
    };
    
}]);//hubUsers Controller

viewControllers.controller('NacUsersController', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$interval', '$window', function ($scope, $routeParams, $firebaseObject, $firebaseArray, $interval, $window) 
{ 
 
 var nacAreas = firstLine.child("areas");
    
 var syncObject = $firebaseObject(firstLine);
 var syncObject2 = $firebaseObject(nacAreas);
 var syncObject3 = $firebaseObject(firstLineInfo);
 var syncObject4 = $firebaseObject(config);
    
 syncObject.$bindTo($scope, "nacelle");
 syncObject2.$bindTo($scope, "areas");
 syncObject3.$bindTo($scope, "nacInfo");
 syncObject4.$bindTo($scope, "config");
    
 //    Log for Arrays
 var tsRef = log.child("TS")
 var qRef = log.child("Q");
 var mRef = log.child("M")
 var lRef = log.child("L")
 
 $scope.tsLog = $firebaseArray(tsRef);
 $scope.qLog = $firebaseArray(qRef);
 $scope.lLog = $firebaseArray(lRef);
 $scope.mLog = $firebaseArray(mRef);
 $scope.log = $firebaseArray(log);
 
// Route Parameters
 $scope.userItem = $routeParams.userId;
 $scope.areaItem = $routeParams.areaId;
 
 $scope.nacResetBtn = true;
 $scope.nacPauseBtn = true;
 $scope.nacStopBtn = true;
    
 $scope.suppTrigger = function (areaItem, userItem, from) {
     console.log(areaItem, userItem, from);
//    if area not true, then make true, start log timer 
     if (!$scope.areas[areaItem].subs[userItem].trigger) {
         $scope.areas[areaItem].subs[userItem].trigger = true;
         $scope.areas[areaItem].subs[userItem].style = from;
         $scope.areas[areaItem].subs[userItem].opStyle = from + '-op';
         $scope.areas[areaItem].trigger = true;
         $scope.areas[areaItem].style = from;
         $scope.nacStartLog(areaItem, userItem, from);
     }
     else if ($scope.areas[areaItem].subs[userItem].trigger) {
         $scope.areas[areaItem].subs[userItem].trigger = false;
         $scope.areas[areaItem].subs[userItem].style = "time-slot";
         $scope.areas[areaItem].subs[userItem].opStyle = 'time-slot-op';
         $scope.areas[areaItem].trigger = false;
         $scope.areas[areaItem].style = "time-slot";
         $scope.nacStopLog(areaItem, userItem, from);
     }
     return {
         from: from
     };
 }
 
 // Logging Function
 var nacStopLog;
 var nacLogger = 0;
    
 //    Start Logging
 $scope.nacStartLog = function (areaItem, userItem, from) {
     $scope.showElapsedTime = true;
     $scope.suppTrig = from;
     $scope.suppUser = userItem;
     $scope.elapsedTime = 0;
     $scope.nacReason = prompt("Enter Reason for support");
     
     // Don't start a new log if we are already loggin
     if ($scope.config.logging) {
         if (angular.isDefined(nacStopLog)) return;
         console.log("Logging Started");
         nacStopLog = $interval(function () {
             nacLogger += 0.1;
             console.log(nacLogger);
             $scope.elapsedTime = nacLogger;
         }, 6000);
     }
     else {
         console.log("Logging Disabled.")
     }
 };
 //    Stop Logging
 $scope.nacStopLog = function (areaItem, userItem, from) {
     if (angular.isDefined(nacStopLog)) {
         $interval.cancel(nacStopLog);
         nacStopLog = undefined;
         if(nacLogger >0.99){
            $scope.log.$add({
             Timestamp: firebase.database.ServerValue.TIMESTAMP
             , Area: userItem
             , Time: nacLogger
             , Support: from
                , Reason: $scope.nacReason
         });  
              console.log("Logged because > 0");
         }
         else {
                console.log("Not logged because < 1");
            }
        
     }
     nacLogger = 0;
     $scope.showElapsedTime = false;
 };
 $scope.$on('$destroy', function () {
     // Make sure that the interval is destroyed too
     $scope.nacStopLog();
 });

//  Takt Timer  

//    Auto Timer
var clock;
$scope.nacStartTakt = function () {
// Don't start a new fight if we are already fighting
    if (angular.isDefined(clock)) return;
        $scope.nacStartBtn = true;
        $scope.nacStopBtn = false;
    console.log("Auto Takt Timer Started");
    clock = $interval(function () {
    var d = new Date();
    var minutes = d.getHours();    
    var seconds = d.getMinutes(); 
    var time = d.getTime();
//    console.log(minutes + ":" + seconds);

    var myMin = 0;
    var myMin1 = myMin +1;   
    var myMin2 = myMin +2; 
    var myMin3 = myMin +3; 
    var myMin6 = myMin +6; 
    var myMin7 = myMin +7;
    var myMin8 = myMin +8;
    var myMin9 = myMin +9;
    var myMin10 = myMin +10;
    var myMin11 = myMin +11;
    var myMin12 = myMin +12;
    var myMin13 = myMin +13;
    var myMin14 = myMin +14;
    var myMin15 = myMin +15;
    var myMin16 = myMin +16;
    var myMin17 = myMin +17;
    var myMin18 = myMin +18;
    var myMin19 = myMin +19;
    var myMin20 = myMin +20;
    var myMin21 = myMin +21;
    var myMin22 = myMin +22;
    var myMin23 = myMin +23;
                           
    //2nd Shift    
    if ($scope.nacelle.info.actualTakt == "x") {$scope.nacStopTakt();}
    else if ((minutes == myMin && seconds >-1) && (minutes == myMin && seconds <60))  {$scope.nacTaktStart();}           // 60 mins work  0000-0100
    else if ((minutes == myMin1 && seconds >-1) && (minutes == myMin1 && seconds <16))  {$scope.nacTaktPause();}    // 15 mins break 0100-0115
    else if ((minutes == myMin1 && seconds >15) && (minutes == myMin1 && seconds <60))  {$scope.nacTaktStart();}    // 45 mins work  0116-0200
    else if ((minutes == myMin2 && seconds >-1) && (minutes == myMin2 && seconds <60)) {$scope.nacTaktStart();}     // 60 mins work  0200-0300
    else if ((minutes == myMin3 && seconds >30) && (minutes == myMin3 && seconds <60)) {$scope.nacTaktStart();}     // 30 mins work  0300-0330
    
    //1st Shift
    else if ((minutes == myMin6 && seconds >5) && (minutes == myMin6 && seconds <60))  {$scope.nacTaktStart();}     // 55 mins work  0605-0700
    else if ((minutes == myMin7 && seconds >-1) && (minutes == myMin7 && seconds <60)) {$scope.nacTaktStart();}     // 60 mins work  0700-0800    
    else if ((minutes == myMin8 && seconds >-1) && (minutes == myMin8 && seconds <16)) {$scope.nacTaktPause();}     // 15 mins break 0800-0815
    else if ((minutes == myMin8 && seconds >15) && (minutes == myMin8 && seconds <60)) {$scope.nacTaktStart();}     // 45 mins work  0816-0900
    else if ((minutes == myMin9 && seconds >-1) && (minutes == myMin9 && seconds <60)) {$scope.nacTaktStart();}     // 60 mins work  0900-1000
    else if ((minutes == myMin10 && seconds >-1) && (minutes == myMin10 && seconds <60)) {$scope.nacTaktStart();}   // 60 mins work  1000-1100
    else if ((minutes == myMin11 && seconds >-1) && (minutes == myMin11 && seconds <31)) {$scope.nacTaktPause();}   // 30 mins break 1100-1130
    else if ((minutes == myMin11 && seconds >30) && (minutes == myMin11 && seconds <60)) {$scope.nacTaktStart();}   // 30 mins work  1131-1200
    else if ((minutes == myMin12 && seconds >-1) && (minutes == myMin12 && seconds <60)) {$scope.nacTaktStart();}   // 60 mins work  1200-1300
    else if ((minutes == myMin13 && seconds >-1) && (minutes == myMin13 && seconds <16)) {$scope.nacTaktPause();}   // 15 mins break 1300-1315
    else if ((minutes == myMin13 && seconds >15) && (minutes == myMin13 && seconds <60)) {$scope.nacTaktStart();}   // 45 mins work  1316-1400
    else if ((minutes == myMin14 && seconds >-1) && (minutes == myMin14 && seconds <60)) {$scope.nacTaktStart();}   // 60 mins work  1400-1500
    else if ((minutes == myMin15 && seconds >-1) && (minutes == myMin15 && seconds <60)) {$scope.nacTaktStart();}   // 60 mins work  1500-1600
    else if ((minutes == myMin16 && seconds >-1) && (minutes == myMin16 && seconds <31)) {$scope.nacTaktStart();}   // 30 mins break 1600-1630
    
    //2nd Shift
    else if ((minutes == myMin17 && seconds >5) && (minutes == myMin17 && seconds <60))  {$scope.nacTaktStart();}    // 55 mins work  1705-1800
    else if ((minutes == myMin18 && seconds >-1) && (minutes == myMin18 && seconds <60)) {$scope.nacTaktStart();}    // 60 mins work  1800-1900    
    else if ((minutes == myMin19 && seconds >-1) && (minutes == myMin19 && seconds <16)) {$scope.nacTaktPause();}    // 15 mins break 1900-1915
    else if ((minutes == myMin19 && seconds >15) && (minutes == myMin19 && seconds <60)) {$scope.nacTaktStart();}    // 45 mins work  1916-2000
    else if ((minutes == myMin20 && seconds >-1) && (minutes == myMin20 && seconds <60)) {$scope.nacTaktStart();}    // 60 mins work  2000-2100
    else if ((minutes == myMin21 && seconds >-1) && (minutes == myMin21 && seconds <60)) {$scope.nacTaktStart();}    // 60 mins work  2100-2200
    else if ((minutes == myMin22 && seconds >-1) && (minutes == myMin22 && seconds <31)) {$scope.nacTaktPause();}    // 30 mins break 2200-2230
    else if ((minutes == myMin22 && seconds >30) && (minutes == myMin22 && seconds <60)) {$scope.nacTaktStart();}    // 30 mins work  2231-2300
    else if ((minutes == myMin23 && seconds >-1) && (minutes == myMin23 && seconds <60)) {$scope.nacTaktStart();}    // 60 mins work  2300-2400    
//    else if ($scope.nacelle.info.actualTakt == "x") {$scope.nacTaktStop(); console.log("nacTaktStop Triggered"); $scope.nacStopTakt(); console.log("nacStopTakt Triggered");}
    else {$scope.nacStopTakt();} // STOP 0331-0605 && 1631-1705
        
    }, 1000);

};    
$scope.nacStopTakt = function () {
     $scope.nacelle.status = "Stopped";
     if (angular.isDefined(clock)) {
         $interval.cancel(clock);
         clock = undefined;
         $scope.nacInfo.accTime += $scope.nacInfo.actualTakt;
         $scope.nacInfo.actualTakt = $scope.nacInfo.staticTakt;
         $scope.nacAccTimeColor();
         $scope.nacStartBtn = false;
         $scope.nacStopBtn = true;
     }
     $scope.nacTaktStop();
 };
    
 var nacTakt;  
 $scope.nacTaktStart = function () {
     // Don't start a new fight if we are already fighting
     if (angular.isDefined(nacTakt)) return;
     console.log("Start");
     if ($scope.nacelle.info.actualTakt == "x") {$scope.nacTaktStop();}
     $scope.nacelle.status = "Running";
     $scope.nacStartBtn = true;
     $scope.nacPauseBtn = false;
     $scope.nacStopBtn = false;
     nacTakt = $interval(function () {
         if ($scope.nacelle.info.actualTakt <= $scope.nacelle.info.staticTakt) {
             $scope.nacelle.info.actualTakt -= 0.1;
         }
         else {
             $scope.nacTaktStop();
         }
     }, 6000);
 };
 $scope.nacTaktPause = function () {
     //     Pause timer and update status to paused
     if (angular.isDefined(nacTakt)) {
         console.log("Pause");
         $interval.cancel(nacTakt);
         nacTakt = undefined;
         $scope.nacelle.status = "Paused";
         $scope.nacStartBtn = false;
         $scope.nacPauseBtn = true;
         $scope.nacStopBtn = true;
     }

 };
 $scope.nacTaktStop = function () {
     $scope.nacelle.status = "Stopped";
     $scope.nacStartBtn = false;
     $scope.nacPauseBtn = true;
     $scope.nacStopBtn = true;
     if (angular.isDefined(nacTakt)) {
         console.log("Stop");
         $interval.cancel(nacTakt);
         nacTakt = undefined;
     }
 };
 $scope.nacTaktReset = function () {
     $scope.nacelle.info.accTime = 0;
     $scope.nacelle.info.actualGoal = 0;
     $scope.nacResetBtn = true;
     $scope.nacAccTimeColor();
 };
 $scope.$on('$destroy', function () {
     // Make sure that the interval is destroyed too
     $scope.nacelle.status = "Stopped";
     $scope.nacTaktStop();
 });
 
//    Prompt User if they navigate away or close page
 $scope.$on('$locationChangeStart', function (event) {
if (angular.isDefined(clock)) {
    window.onbeforeunload = function () {
    return "Takt Timer is running, closing now will cause it to crash.";
    };
    var answer = confirm("Timer is running, leaving will stop it. Are you sure you want to leave this page?");
    if (!answer) {
        event.preventDefault();
    }
    else {
        $scope.nacStopTakt();
        $scope.nacelle.status = null;
        console.log("Leaving page, stopped timer.");
    }
}
if (angular.isDefined(nacStopLog)) {
    window.onbeforeunload = function () {
    return "Log Timer is running, closing now will cause it to crash.";
    };
    var answer = confirm("Support Timer is running, leaving will stop it. Are you sure you want to leave this page?");
    if (!answer) {
        event.preventDefault();
    }
    else {
        $scope.nacStopLog();
        console.log("Leaving page, stopped Log.");
        alert("Contact TS as the app is now crashed.");
    }
}
 });
    
// Nacelle Counter
 $scope.nacCountUp = function () {
        if ($scope.nacInfo.actualGoal < ($scope.nacInfo.weeklyGoal)) {
                $scope.nacInfo.actualGoal += 1;
                $scope.nacInfo.lastStep = Date.now();
        }
        else {
            alert("Goals have been met. Reset counts!");
            $scope.nacResetBtn = false;
        }


        
    }
 $scope.nacCountDown = function () {
        if ($scope.nacInfo.actualGoal > 0) {
            $scope.nacInfo.actualGoal -= 1;
            $scope.nacResetBtn = false;
        }
        else {
            alert("Cannot go below 0.");
        }
    }
 $scope.nacAccTimeColor = function () {
     if ($scope.nacInfo.accTime < 0) {
         $scope.nacInfo.accTimeColor = "red";
     }
     else if ($scope.nacInfo.accTime > 0) {
         $scope.nacInfo.accTimeColor = "chartreuse";
     }
     else {
         $scope.nacInfo.accTimeColor = "white";
     }
 };

    
 }]); //Users Controller

viewControllers.controller('AuthController', ['$scope', 'Authentication' , '$location', function ($scope, Authentication, $location) {
    $scope.regMessage = "Under Construction"; //uncomment to disable the registration page.
    
$scope.login = function() {
      $scope.message = null;
      $scope.error = null;

      // Create a new user
      Authentication.$signInWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
//          $scope.message = "User logged in with uid: " + firebaseUser.uid; //use this to log into firebase 
          $location.path('/config')
        }).catch(function(error) {
          $scope.error = error;
        });
    };
        
    $scope.register = function() {
      $scope.message = null;
      $scope.error = null;

      // Create a new user
      Authentication.$createUserWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
          $scope.message = "User created, Check your email for verification.";
        }).catch(function(error) {
          $scope.error = error;
        });
    };//register function
 $scope.auth = Authentication;
    // any time auth state changes, add the user data to scope
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
    });//auth state changes
    
    
  }]); // Auth controller

viewControllers.controller('ConfigController', ['$scope','$timeout', 'Authentication', '$firebaseObject', 'currentAuth', 'NgTableParams', function ($scope, $timeout, Authentication, $firebaseObject, currentAuth, NgTableParams) {
    
 var syncObject1 = $firebaseObject(nacelle);
 var syncObject2 = $firebaseObject(hub);
 var syncObject3 = $firebaseObject(nacinfo);
 var syncObject4 = $firebaseObject(hubinfo);
 var syncObject5 = $firebaseObject(config);
 var syncObject6 = $firebaseObject(log);
    
 syncObject1.$bindTo($scope, "nacelle");
 syncObject2.$bindTo($scope, "hub");
 syncObject3.$bindTo($scope, "nacInfo");
 syncObject4.$bindTo($scope, "hubInfo");
 syncObject5.$bindTo($scope, "config");
 syncObject6.$bindTo($scope, "log");
    
$scope.autoTaktStopNac = function () {
    $scope.nacelle.info.actualTakt = "x";
    $timeout(function () {
      $scope.nacelle.info.actualTakt = $scope.nacelle.info.staticTakt;
        $scope.nacelle.status = "Stopped";
  }, 3000);
}
$scope.autoTaktStopHub = function () {
    $scope.hub.info.actualTakt = "x";
  $timeout(function () {
      $scope.hub.info.actualTakt = $scope.hub.info.staticTakt;
      $scope.hub.status = "Stopped";
  }, 3000);
}
    
 $scope.clearLogs = function () {
      var answer = confirm("Are you sure you clear the logs?")
    if (!answer) {
        event.preventDefault();
        console.log("No")
    }
    else {
        console.log("Yes");
        log.remove();
        alert("All logs have been cleared.")
    }
 };
 
// Clear hub areas
$scope.clearHub = function() {
    firebase.database().ref().update(
    {"hub":    {
  "info" : {
    "accTime" : 0,
    "accTimeColor" : "white",
    "actualGoal" : 0,
    "actualTakt" : 0,
    "lastStep" : null,
    "staticTakt" : 0,
    "weeklyGoal" : 0
  },
  "name" : "Hub",
  "status" : "Stopped",
  "subs" : {
    "HB1" : {
      "dual" : true,
      "name" : "HB1",
      "opStyle" : "time-slot-op",
      "second" : "HB2",
      "style" : "time-slot",
      "trigger" : false
    },
    "HB2" : {
      "dual" : true,
      "name" : "HB2",
      "opStyle" : "time-slot-op",
      "second" : "HB1",
      "style" : "time-slot",
      "trigger" : false
    },
    "HB3" : {
      "dual" : true,
      "name" : "HB3",
      "opStyle" : "time-slot-op",
      "second" : "HB4",
      "style" : "time-slot",
      "trigger" : false
    },
    "HB4" : {
      "dual" : true,
      "name" : "HB4",
      "opStyle" : "time-slot-op",
      "second" : "HB3",
      "style" : "time-slot",
      "trigger" : false
    },
    "HB5" : {
      "name" : "HB5",
      "opStyle" : "time-slot-op",
      "style" : "time-slot",
      "trigger" : false
    },
    "HB6" : {
      "2nd" : "HB7",
      "dual" : true,
      "name" : "HB6",
      "opStyle" : "time-slot-op",
      "style" : "time-slot",
      "trigger" : false
    },
    "HB7" : {
      "counter" : true,
      "dual" : true,
      "name" : "HB7",
      "opStyle" : "time-slot-op",
      "second" : "HB6",
      "style" : "time-slot",
      "trigger" : false
    }
  },
  "supps" : {
    "L" : {
      "name" : "L",
      "trigger" : false
    },
    "M" : {
      "name" : "M",
      "trigger" : false
    },
    "Q" : {
      "name" : "Q",
      "trigger" : false
    },
    "TS" : {
      "name" : "TS",
      "trigger" : false
    }
  }
}})
}; //end of hub board reset

$scope.clearNac = function() {
    firebase.database().ref().update({"nacelle":{
  "areas" : {
    "DT" : {
      "name" : "DT",
      "subs" : {
        "BH" : {
          "dual" : true,
          "name" : "BH",
          "opStyle" : "time-slot-op",
          "second" : "MS",
          "style" : "time-slot",
          "trigger" : false
        },
        "GB" : {
          "name" : "GB",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "MS" : {
          "dual" : true,
          "name" : "MS",
          "opStyle" : "time-slot-op",
          "second" : "BH",
          "style" : "time-slot",
          "trigger" : false
        }
      }
    },
    "FA" : {
      "name" : "FA",
      "subs" : {
        "FA1" : {
          "name" : "FA1",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "FA2" : {
          "name" : "FA2",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "FA3" : {
          "counter" : false,
          "name" : "FA3",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "timer" : true,
          "trigger" : false
        }
      }
    },
    "FE" : {
      "name" : "FE",
      "subs" : {
        "FE1" : {
          "dual" : true,
          "name" : "FE2",
          "opStyle" : "time-slot-op",
          "second" : "FE2",
          "style" : "time-slot",
          "trigger" : false
        },
        "FE2" : {
          "dual" : true,
          "name" : "FE2",
          "opStyle" : "time-slot-op",
          "second" : "FE1",
          "style" : "time-slot",
          "trigger" : false
        },
        "FE3" : {
          "dual" : true,
          "name" : "FE3",
          "opStyle" : "time-slot-op",
          "second" : "FE4",
          "style" : "time-slot",
          "trigger" : false
        },
        "FE4" : {
          "dual" : true,
          "name" : "FE4",
          "opStyle" : "time-slot-op",
          "second" : "FE3",
          "style" : "time-slot",
          "trigger" : false
        }
      }
    },
    "FFT" : {
      "name" : "FFT",
      "subs" : {
        "TB1" : {
          "name" : "TB1",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "TB2" : {
          "name" : "TB2",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "TB3" : {
          "name" : "TB3",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "TB4" : {
          "name" : "TB4",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        }
      }
    },
    "FG" : {
      "name" : "FG",
      "subs" : {
        "FG1" : {
          "name" : "FG1",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "FG2" : {
          "name" : "FG2",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "FG3" : {
          "counter" : true,
          "name" : "FG3",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        }
      }
    },
    "RF" : {
      "name" : "RF",
      "subs" : {
        "RF1" : {
          "dual" : true,
          "name" : "RF1",
          "opStyle" : "time-slot-op",
          "second" : "RF2",
          "style" : "time-slot",
          "trigger" : false
        },
        "RF2" : {
          "dual" : true,
          "name" : "RF2",
          "opStyle" : "time-slot-op",
          "second" : "RF1",
          "style" : "time-slot",
          "trigger" : false
        },
        "RF3" : {
          "name" : "RF3",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        },
        "RF4" : {
          "name" : "RF4",
          "opStyle" : "time-slot-op",
          "style" : "time-slot",
          "trigger" : false
        }
      }
    }
  },
  "info" : {
    "accTime" : 0,
    "accTimeColor" : "white",
    "actualGoal" : 0,
    "actualTakt" : 0,
    "lastStep" : null,
    "staticTakt" : 0,
    "weeklyGoal" : 0
  },
  "name" : "Nacelle",
  "status" : "Stopped",
  "supps" : {
    "L" : {
      "name" : "L",
      "trigger" : false
    },
    "M" : {
      "name" : "M",
      "trigger" : false
    },
    "Q" : {
      "name" : "Q",
      "trigger" : false
    },
    "TS" : {
      "name" : "TS",
      "trigger" : false
    }
  }
}})
}; //end of Nacelle board reset

//ng-Table
var self = this;
var data = [{name: "Moroni", age: 50} /*,*/];
self.tableParams = new NgTableParams({}, { dataset: data});

}]); //config controller 

viewControllers.controller('ReportingController', ['$scope', '$firebaseArray', '$firebaseObject', '$timeout', '$interval', 'uiGridConstants', 'uiGridGroupingConstants', function ($scope, $firebaseArray, $firebaseObject, $timeout, $interval, uiGridConstants, uiGridGroupingConstants) {
    
    var syncObject = $firebaseObject(config);
    syncObject.$bindTo($scope, "config");
    
    var tsRef = log.child("TS")
    var qRef = log.child("Q")
    var lRef = log.child("L")
    var mRef = log.child("M")
    
    $scope.tsLogs = $firebaseArray(tsRef);
    $scope.lLogs = $firebaseArray(lRef);
    $scope.qLogs = $firebaseArray(qRef);
    $scope.mLogs = $firebaseArray(mRef);
    $scope.log = $firebaseArray(log);
    
//    UI Grid Code
    
    $scope.gridOptions = {};
    $scope.gridOptions.data = $scope.log;
    $scope.gridOptions.enableCellEditOnFocus = false;
    $scope.gridOptions.enableColumnResizing = false;
    $scope.gridOptions.enableFiltering = true;
    $scope.gridOptions.enableGridMenu = true;
    $scope.gridOptions.showGridFooter = true;
    $scope.gridOptions.showColumnFooter = true;
    $scope.gridOptions.fastWatch = false;

    $scope.gridOptions.columnDefs = [
    { field: 'Timestamp', displayName:'Date',width: '10%', cellFilter: 'date:"shortDate"', type:'date',
        sort: {
                direction: uiGridConstants.DESC,
                priority: 1
            }},
    { field: 'Area', width: '10%', 
        sort: {
                direction: uiGridConstants.ASC,
                priority: 2
            }},
    { field: 'Support', width: '10%'},
    { field: 'Time', cellFilter: 'number:2', aggregationType: uiGridConstants.aggregationTypes.avg, aggregationHideLabel: false,width: '25%',
        sort: {
                direction: uiGridConstants.DESC,
                priority: 3
            }},
        { field: 'Reason', width: '60%'}
    ];
    
}]); //Reporting controller

