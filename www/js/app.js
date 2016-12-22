// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic', 'app.routes', 'ngCookies', 'angular-md5', 'pouchdb']);

app.run(function($ionicPlatform, pouchService) {
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
    var localPouch = pouchService.localDB;
    var remotePouch = pouchService.remoteDB;
    /*
    var sync = PouchDB.sync(localDB, remoteDB, {
      live: true,
      retry: true,
      continuous: true
    }).on('change', function(info) {
      console.log(info);
      console.log('yo, something changed');
    }).on('paused', function() {
      console.log('No activity with the database -- paused');
    }).on('active', function() {
      console.log('ACTIVE -- resumed replication');
    }).on('denied', function(err) {
      console.log(err);
    }).on('complete', function(info) {
      console.log(info);
    }).on('error', function(err) {
      console.log('Disconnected');
    });
*/
  });
});

app.service('pouchService', function($rootScope, pouchDB, $log) {
  this.retryReplication = function() {
    var self = this;
    var replicate;
    var status;
    var opts = {
      live: true,
      retry: true
    };

    function updateStatus(response) {
      $log.info(response.$event, response);
      status = JSON.stringify(response);
    }

    self.localDB = pouchDB('judges');
    self.remoteDB = pouchDB('http://127.0.0.1:5984/judges');
    self.localDB.sync('http://127.0.0.1:5984/judges', opts).$promise
      .then(null, null, updateStatus)
      .then(updateStatus)
      .catch(updateStatus)
      .finally(function() {
        console.log('done');
    });
  }
});

app.controller('mainTabsCtrl', function($scope, $cookies, $state, $service, $timeout, $rootScope, $ionicHistory) {

  $scope.user = $service.getAuthorized();
  $scope.auth = $cookies.get($scope.user.id);
  console.log($scope.auth);

  if($scope.auth != undefined) {
    $rootScope.isAuth = true;
  } else {
    $rootScope.isAuth = false;
    $timeout(function() {
      $state.go('login');
    }, 0);
  }
  $scope.logout = function() {
    $scope.user = $service.getAuthorized();
    $scope.auth = $cookies.get($scope.user.id);
    var id = $scope.user.id;
    window.localStorage.removeItem(id);
    $cookies.remove(id);
    $service.logout(id).then(function() {
        $rootScope.isAuth = false;
        $ionicHistory.clearCache().then(function() {
            $ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true });
        });
        $state.go('login');
    });
  }

});

app.controller('loginCtrl', function($scope, $timeout, $ionicPopup, $service, $state, pouchService, $cookies, $timeout, $rootScope) {
  $scope.user = $service.getAuthorized();
  $scope.auth = $cookies.get($scope.user.id);
  console.log($scope.auth);
  if($scope.auth != undefined) {
    $rootScope.isAuth = true;
  } else {
    $rootScope.isAuth = false;
  }

  $scope.submitForm = function() {
    console.log('login()');
    $service.login($scope.user.username, $scope.user.password).then(function(res) {
      if(res.id === undefined) {
        $rootScope.isAuth = false;
        $ionicPopup.alert({
          title: 'Error',
          template: '<p style=\'text-align:center\'>Invalid username or password</p>'
        });
        return;
      } else if(res.value === false) {
        var id = res.id;
        $rootScope.isAuth = true;
        // set the user's auto generated id as the key within localstorage to maintain the login state
        window.localStorage.setItem(res.id, JSON.stringify(res.promise.$$state.value));
        $service.setAuthorized(res.id, res.promise.$$state.value);
        $cookies.put(res.id, res.promise.$$state.value);
      } else if(res.value === true) {
        var id = res.id;
        $rootScope.isAuth = true;
        $service.setAuthorized(res.id, res.promise.$$state.value);
        $cookies.put(res.id, res.promise.$$state.value);
      }
      $timeout(function() {
        $state.go('tabs.home');
      }, 0);
    });
  }

})
app.controller('homeCtrl', function($scope, $cookies, $state, $ionicPopup, $service, pouchService, $rootScope, $timeout) {
  //$scope.pouchService = pouchService.PouchService();
  $scope.pouchService = pouchService.retryReplication();
  $scope.surveys = [];
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  $scope.user = $service.getAuthorized();
  $scope.auth = $cookies.get($scope.user.id);
  console.log($scope.auth);
  if($scope.auth != undefined) {
    $rootScope.isAuth = true;
  } else {
    $rootScope.isAuth = false;
    $timeout(function() {
      $state.go('login');
    }, 0);
  }

});

app.controller('posterListCtrl', function($scope, $ionicPopup, $service, pouchService, $rootScope, $cookies) {
  //$scope.pouchService = pouchService.PouchService();
  $scope.pouchService = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  $scope.user = $service.getAuthorized();
  $scope.auth = $cookies.get($scope.user.id);
  
  if($scope.auth != undefined) {
    $rootScope.isAuth = true;
  } else {
    $rootScope.isAuth = false;
    $timeout(function() {
      $state.go('login');
    }, 0);
  }

  $scope.posters = [];
  $scope.loading = true;

  $service.getPosters().success(function(data) {
    $scope.posters = data.posters;
  });
});

app.controller('posterCtrl', function($scope, poster, $service, $ionicPopup, pouchService, $pouchDB, $rootScope) {
  //$scope.pouchService = pouchService.PouchService();
  $scope.pouchService = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  $scope.user = $service.getAuthorized();
  $scope.auth = $cookies.get($scope.user.id);
  
  if($scope.auth != undefined) {
    $rootScope.isAuth = true;
  } else {
    $rootScope.isAuth = false;
    $timeout(function() {
      $state.go('login');
    }, 0);
  }

  $scope.poster = poster;
  $scope.answers = [];

  $service.getSurvey().success(function(data) {
    $scope.questions = data.questions;
  });
  //$scope.selectedQuestion = {};

  $scope.submitQuestions = function(isValid) {
      angular.forEach($scope.poster.questions, function(question) {
        $scope.answers.push(question.value);
      });
      var id = window.localStorage.getItem()
      $pouchDB.submitSurvey(id, $scope.answers);
  }

  /*$scope.questionView = function(question) {
    $scope.selectedQuestion = question;
    $ionicPopup.show({
      templateUrl: '<ion-list><ion-radio ng-model="choice" ng-value="1">1</ion-radio><ion-radio ng-model="choice" ng-value="2">2</ion-radio><ion-radio ng-model="choice" ng-value="3">3</ion-radio><ion-radio ng-model="choice" ng-value="4">4</ion-radio><ion-radio ng-model="choice" ng-value="5">5</ion-radio></ion-list>',
      title: '<div class="row"><div class="col col-center"><p>Question: #'+ $scope.selectedQuestion.id + ':</p></div></div>',
      subTitle: '<div class="row"><div class="col col-center"><p>Question: #'+ $scope.selectedQuestion.information + ':</p></div></div>',
      scope: $scope
    });
  }*/
  
});

app.factory('$service', function($http, $pouchDB, $q, md5, $rootScope, pouchService) {
  //var pouch = pouchService.PouchService();
  var pouch = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;
  var authorized = {};
  return {
    login: function(username, password) {
      var deferred = $q.defer();
      var hasHash = false;
      var id;
      return localPouch.allDocs({
        include_docs: true,
        attachments: true
      }).then(function(res) {
        res.rows.forEach(function(row) {
          if(angular.equals(row.doc.username,username) && angular.equals(row.doc.password,password)) {
            id = row.doc._id;
            if(row.doc.hash != '') {
              deferred.resolve(row.doc.hash);
              hasHash = true;
            } else {

              var hash = md5.createHash(row.doc.username || '');
              deferred.resolve(hash);
              var doc = row.doc;
              localPouch.put({
                _id: doc._id,
                _rev: doc._rev,
                hash: hash,
                username: doc.username,
                password: doc.password,
                surveys: doc.surveys
              }).catch(function(err) {
                console.log(err);
              });
            }
          }
        });
        return {
          promise: deferred.promise,
          value: hasHash,
          id: id
        }
        $rootScope.$apply();
      }).catch(function(err) {
        console.log(err);
      })
    },
    getSurvey: function() {
      return $http.get('./survey.json');
    },
    getPosters: function() {
      return $http.get('./posters.json');
    },
    getAuthorized: function() {
      console.log(authorized);
      return authorized;
    },
    setAuthorized: function(id, hash) {
      authorized = {id, hash};
      console.log(authorized);
    },
    logout: function() {
      var deferred = $q.defer();
      authorized = {};
      deferred.resolve(authorized);
      return deferred.promise;
    }
  }
});

app.factory('$pouchDB', function($rootScope, $q, $http, pouchService) {
  var pouch = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;
  /*localDB.changes({
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
  */
  return {
    get: function(id) {
      return localPouch.get(id, {include_docs:true})
      .then(function(doc) {
        return doc;
      })
      .catch(function(err) {
        console.log(err);
      });
      $rootScope.apply();
    },
    submitSurvey: function(id, group, answers) {
      localPouch.get(id).then(function(doc) {
        console.log(answers);

        return localPouch.put({
          _id: doc._id,
          _rev: doc._rev,
          hash: doc.hash,
          username: doc.username,
          password: doc.password,
          surveys: [
            {
              group: group,
              answers: answers
            }
          ]
        });
      }).then(function(res) {
        return res;
      }).catch(function(err) {
        console.log(err);
      });
    }
  }
});