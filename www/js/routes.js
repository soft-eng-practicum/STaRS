angular.module('app.routes', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('tabsController', {
		url: '/tabs',
		templateUrl: 'templates/tabsController.html',
		controller: 'mainTabsCtrl',
		abstract: true
	})
	$stateProvider.state('tabsController.login', {
		url: '/login',
		views: {
			'tab2': {
				templateUrl: 'templates/login.html',
				controller: 'loginCtrl'
			}
		}
	})
	$stateProvider.state('tabsController.home', {
		url: '/home',
		views: {
			'tab3': {
				templateUrl: 'templates/home.html',
				controller: 'homeCtrl'
			}
		}
	})
	$stateProvider.state('tabsController.posterList', {
		url: '/posterList',
		views: {
			'tab4': {
				templateUrl: 'templates/posterList.html',
				controller: 'posterListCtrl'
			}
		}
	})
	$stateProvider.state('tabsController.poster', {
		url: '/posters/{id}',
		views: {
			'tab4': {
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
					})
					return deferred.promise;
				})
			}
			]
		}
	})
	$stateProvider.state('tabsController.logout', {
		url: '/logout',
		templateUrl: null,
		controller: 'logoutCtrl'
	})
	$stateProvider.state('tabsController.poster.question', {
		url:'/questions/questionId',
		controller: 'questionCtrl',
		resolve: {
			question: [
			'$stateParams', '$pouchDB', '$q',
			function($stateParams, $pouchDB, $q) {
				console.log("test");
				var defObj = $q.defer();
				$pouchDB.getQuestion($stateParams.questionId).then(function(res) {
					console.log(res);
					return defObj.resolve(res);
				})
			}
			]
		}
	});
	$urlRouterProvider.otherwise('/tabs/login');
});
