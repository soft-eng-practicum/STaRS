// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic', 'ui.router', 'ngCookies', 'angular-md5', 'pouchdb', 'ngCordova']);

app.run(function($ionicPlatform, pouchService, $rootScope, $cordovaNetwork) {
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
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  });
  $stateProvider.state('tabs', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  });
  $stateProvider.state('tabs.home', {
    url: '/home',
    views: {
      'home-tab': {
        templateUrl: 'templates/home.html'
      }
    }
  });
  $stateProvider.state('tabs.posterList', {
    url: '/posterList',
    views: {
      'posterList-tab': {
        templateUrl: 'templates/posterList.html'
      }
    }
  });
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
          });
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

    self.localDB = pouchDB('judges');
    self.remoteDB = pouchDB('http://127.0.0.1:5984/judges');
    self.localDB.sync('http://127.0.0.1:5984/judges', opts)
    .on('change', function(change) {
      console.log('yo something changed');
      console.log(change);
    }).on('paused', function(info) {
      console.log('PAUSED');
    }).on('active', function(info) {
      console.log(info);
      console.log('ACTIVE');
    }).on('denied', function (err) {
      console.log(err);
      console.log('DENIED');
    }).on('complete', function (info) {
      console.log(info);
      console.log('COMPLETE');
    }).on('error', function(err) {
      console.log(err);
      console.log('ERROR');
    });

  };
});

app.factory('$service', function($http, $pouchDB, $q, md5, $rootScope, pouchService) {
  var pouch = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;
  var authorized = {};
  return {
    login: function(username, password) {
      var deferred = $q.defer();
      var id;
      localPouch.allDocs({
        include_docs: true,
        attachments: true
      }).then(function(res) {
        res.rows.forEach(function(row) {
          if(angular.equals(row.doc.username,username) && angular.equals(row.doc.password,password)) {
            var doc = row.doc;
            id = doc._id;
            localPouch.put({
              _id: doc._id,
              _rev: doc._rev,
              username: doc.username,
              password: doc.password,
              surveys: doc.surveys
            }).catch(function(err) {
              console.log(err);
            });
          }
        });
      }).then(function() {
        localPouch.get(id).then(function(res) {
          deferred.resolve(res);
        }).catch(function(err) {
          deferred.reject(err);
          console.log(err);
        });
      }).catch(function(err) {
        console.log(err);
      });
      return deferred.promise;
    },
    getSurvey: function() {
      return $http.get('./survey.json');
    },
    getPosters: function(id) {
      return $http.get('./posters.json');
    },
    isOnline: function() {
      var networkState = null;
      if(navigator.connection) {
        networkState = navigator.connection;
      }
      if(networkState && networkState === Connection.NONE) {
        return false;
      }
      if(navigator.online) {
        return true;
      } else {
        return false;
      }
    }
  };
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
      var deferred = $q.defer();
      localPouch.get(id).then(function(doc) {
        doc.surveys.forEach(function(survey) {
          if(survey.groupId !== '') {
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
      }).then(function() {
        var result = localPouch.get(id);
        deferred.resolve(result);
      }).catch(function(err) {
        console.log(err);
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getAll: function() {
      var deferred = $q.defer();
      var result;
      localPouch.allDocs({
        include_docs: true
      }).then(function(result) {
        var docs = result.rows;
        result = [];
        docs.forEach(function(res) {
          result.push(res.doc.username);
        });
        deferred.resolve(result);
      }).catch(function(err) {
        console.log(err);
      });
      return deferred.promise;
    },
    getCountJudges: function(id) {
      var deferred = $q.defer();
      var result = [];
      var temp = [];
      localPouch.allDocs({
        include_docs: true,
        attachments: true
      }).then(function(res) {
        res.rows.forEach(function(row) {
          for(var i = 0; i < row.doc.surveys.length; i++) {
            if(row.doc.surveys[i].groupId == id) {
              result.push(row.doc.username);
            }
          }
        });
        deferred.resolve(result);
      }).catch(function(err) {
        deferred.reject(err);
        console.log(err);
      });
      return deferred.promise;
    },
    deleteSurvey: function(id, groupId) {
      var deferred = $q.defer();
      localPouch.get(id).then(function(doc) {
        doc.surveys.forEach(function(survey) {
          console.log(groupId);
          console.log(survey.groupId);
          // Check to see if the groupId field is empty or is the deleted survey the user wants to delete to resubmit
          if(survey.groupId !== '' && survey.groupId != groupId) {
            resultSurvey.push(survey);
          }
        });
        return localPouch.put({
          _id: doc._id,
          _rev: doc._rev,
          hash: doc.hash,
          username: doc.username,
          password: doc.password,
          surveys: resultSurvey
        });
      }).then(function() {
        var result = localPouch.get(id);
        deferred.resolve(result);
      }).catch(function(err) {
        console.log(err);
        deferred.reject(err);
      });
      return deferred.promise;
    }
  };
});

app.controller('mainTabsCtrl', function($scope, $cookies, $state, $service, $timeout, $rootScope, $ionicHistory) {
  $rootScope.isAuth = false;

  $scope.logout = function() {
    $cookies.remove('user');
    $rootScope.isAuth = false;
    $state.go('login');
    $ionicHistory.clearCache().then(function() {
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
      $ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true });
    });
  }
});

app.controller('loginCtrl', function($scope, $timeout, $pouchDB, $cordovaNetwork, $ionicPopup, $service, $state, $cookies, $rootScope, pouchService) {
  $scope.pouchService = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;
  $rootScope.isAuth = false;

  document.addEventListener("deviceready", function () {
    console.log('deviceready');

      $scope.network = $cordovaNetwork.getNetwork();
      $scope.isOnline = $cordovaNetwork.isOnline();
      $rootScope.headerVal = '';
      $scope.$apply();

      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        console.log('got online');
          $scope.isOnline = true;
          $rootScope.headerVal = 'Online';
          $scope.network = $cordovaNetwork.getNetwork();

          $scope.$apply();
      });

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
          console.log("got offline");
          $scope.isOnline = false;
          $rootScope.headerVal = 'Offline';
          $scope.network = $cordovaNetwork.getNetwork();

          $scope.$apply();
      });

    }, false);

  $scope.items = [];
  $scope.user = {};
  $scope.search = {};

  $scope.getItems = function() {
    localPouch.allDocs({
      include_docs: true,
      attachments: true
    }).then(function(result) {
      var docs = result.rows;
      docs.forEach(function(res) {
        var item = {name: res.doc.username};
        $scope.items.push(item);
      });
    }).catch(function(err) {
      console.log(err);
    });
  };

  $scope.getItems();

  $scope.updateSelection = function(name) {
    $('#active').focus();
    $scope.user.username = name;
  };

  $scope.submitForm = function() {
    $service.login($scope.user.username, $scope.user.password)
    .then(
      function(res) {
        $cookies.put('user', res._id);
        $rootScope.isAuth = true;
        $state.go('tabs.home');
        $timeout(function() {
          $state.go('tabs.home');
          $scope.user.username = '';
          $scope.user.password = '';
          $scope.search.value = '';
        }, 0);
      },
      function(err) {
        $ionicPopup.alert({
          title: 'Error',
          template: '<p style=\'text-align:center\'>Invalid username or password</p>'
        });
        return;
      });
    };
});

app.controller('homeCtrl', function($scope, $cookies, $state, $ionicPopup, $service, $pouchDB, pouchService, $rootScope, $timeout) {
  $scope.pouchService = pouchService.retryReplication();
  $scope.surveys = [];
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  if($cookies.get('user') === undefined) {
    $rootScope.isAuth = false;
    $state.go('home');
  } else {
    $rootScope.isAuth = true;
    $scope.user = $cookies.get('user');
  }

  $scope.getSurveys = $pouchDB.getJudge($scope.user)
  .then(
    function(doc) {
      $scope.surveys = doc.surveys;
    },
    function(err) {
      console.log(err);
      $ionicPopup.alert({
        title: 'Error',
        template: '<p style=\'text-align:center\'>Could not retrieve your recent surveys</p>'
      });
      return;
    });
});

app.controller('posterListCtrl', function($scope, $ionicPopup, $service, pouchService, $rootScope, $cookies, $pouchDB) {
  $scope.pouchService = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  if($cookies.get('user') === undefined) {
    $rootScope.isAuth = false;
    $state.go('home');
  } else {
    $rootScope.isAuth = true;
    $scope.user = $cookies.get('user');
  }

  $scope.posters = [];
  $scope.loading = true;

  $service.getPosters().success(function(data) {
    $scope.posters = data.posters;

    $scope.posters.forEach(function(poster) {
      $pouchDB.getCountJudges(poster.id)
      .then(
        function(res) {
          if(res.length > 0) {
            poster.judgesSurveyed = res;
            poster.countJudges = poster.judgesSurveyed.length;
          }
        },
        function(err) {
          console.log(err);
          $ionicPopup.alert({
            title: 'Error',
            template: '<p style=\'text-align:center\'>An error has occurred</p>'
          });
          return;
        });
    });
  });
});

app.controller('posterCtrl', function($scope, poster, $state, $cookies, $service, $timeout, $ionicPopup, pouchService, $pouchDB, $rootScope) {
  $scope.pouchService = pouchService.retryReplication();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  if($cookies.get('user') === undefined) {
    $rootScope.isAuth = false;
    $state.go('home');
  } else {
    $rootScope.isAuth = true;
    $scope.user = $cookies.get('user');
  }

  $scope.poster = poster;
  $scope.countJudges = 0;
  $scope.previousSurveyed = false;
  $scope.previousAnswers = [];
  $scope.judgesSurveyed = [];
  $scope.answers = [];

  var groupName = $scope.poster.group;
  var groupId = $scope.poster.id;


  $service.getSurvey().success(function(data) {
    $scope.questions = data.questions;
  });


  $scope.submitQuestions = function(isValid) {
      angular.forEach($scope.questions, function(question) {
        $scope.answers.push(question.value);
      });
      var resultSurvey = {
        answers: $scope.answers,
        groupName: groupName,
        groupId: groupId
      };
      $pouchDB.submitSurvey($scope.user, resultSurvey)
      .then(
        function(res) {
          $scope.previousSurveyed = true;
          $scope.judgesSurveyed.push(res.username);
          $scope.countJudges++;
        },
        function(err) {
          console.log(err);
          $ionicPopup.alert({
            title: 'Error',
            template: '<p style=\'text-align:center\'>An error has occurred</p>'
          });
          return;
        });
  };

  $scope.checkPreviousSurveyed = function() {
    $pouchDB.getJudge($scope.user)
    .then(
      function(doc) {
        var surveys = doc.surveys;
        for(var i = 0; i < doc.surveys.length; i++) {
          if(doc.surveys[i].groupId == $scope.poster.id) {
            $scope.previousSurveyed = true;
          }
        }
      },
      function(err) {
        console.log(err);
        $ionicPopup.alert({
          title: 'Error',
          template: '<p style=\'text-align:center\'>An error has occurred</p>'
        });
        return;
      });
  };

  $scope.resubmitSurvey = function() {
    $scope.letJudgeViewQuestions = true;

    $pouchDB.deleteSurvey($scope.user, $scope.poster.id)
    .then(
      function(res) {
        $scope.previousSurveyed = false;
        $scope.judgesSurveyed.splice($scope.judgesSurveyed.indexOf(res.username, 1));
        $scope.countJudges--;
      },
      function(err) {
        console.log(err);
        $ionicPopup.alert({
          title: 'Error',
          template: '<p style=\'text-align:center\'>An error has occurred</p>'
        });
        return;
      });

  };

  $scope.showJudges = function() {
    $ionicPopup.alert({
      title: 'Judges Who Have Surveyed:',
      templateUrl: 'templates/popup.html',
      scope: $scope
    });
  };

  $scope.judgesWhoHaveSurveyed = function() {
    $pouchDB.getCountJudges(groupId)
    .then(
      function(res) {
        if(res.length > 0) {
          $scope.judgesSurveyed = res;
          $scope.countJudges = $scope.judgesSurveyed.length;
        }
      },
      function(err) {
        console.log(err);
        $ionicPopup.alert({
          title: 'Error',
          template: '<p style=\'text-align:center\'>An error has occurred</p>'
        });
        return;
      });
  };

  $scope.checkPreviousSurveyed();
  $scope.judgesWhoHaveSurveyed();
});
