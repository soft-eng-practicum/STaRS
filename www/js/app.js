// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic', 'app.routes', 'ngStorage', 'angular-md5']);

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

app.controller('mainTabsCtrl', function($scope) {

});

app.service('pouchService', function() {
  this.PouchService = function($rootScope) {
    var self = this;
    self.localDB = new PouchDB('judges');
    self.localDB.changes({live: true, since: 'now'}).on('change', function() {
      if(self.onChangeListener) {
        self.onChangeListener();
      }
    });

    self.remoteDB = new PouchDB('http://127.0.0.1:5984/judges');
    self.disconnected = false;
    var inProgress = false;
    var STARTING_RETRY_TIMEOUT = 1000;
    var BACKOFF = 1.1;
    var retryTimeout = STARTING_RETRY_TIMEOUT;
    function regularReplication() {
      self.localDB.replicate.from(self.remoteDB)
      .on('change', handleSuccess)
      .on('complete', handleComplete)
      .on('error', handleError)
    }

    function handleError(err) {
      console.log('error during replication');
      if(err) {
        console.log(err);
      }
      self.disconnected = true;
      if(inProgress) {
        retryTimeout = Math.floor(retryTimeout * BACKOFF);
      }
      inProgress = false;
      setTimeout(replicate, retryTimeout);
      $rootScope.$apply();
    }
    function handleSuccess() {
      retryTimeout = STARTING_RETRY_TIMEOUT;
      self.disconnected = false;
      $rootScope.$apply();
    }

    function handleComplete() {
      handleSuccess();
      self.syncComplete = true;
      $rootScope.$apply();
    }
    function replicate() {
      if (inProgress) {
        return;
      }
      inProgress = true;

      regularReplication();
    }

    replicate();
  }
  this.PouchService.onChange = function (onChangeListener) {
    console.log('onChange');
    this.onChangeListener = onChangeListener;
  };

  this.PouchService.onComplete = function (onCompleteListener) {
    console.log('onComplete');
    this.onCompleteListener = onCompleteListener;
  };

  this.PouchService.onError = function (onErrorListener) {
    console.log('onError');
    this.onErrorListener = onErrorListener;
  };
});


app.controller('homeCtrl', function($scope, $state, $ionicPopup, $service, pouchService) {
  $scope.pouchService = pouchService.PouchService();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  localPouch.allDocs({
    include_docs:true,
    attachments:true
  }).then(function(res) {
    res.rows.forEach(function(row) {
      console.log(row);
    });
  });
  $scope.user = {};
  $scope.auth = $service.getAuthorized();
  if($scope.auth === undefined) {
    $scope.isAuth = false;
  } else {
    $scope.isAuth = true;
  }

  $scope.submitForm = function() {
    $service.login($scope.user.username, $scope.user.password).then(function(res) {
      if(res === undefined) {
        $scope.isAuth = false;
        $ionicPopup.alert({
          title: 'Error',
          template: '<p style=\'text-align:center\'>Invalid username or password</p>'
        });
      } else if(res.value === false) {
        $scope.isAuth = true;
        window.localStorage.setItem($scope.user.username, JSON.stringify(res.promise.$$state.value));
      } else if(res.value === true) {
        $scope.isAuth = true;
        $service.setAuthorized(window.localStorage.getItem($scope.user.username));
      }
      $scope.$apply();
    });
    /*if($service.login($scope.user.username, $scope.user.password) === true) {
      $state.go('tabsController.posterList');
    } else {
      $ionicPopup.alert({
        title: 'Error',
        template: '<p style=\'text-align:center\'>Invalid username or password</p>'
      });
    }*/
  }
});

app.controller('posterListCtrl', function($scope, $ionicPopup, $service, pouchService) {
    $scope.pouchService = pouchService.PouchService();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  $scope.auth = $service.getAuthorized();
  if($scope.auth === undefined) {
    $scope.isAuth = false;
  } else {
    $scope.isAuth = true;
  }

  $scope.posters = [];
  $scope.loading = true;

  $service.getPosters().success(function(data) {
    $scope.posters = data.posters;
  });
});

app.controller('posterCtrl', function($scope, poster, $service, $ionicPopup, pouchService) {
  $scope.pouchService = pouchService.PouchService();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;

  $scope.auth = $service.getAuthorized();
  if($scope.auth === undefined) {
    $scope.isAuth = false;
  } else {
    $scope.isAuth = true;
  }
  console.log($scope.isAuth);

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
  var pouch = pouchService.PouchService();
  var localPouch = pouchService.localDB;
  var remoteDB = pouchService.remoteDB;
  var authorized;
  return {
    login: function(username, password) {
      var deferred = $q.defer();
      var hasHash = false;
      return localPouch.allDocs({
        include_docs: true,
        attachments: true
      }).then(function(res) {
        res.rows.forEach(function(row) {
          if(angular.equals(row.doc.username,username) && angular.equals(row.doc.password,password)) {
            if(row.doc.hash != '') {
              deferred.resolve(row.doc.hash);
              hasHash = true;
              return {
                promise: deferred.promise,
                value: hasHash
              }
                      $rootScope.$apply();
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
              return {
                promise: deferred.promise,
                value: hasHash
              }
                      $rootScope.$apply();
            }
          } else {
            return deferred.resolve(false);
            $rootScope.$apply();
          }
        });
      }).catch(function(err) {
        console.log(err);
        $rootScope.$apply();
      })
    },
    getSurvey: function() {
      return $http.get('./survey.json');
    },
    getPosters: function() {
      return $http.get('./posters.json');
    },
    getAuthorized: function() {
      return authorized;
    },
    setAuthorized: function(hash) {
      authorized = hash;
    }
  }
});

app.factory('$pouchDB', function($rootScope, $q, $http) {
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
    submitSurvey: function(id, answers) {
      localPouch.get(id).then(function(doc) {
        console.log(answers);
        var timesJudged = doc.timesJudged+1;
        var previousJudges = doc.previousJudged;
        console.log(timesJudged);
        console.log(doc.previousJudged);
        return localPouch.put({
          _id: doc._id,
          _rev: doc._rev,
          timesJudged: 0,
          groupName: "BIO",
          questions: [
            {
              information: "Information and Background",
              value: 0
            },
            {
              information: "Question, Problem, and Hypothesis",
              value: 0
            },
            {
              information: "Experimental Approach and Design",
              value: 0
            },
            {
              information: "Data and Results",
              value: 0
            },
            {
              information: "Discussions and Conclusion",
              value: 0
            },
            {
              information: "Research Originality/Novelty",
              value: 0
            },
            {
              information: "Poster Organization, Style, Visual Appeal",
              value: 0
            },
            {
              information: "Oral Presentation of Research",
              value: 0
            },
            {
              information: "Ability to Answer Questions",
              value: 0
            },
            {
              information: "Overall Presentation",
              value: 0
            },
            {
              information: "Additional Comments",
              value: ""
            }
          ],
          judgesName: "",
          previousJudged: [
            {
              judgeName: "test"
            },
            {
              judgeName: "test2"
            }
          ]
        });
      }).then(function(res) {
        console.log(res);
      }).catch(function(err) {
        console.log(err);
      });
    }
  }
});