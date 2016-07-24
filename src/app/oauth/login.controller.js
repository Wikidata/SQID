//////// Module Definition ////////////
define([
	'oauth/oauth.module', // pulls in angular
	'oauth/oauth.service',
	'util/to_trusted.filter'
], function() {
///////////////////////////////////////

angular.module('util').controller('Login', ['oauth', '$scope', function(oauth, $scope) {
	$scope.username = '';
	$scope.authorizationLink = 'http://tools.wmflabs.org/sqid/oauth.php?action=authorize';
	$scope.showLogin = false;
	console.log("ger here");
	oauth.getUserInfo().then(function(data){
		if (data){
			$scope.username = data.name;
			$scope.showLogin = false;
			console.log("get here");
			console.log($scope.username);
		}else{
			$scope.showLogin = true;
		}
	});
	// oauth.getUserInfo().then(function(response){
	// 	console.log(response);
	// 	// $scope.username = response.name;
	// 	// console.log(username);
	// });
}]);

return {}; }); // module definition end
