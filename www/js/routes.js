angular.module('app.routes', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('tabsController', {
		url: '/page1',
		templateUrl: 'templates/tabsController.html',
		controller: 'mainTabsCtrl',
		abstract: true
	})
	$stateProvider.state('tabsController.home', {
		url: '/home',
		views: {
      		'tab1': {
        		templateUrl: 'templates/home.html',
                controller: 'homeCtrl'
      		}
    	}
	})
	$stateProvider.state('tabsController.posterList', {
		url: '/posterList',
		views: {
			'tab2': {
				templateUrl: 'templates/posterList.html',
				controller: 'posterListCtrl'
			}
		}
	})
	$stateProvider.state('tabsController.poster', {
		url: '/posters/{id}',
		views: {
			'tab2': {
				templateUrl:'templates/poster.html',
				controller: 'posterCtrl'
			}
		},
		resolve: {
			poster: [
				'$stateParams', '$pouchDB',
				function($stateParams, $pouchDB) {
					return $pouchDB.get($stateParams.id);
				}
			]
		}
	})
	$urlRouterProvider.otherwise('/page1/home')
});
