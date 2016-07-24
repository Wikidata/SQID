//////// Module Definition ////////////
define([
	'oauth/oauth.module',
	'util/util.service'
], function() {
///////////////////////////////////////
angular.module('oauth').factory('oauth', ['util', '$http', function(util, $http) {

	var getUserInfo = function(){
		return $http.jsonp('http://tools.wmflabs.org/sqid/oauth.php?action=userinfo&format=json&callback=JSON_CALLBACK').then(function(response){
			if (response){
				return response.data;
			}else{
				return null;
			}
		});
		// return util.httpRequest('http://tools.wmflabs.org/sqid/oauth.php?action=userinfo&format=json');
		// return util.jsonpRequest('http://tools.wmflabs.org/sqid/oauth.php?action=userinfo&format=json');
	};
	return {
		getUserInfo: getUserInfo
	};
}]);

return {}; }); // module definition end
