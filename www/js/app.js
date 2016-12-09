// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic', 'app.routes'])
var localDB = new PouchDB('posters');
var remoteDB = new PouchDB('http://127.0.0.1:5984/posters');

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    var sync = PouchDB.sync(localDB, remoteDB, {
      live: true,
      retry: true
    }).on('change', function(info) {
      console.log(info);
    }).on('paused', function() {
      console.log('May be offline');
    }).on('active', function() {
      console.log('ACTIVE');
    }).on('denied', function(err) {
      console.log(err);
    }).on('complete', function(info) {
      console.log(info);
    }).on('error', function(err) {
      console.log(err);
    });
  });
});

app.controller('mainTabsCtrl', function($scope) {

});

app.controller('homeCtrl', function($scope, $ionicPopup, $service) {
  $scope.user = {};
  $scope.authenticated = false;

  $scope.submitForm = function() {
    console.log($scope.user.username);
    if(Service.login($scope.user.username, $scope.user.password) === true) {
      $scope.authenticated = true;
    } else {
      $ionicPopup.alert({
        title: 'Error',
        template: '<p style=\'text-align:center\'>Invalid username or password</p>'
      });
    }
  }
});

app.controller('posterListCtrl', function($scope, $ionicPopup, $pouchDB) {
  $scope.posters = [];

  localDB.allDocs({
    include_docs:true
  }).then(function(docs) {
    console.log(docs);
  })

  $scope.create = function() {
    $ionicPopup.prompt ({
      title: 'Test',
      inputType: 'text'
    })
    .then(function(res) {
      console.log(res);
      if(res !== '') {
        if($scope.hasOwnProperty('posters') !== true) {
          $scope.posters = [];
        }
        localDB.post({title: res});
      } else {
        console.log('Action not completed');
      }
    });
  }
  $scope.$on('add', function(event, poster) {
    $scope.posters.push(poster);
  });
  $scope.$on('delete', function(event, id) {
    for(var i = 0; i < $cope.posters.length; i++) {
      if($scope.posters[i]._id === id) {
        $scope.posters.splice(i, 1);
      }
    }
  });
});

app.factory('$service', function($http, $pouchDB) {
  return {
    login: function(username, password) {
      if(angular.equals(username, 'GGCStars') && angular.equals(password, '12345')) {
        return true;
      } else {
        return false;
      }
    }
  }
});

app.factory('$pouchDB', function($rootScope) {
  localDB.changes({
    continuous: true,
    onChange: function(change) {
      console.log(change);
      if(!change.deleted) {
        $rootScope.$apply(function() {
          localDB.get(change.id, function(err, doc) {
            $rootScope.$apply(function() {
              if(err) {
                console.log(err);
              }
              $rootScope.$broadcast('add', doc);
            })
          });
        })
      } else {
        $rootScope.$apply(function() {
          $rootScope.$broadcast('delete', change.id);
        });
      }
    }
  });
  return true;
});
