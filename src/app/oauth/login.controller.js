//////// Module Definition ////////////
define([
	'oauth/oauth.module', // pulls in angular
	'oauth/oauth.service',
	'util/to_trusted.filter'
], function() {
///////////////////////////////////////


angular.module('util').controller('Login', ['oauth', '$scope', '$location', function(oauth, $scope, $location) {
	$scope.username = '';
	$scope.authorizationLink = $location.protocol() + '://tools.wmflabs.org/widar/?action=authorize';
	$scope.showLogin = false;

	var requestUserInfo = function(){
		oauth.userinfo().then(function(data){
			if (data){
				$scope.username = data.userinfo.name;
				$scope.showLogin = false;
			}else{
				$scope.showLogin = true;
			}
		});	
	}
	$scope.refresh = function(){
		oauth.refreshUserInfo().then(function(data){
			requestUserInfo();		
		});
	};

	requestUserInfo();

	// oauth.getUserInfo().then(function(response){
	// 	console.log(response);
	// 	// $scope.username = response.name;
	// 	// console.log(username);
	// });
}]);

return {}; }); // module definition end
