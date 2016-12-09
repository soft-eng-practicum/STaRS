angular.module('app.controllers', ['ui.router'])

.controller('mainTabsCtrl', function($scope) {

})

.controller('homeCtrl', function($scope, $ionicPopup, $service) {
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
})
.controller('posterListCtrl', function($scope) {

});
