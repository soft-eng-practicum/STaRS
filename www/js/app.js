var app = angular.module('app', ['ionic', 'ui.router', 'ngCookies', 'pouchdb', 'ngCordova']);

app.run(function($ionicPlatform, pouchService, $rootScope, $cordovaNetwork, $timeout) {
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

    // Check database for connection results
    checkDb = function() {
      pouchService.checkDatabaseConnection()
        .then(function(res) {
          $rootScope.$broadcast('connected');
          $rootScope.connection = true;
          $rootScope.couchConnection = 'Connected';
        })
        .catch(function(err) {
          $rootScope.$broadcast('disconnected');
          $rootScope.connection = false;
          $rootScope.couchConnection = 'Disconnected';
        });
        $timeout(function() {
          $rootScope.$apply();
        });
        setTimeout(checkDb, 10000);
    };
    setTimeout(checkDb, 10000);
  });
});

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl',
    onEnter: function($timeout, $state) {
      if(window.localStorage.getItem('user') !== null) {
        $timeout(function() {
          $state.go('tabs.home');
        });
      }
    }
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
  $stateProvider.state('logout', {
    url: '/logout',
    controller: 'logoutCtrl',
    templateUrl: null
  });

  $urlRouterProvider.otherwise('/login');
});

app.service('$pouchdb', function($rootScope, pouchDB, $http) {
  this.retryReplication = function() {
    var self = this;
    var replicate;
    var status;
    var opts = {
      live: true,
      retry: true,
      continuous: true,
      back_off_function: function (delay) {
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
        }
      };

    self.localDB = pouchDB('judges');
    self.localDB.sync('http://cody:cody@192.168.1.20:5984/judges', opts)
    .on('change', function(change) {
      $rootScope.$broadcast('changes');
      console.log('yo something changed');
      console.log(change);
    }).on('paused', function(info) {
      $rootScope.$broadcast('paused');
      console.log('PAUSED');
    }).on('active', function(info) {
      console.log(info);
      console.log('ACTIVE');
    }).on('error', function(err) {
      console.log(err);
      console.log('ERROR');
    });

  };
});

app.factory('pouchService', function($rootScope, pouchDB, $pouchdb, $q, $http) {
  var pouch = $pouchdb.retryReplication();
  var localPouch = $pouchdb.localDB;
  var remoteDB = $pouchdb.remoteDB;

  return {

    checkDatabaseConnection: function() {
      return $http.get('http://cody:cody@192.168.1.20:5984/judges');
    },

    getUsers: function() {
      var deferred = $q.defer();
      localPouch.allDocs({
        include_docs: true,
        attachments: true
      }).then(function(res) {
        deferred.resolve(res.rows);
      }).catch(function(err) {
        console.log(err);
        deferred.reject(err);
      });
      return deferred.promise;
    },

    login: function(username, password) {
      var deferred = $q.defer();
      var result;
      localPouch.allDocs({
        include_docs: true,
        attachments: true
      }).then(function(res) {
        for(var i = 0; i < res.rows.length; i++) {
          if(angular.equals(res.rows[i].doc.username,username) && angular.equals(res.rows[i].doc.password,password)) {
            result = res.rows[i].doc;
          }
        }
        if(result !== undefined) {
          deferred.resolve(result);
        } else {
          deferred.reject(result);
        }
      }).catch(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    },

    getJudge: function(id) {
      var deferred = $q.defer();
      localPouch.get(id).then(function(doc) {
        deferred.resolve(doc);
      }).catch(function(err) {
        deferred.reject(err);
        console.log(err);
      });
      return deferred.promise;
    },

    countCompletedSurveys: function(id) {
      var deferred = $q.defer();
      var result = [];
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

    submitSurvey: function(id, submittedSurvey) {
      var deferred = $q.defer();
      var resultSurvey = [];
      localPouch.get(id).then(function(doc) {
        doc.surveys.forEach(function(survey) {
          if(survey.groupId !== '' && survey.groupId !== submittedSurvey.groupId) {
            resultSurvey.push(survey);
          }
        });
        resultSurvey.push(submittedSurvey);
        localPouch.put({
          _id: doc._id,
          _rev: doc._rev,
          username: doc.username,
          password: doc.password,
          surveys: resultSurvey
        });
      }).then(function() {
        // need to $rootScope an added survey to the group within posterList here
        var result = localPouch.get(id);
        deferred.resolve(result);
      }).catch(function(err) {
        deferred.reject(err);
        console.log(err);
      });
      return deferred.promise;
    },

    getUser: function(id) {
      var deferred = $q.defer();
      localPouch.get(id).then(function(doc) {
        deferred.resolve(doc);
        console.log(doc);
      }).catch(function(err) {
        deferred.reject(err);
      });
    },

    deleteSurvey: function(id, groupId) {
      var deferred = $q.defer();
      var resultSurvey = [];
      localPouch.get(id).then(function(doc) {
        doc.surveys.forEach(function(survey) {
          if(survey.groupId !== '' && survey.groupId != groupId) {
            resultSurvey.push(survey);
          }
        });
        console.log(resultSurvey);
        localPouch.put({
          _id: doc._id,
          _rev: doc._rev,
          username: doc.username,
          password: doc.password,
          surveys: resultSurvey
        });
      }).then(function() {
        var result = localPouch.get(id);
        console.log(result);
        deferred.resolve(result);
      }).catch(function(err) {
        deferred.reject(err);
        console.log(err);
      });
      return deferred.promise;
    }
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

app.controller('headerCtrl', function($scope, $state, $rootScope, $timeout) {
  $rootScope.changes = false;
  $rootScope.connected = false;
  $rootScope.couchConnection = 'Verifying...';
  $rootScope.couchChanges = "No changes found";

  $scope.$on('connected', function() {
    document.getElementById("dbconnection").className = "button btn-outline-success";
  });

  $scope.$on('disconnected', function() {
    document.getElementById("dbconnection").className = "button btn-outline-danger";
  });

  $scope.$on('changes', function() {
    console.log('changessss');
    $rootScope.changes = true;
    $rootScope.couchChanges = 'Changes found tap to refresh';
    document.getElementById('changeRefresh').className = "icon fa fa-refresher fa-spin fa-lg fa-fw";
    $timeout(function() {
      $scope.$apply();
    });

    $scope.refresh = function() {
      console.log($rootScope.changes);
      if($rootScope.changes === false) {
        return;
      } else {
        document.getElementById('changeRefresh').className = "icon fa fa-refresher fa-lg fa-fw";
        $rootScope.couchChanges = 'No changes found';
        $rootScope.changes = false;
        $state.reload();
        $scope.$broadcast('scroll.refreshComplete');
      }
    };
  });
});

app.controller('mainTabsCtrl', function($scope, $cookies, $state, $service, $timeout, $rootScope, $ionicHistory) {
  $rootScope.isAuth = false;

  $scope.logout = function() {
    window.localStorage.removeItem('user');
    $rootScope.isAuth = false;
    $state.go('login');
    $ionicHistory.clearCache().then(function() {
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
      $ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true });
    });
  };
});

app.controller('loginCtrl', function($pouchdb, $scope, $timeout, $cordovaNetwork, $ionicPopup, $service, $state, $cookies, $rootScope, pouchService) {
  $scope.pouchService = $pouchdb.retryReplication();
  var localPouch = $pouchdb.localDB;
  var remoteDB = $pouchdb.remoteDB;
  $scope.items = [];
  $scope.user = {};
  $scope.search = {};
  $rootScope.isAuth = false;

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
    $('#active-username').focus();
    var element = document.getElementById('active-username');
    element.classList.add('active');
    var elementIcon = document.getElementById('active-username-icon');
    element.classList.add('active');
    $scope.search = {};
    $scope.user.username = name;
    $timeout(function() {
      $scope.$apply();
    });
  };

  $scope.submitForm = function() {
    pouchService.login($scope.user.username, $scope.user.password)
    .then(
      function(res) {
        console.log(res);
        window.localStorage.setItem('user', res._id);
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
});

app.controller('homeCtrl', function($pouchdb, $scope, $cookies, $state, $ionicPopup, $service, pouchService, $rootScope, $timeout) {
  $scope.pouchService = $pouchdb.retryReplication();
  var localPouch = $pouchdb.localDB;
  var remoteDB = $pouchdb.remoteDB;
  $scope.surveys = [];
  $scope.hasRecent = false;

  $scope.changes = false;
  $rootScope.$on('changes', function() {
    $scope.changes = true;
  });
  $scope.refresh = function() {
    $scope.changes = false;
    window.location.reload();
  };
  $scope.$broadcast('scroll.refreshComplete');

  if(window.localStorage.getItem('user') === undefined) {
    $rootScope.isAuth = false;
    $state.go('tabs.home');
  } else {
    $rootScope.isAuth = true;
    $scope.user = window.localStorage.getItem('user');
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

});

app.controller('posterListCtrl', function($pouchdb, $scope, $ionicPopup, $service, pouchService, $rootScope, $cookies, $state) {
  $scope.pouchService = $pouchdb.retryReplication();
  var localPouch = $pouchdb.localDB;
  var remoteDB = $pouchdb.remoteDB;
  $scope.posters = [];
  $scope.loading = false;

  $scope.changes = false;
  $rootScope.$on('changes', function() {
    $scope.changes = true;
  });
  $scope.refresh = function() {
    $scope.changes = false;
    window.location.reload();
  };
  $scope.$broadcast('scroll.refreshComplete');

  angular.element(document).ready(function () {
    $scope.loading = true;
    $scope.$apply();
  });

  if(window.localStorage.getItem('user') === undefined) {
    $rootScope.isAuth = false;
    $state.go('tabs.home');
  } else {
    $rootScope.isAuth = true;
    $scope.user = window.localStorage.getItem('user');
  }

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
            template: '<p style=\'text-align:center\'>getPosters()</p>'
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

app.controller('posterCtrl', function($pouchdb, $scope, poster, $state, $window, $cookies, $service, $timeout, $ionicPopup, pouchService, $rootScope, $ionicLoading) {
  $scope.pouchService = $pouchdb.retryReplication();
  var localPouch = $pouchdb.localDB;
  var remoteDB = $pouchdb.remoteDB;
  $scope.loading = false;
  $scope.changes = false;
  $scope.poster = poster;
  $scope.countJudges = 0;
  $scope.previousSurveyed = false;
  $scope.previousAnswers = [];
  $scope.judgesSurveyed = [];
  $scope.answers = [];
  $scope.disableEdit = false;
  var groupName = $scope.poster.group;
  var groupId = $scope.poster.id;
  console.log($scope.poster)

  $rootScope.$on('changes', function() {
    $scope.changes = true;
  });
  $scope.refresh = function() {
    $scope.changes = false;
    window.location.reload();
  };
  $scope.$broadcast('scroll.refreshComplete');

  angular.element(document).ready(function () {
    $scope.loading = true;
    $scope.$apply();
  });

  if(window.localStorage.getItem('user') === undefined) {
    $rootScope.isAuth = false;
    $state.go('tabs.home');
  } else {
    $rootScope.isAuth = true;
    $scope.user = window.localStorage.getItem('user');
  }

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
              template: '<p style=\'text-align:center\'>submitQuestions() --> submitSurvey</p>'
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
                  template: '<p style=\'text-align:center\'>submitQuestions() --> confirmPopup</p>'
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
        console.log(doc);
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
          template: '<p style=\'text-align:center\'>checkPreviousSurveyed()</p>'
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
          template: '<p style=\'text-align:center\'>judgesWhoHaveSurveyed()</p>'
        });
        return;
      }
    );
  };

  $scope.checkPreviousSurveyed();
  $scope.judgesWhoHaveSurveyed();

});

app.controller('logoutCtrl', function($rootScope, $cookies, $state, $timeout) {
  console.log('logout');
  window.localStorage.removeItem('user');
  $rootScope.isAuth = false;
  $timeout(function() {
    $state.go('login');
    $rootScope.$apply();
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

app.filter('clearText', function() {
  return function(text) {
    var result = text ? String(text).replace(/"<[^>]+>/gm , '') : '';
    result = result.replace(/,/g, ', ');
    return result;
  };
});
