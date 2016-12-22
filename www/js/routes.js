angular.module('app.routes', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
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
			'posterList.tab': {
				templateUrl:'templates/poster.html'
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
	});
	$urlRouterProvider.otherwise('/login');
});
