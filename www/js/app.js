// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic', 'ui.router', 'ngCookies', 'pouchdb', 'ngCordova']);

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
    pouchService.setDatabase('judges');
    pouchService.sync('http://127.0.0.1:5984/judges');
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

app.service('pouchService', function($rootScope, pouchDB, $log, pouchDBDecorators, $q) {
  var database;
  var changeListener;

  this.getUsers = function() {
    var deferred = $q.defer();
    database.allDocs({
      include_docs: true,
      attachments: true
    }).then(function(res) {
      deferred.resolve(res.rows);
    }).catch(function(err) {
      console.log(err);
      deferred.reject(err);
    });
    return deferred.promise;
  };

  this.setDatabase = function(dbName) {
    database = new PouchDB(dbName);
    database.setMaxListeners(30);
  };

  this.startListening = function() {
    changeListener = database.changes({
        live: true,
        include_docs: true
    }).on("change", function(change) {
        if(!change.deleted) {
            $rootScope.$broadcast("$pouchDB:change", change);
        } else {
            $rootScope.$broadcast("$pouchDB:delete", change);
        }
    });
  };

  this.stopListening = function() {
    changeListener.cancel();
  };

  this.sync = function(remoteDatabase) {
    database.sync(remoteDatabase, {live: true, retry: true});
  };

  this.login = function(username, password) {
    var deferred = $q.defer();
    database.allDocs({
      include_docs: true,
      attachments: true
    }).then(function(res) {
      res.rows.forEach(function(row) {
        if(angular.equals(row.doc.username,username) && angular.equals(row.doc.password,password)) {
          deferred.resolve(row.doc);
        }
      });
    }).catch(function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  this.getJudge = function(id) {
    var deferred = $q.defer();
    database.get(id).then(function(doc) {
      deferred.resolve(doc);
    }).catch(function(err) {
      deferred.reject(err);
      console.log(err);
    });
    return deferred.promise;
  };

  this.countCompletedSurveys = function(id) {
    var deferred = $q.defer();
    var result = [];
    database.allDocs({
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
  };

  this.submitSurvey = function(id, submittedSurvey) {
    var deferred = $q.defer();
    var resultSurvey = [];
    database.get(id).then(function(doc) {
      doc.surveys.forEach(function(survey) {
        if(survey.groupId !== '' && survey.groupId !== submittedSurvey.groupId) {
          resultSurvey.push(survey);
        }
      });
      resultSurvey.push(submittedSurvey);
      database.put({
        _id: doc._id,
        _rev: doc._rev,
        username: doc.username,
        password: doc.password,
        surveys: resultSurvey
      });
    }).then(function() {
      // need to $rootScope an added survey to the group within posterList here
      var result = database.get(id);
      deferred.resolve(result);
    }).catch(function(err) {
      deferred.reject(err);
      console.log(err);
    });
    return deferred.promise;
  };

  this.deleteSurvey = function(id, groupId) {
    var deferred = $q.defer();
    var resultSurvey = [];
    database.get(id).then(function(doc) {
      doc.surveys.forEach(function(survey) {
        if(survey.groupId !== '' && survey.groupId != groupId) {
          resultSurvey.push(survey);
        }
      });
      console.log(resultSurvey);
      database.put({
        _id: doc._id,
        _rev: doc._rev,
        username: doc.username,
        password: doc.password,
        surveys: resultSurvey
      });
    }).then(function() {
      var result = database.get(id);
      console.log(result);
      deferred.resolve(result);
    }).catch(function(err) {
      deferred.reject(err);
      console.log(err);
    });
    return deferred.promise;
  };
});

app.factory('$service', function($http, $q, $rootScope, pouchService) {
 return {
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
  };
});

app.controller('loginCtrl', function($scope, $timeout, $cordovaNetwork, $ionicPopup, $service, $state, $cookies, $rootScope, pouchService) {
  pouchService.startListening();
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
    pouchService.getUsers()
    .then(
      function(res) {
        res.forEach(function(row) {
          var item = {name: row.doc.username};
          $scope.items.push(item);
        });
      },
      function(err) {
        console.log(err);
      }
    );
  };

  $scope.getItems();

  $scope.updateSelection = function(name) {
    $('#active').focus();
    $scope.user.username = name;
  };

  $scope.submitForm = function() {
    pouchService.login($scope.user.username, $scope.user.password)
    .then(
      function(res) {
        $cookies.put('user', res._id);
        $rootScope.isAuth = true;
        $timeout(function() {
          $state.go('tabs.home');
          $scope.user.username = '';
          $scope.user.password = '';
          $scope.search.value = '';
        }, 0);
      },
      function(err) {
        $ionicPopup.alert({
          title: '<h4>Error</h4>',
          template: '<p style=\'text-align:center\'>Invalid username or password</p>'
        });
        return;
      }
    );
  };

  $scope.$on('$destroy', function() {
    pouchService.stopListening();
  });
});

app.controller('homeCtrl', function($scope, $cookies, $state, $ionicPopup, $service, pouchService, $rootScope, $timeout) {
  pouchService.startListening();
  $scope.surveys = [];
  $scope.hasRecent = false;

  if($cookies.get('user') === undefined) {
    $rootScope.isAuth = false;
    $state.go('home');
  } else {
    $rootScope.isAuth = true;
    $scope.user = $cookies.get('user');
  }

  pouchService.getJudge($scope.user)
  .then(
    function(doc) {
      $scope.surveys = doc.surveys;
      if(doc.surveys[0].groupId !== '') {
        $scope.hasRecent = true;
      }
    },
    function(err) {
      console.log(err);
      $ionicPopup.alert({
        title: '<h4>Error</h4>',
        template: '<p style=\'text-align:center\'>Could not retrieve your recent surveys</p>'
      });
      return;
    }
  );

  $scope.$on('$destroy', function() {
    pouchService.stopListening();
  });
});

app.controller('posterListCtrl', function($scope, $ionicPopup, $service, pouchService, $rootScope, $cookies) {
  pouchService.startListening();
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
      pouchService.countCompletedSurveys(poster.id)
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
            title: '<h4>Error</h4>',
            template: '<p style=\'text-align:center\'>An error has occurred</p>'
          });
          return;
        }
      );
    });
  });

  $scope.$on('$destroy', function() {
    pouchService.stopListening();
  });
});

app.controller('posterCtrl', function($scope, poster, $state, $window, $cookies, $service, $timeout, $ionicPopup, pouchService, $rootScope) {
  pouchService.startListening();
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
  $scope.disableEdit = false;

  var groupName = $scope.poster.group;
  var groupId = $scope.poster.id;

  $service.getSurvey().success(function(data) {
    $scope.questions = data.questions;
  });


  $scope.submitQuestions = function() {

      var resultSurvey = {};
      if($scope.previousSurveyed === false) {
        angular.forEach($scope.questions, function(question) {
          $scope.answers.push(question.value);
        });
        resultSurvey = {
          answers: $scope.answers,
          groupName: groupName,
          groupId: groupId
        };
        pouchService.submitSurvey($scope.user, resultSurvey)
        .then(
          function(res) {
            $scope.previousSurveyed = true;
            $scope.judgesSurveyed.push(res.username);
            $scope.countJudges++;
            $window.location.reload();
          },
          function(err) {
            console.log(err);
            $ionicPopup.alert({
              title: '<h4>Error</h4>',
              template: '<p style=\'text-align:center\'>An error has occurred</p>'
            });
            return;
          }
        );
      } else {
        var confirmPopup = $ionicPopup.confirm({
          title: '<h4>Confirm Survey Changes:</h4>',
          template: '<p style=\'text-align:center\'>Are you sure you want to submit your changes to this survey?</p>'
        });
        confirmPopup.then(function(res) {
          if(res) {
            $scope.answers = [];
            angular.forEach($scope.questions, function(question) {
              $scope.answers.push(question.value);
            });
            resultSurvey = {
              answers: $scope.answers,
              groupName: groupName,
              groupId: groupId
            };
            pouchService.submitSurvey($scope.user, resultSurvey)
            .then(
              function(res) {
                $scope.previousSurveyed = true;
                $scope.disableEdit = true;
              },
              function(err) {
                console.log(err);
                $ionicPopup.alert({
                  title: '<h4>Error</h4>',
                  template: '<p style=\'text-align:center\'>An error has occurred</p>'
                });
                return;
              }
            );
          } else {
            return;
          }
        });
      }
  };

  $scope.edit = function() {
    $scope.disableEdit = false;
  };

  $scope.cancelEdit = function() {
    $scope.disableEdit = true;
  };

  $scope.checkPreviousSurveyed = function() {
    pouchService.getJudge($scope.user)
    .then(
      function(doc) {
        for(var i = 0; i < doc.surveys.length; i++) {
          if(doc.surveys[i].groupId == $scope.poster.id) {
            $scope.previousSurveyed = true;
            $scope.disableEdit = true;
            $scope.answers = doc.surveys[i].answers;
          }
        }
        if($scope.previousSurveyed === true) {
          for(var i = 0; i < $scope.questions.length; i++) {
            $scope.questions[i].value = $scope.answers[i];
          }
        }
      },
      function(err) {
        console.log(err);
        $ionicPopup.alert({
          title: '<h4>Error</h4>',
          template: '<p style=\'text-align:center\'>An error has occurred</p>'
        });
        return;
      }
    );
  };

  $scope.showJudges = function() {
    $ionicPopup.alert({
      title: '<h4>Judges Who Have Surveyed:</h4>',
      templateUrl: 'templates/popup.html',
      scope: $scope
    });
  };

  $scope.judgesWhoHaveSurveyed = function() {
    pouchService.countCompletedSurveys(groupId)
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
          title: '<h4>Error</h4>',
          template: '<p style=\'text-align:center\'>An error has occurred</p>'
        });
        return;
      }
    );
  };

  $scope.checkPreviousSurveyed();
  $scope.judgesWhoHaveSurveyed();

  $scope.$on('$destroy', function() {
    pouchService.stopListening();
  });
});

app.directive('groupedRadio', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      value: '=groupedRadio'
    },
    link: function(scope, element, attrs, ngModelCtrl) {
      element.addClass('button');
      element.on('click', function(e) {
        scope.$apply(function() {
          ngModelCtrl.$setViewValue(scope.value);
        });
      });

      scope.$watch('model', function(newVal) {
        element.removeClass('button-positive');
        if (newVal === scope.value) {
          element.addClass('button-positive');
        }
      });
    }
  };
});
