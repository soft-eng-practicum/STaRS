// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic', 'ui.router', 'ngCookies', 'angular-md5', 'pouchdb']);

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
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html'
  })
  $stateProvider.state('tabs', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  $stateProvider.state('tabs.home', {
    url: '/home',
    views: {
      'home-tab': {
        templateUrl: 'templates/home.html'
      }
    }
  })
  $stateProvider.state('tabs.posterList', {
    url: '/posterList',
    views: {
      'posterList-tab': {
        templateUrl: 'templates/posterList.html'
      }
    }
  })
  $stateProvider.state('tabs.poster', {
    url: '/posters/{id}',
    views: {
      'posterList-tab': {
        templateUrl:'templates/poster.html',
        controller: 'posterCtrl'
      }
    },
    resolve: {
      poster: [
      '$stateParams', '$http', '$q',
        function($stateParams, $http, $q) {
          return $http.get('./posters.json').then(function(res) {
            var deferred = $q.defer();
            res.data.posters.forEach(function(poster) {
              if(poster.id == $stateParams.id) {
                deferred.resolve(poster);
              }
            });
            return deferred.promise;
          })
        }
      ]
    }
  });
  $urlRouterProvider.otherwise('/login');
});

app.service('pouchService', function($rootScope, pouchDB, $log, pouchDBDecorators) {
  this.retryReplication = function() {
    var self = this;
    var replicate;
    var status;
    var opts = {
      live: true,
      retry: true,
      continuous: true
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

app.factory('$service', function($http, $pouchDB, $q, md5, $rootScope, pouchService) {
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

app.controller('loginCtrl', function($scope, $timeout, $ionicPopup, $service, $state, $cookies, $rootScope) {
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
app.controller('homeCtrl', function($scope, $cookies, $state, $ionicPopup, $service, $pouchDB, pouchService, $rootScope, $timeout) {
  $scope.pouchService = pouchService.retryReplication();
  $scope.surveys = [];
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

  var test = $pouchDB.getJudge($scope.user.id).then(function(doc) {
    $scope.surveys = doc.surveys;
    console.log(doc.surveys);
  });


});

app.controller('posterListCtrl', function($scope, $ionicPopup, $service, pouchService, $rootScope, $cookies) {
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
  localPouch.get($scope.user.id).then(function(doc) {
    console.log(doc);
    console.log('test');
  });

});

app.controller('posterCtrl', function($scope, poster, $state, $cookies, $service, $timeout, $ionicPopup, pouchService, $pouchDB, $rootScope) {
  console.log(poster);
  $scope.pouchService = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  $scope.previousSurveyed = false;
  $scope.previousAnswers = [];
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
  var groupName = $scope.poster.group;
  var groupId = $scope.poster.id;
  $scope.answers = [];

  $service.getSurvey().success(function(data) {
    $scope.questions = data.questions;
  });

  $scope.submitQuestions = function(isValid) {
      angular.forEach($scope.questions, function(question) {
        $scope.answers.push(question.value);
      });
      console.log($scope.answers);
      var resultSurvey = {
        answers: $scope.answers,
        groupName: groupName,
        groupId: groupId
      };
      console.log(resultSurvey);
      $pouchDB.submitSurvey($scope.user.id, resultSurvey);
      $state.go('tabs.home');
  }

  $scope.checkPreviousSurveyed = function() {
    $pouchDB.getJudge($scope.user.id).then(function(doc) {
      console.log(doc.surveys);
      var surveys = doc.surveys;
      if(doc.surveys[0].groupId != '') {
        $scope.previousSurveyed = true;
      }
    });
  }

  $scope.checkPreviousSurveyed();
  
});

app.factory('$pouchDB', function($rootScope, $q, $http, pouchService) {
  var pouch = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;
  var resultSurvey = [];
  return {
    get: function(id) {
          return $http.get('./posters.json');
    },
    getJudge: function(id) {
      var deferred = $q.defer();
      console.log(id);
      localPouch.get(id).then(function(doc) {
        deferred.resolve(doc);
      }).catch(function(err) {
        console.log(err);
      });
      return deferred.promise;
    },
    submitSurvey: function(id, returnObject) {
      localPouch.get(id).then(function(doc) {

        doc.surveys.forEach(function(survey) {
          if(survey.groupId != '') {
            resultSurvey.push(survey);
          }
        });

        resultSurvey.push(returnObject);
        return localPouch.put({
          _id: doc._id,
          _rev: doc._rev,
          hash: doc.hash,
          username: doc.username,
          password: doc.password,
          surveys: resultSurvey
        });
      }).then(function(res) {
        return res;
        $rootScope.$apply();
      }).catch(function(err) {
        console.log(err);
      });
    }
  }
});