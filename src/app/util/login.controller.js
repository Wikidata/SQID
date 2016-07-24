//////// Module Definition ////////////
define([
	'util/util.module', // pulls in angular
	'util/oauth.service'
], function() {
///////////////////////////////////////

angular.module('util').controller('Login', ['oauth', '$scope', function(oauth, $scope) {
	var check= function(){
		console.log("get here");
		return true;
	}
	$scope.username = "";
	var show = "true";
	// oauth.getUserInfo().then(function(response){
	// 	$scope.username = response.name;
	// 	console.log(username);
	// });
}]);

return {}; }); // module definition end