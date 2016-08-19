//////// Module Definition ////////////
define([
	'oauth/oauth.module',
	'util/util.service'
], function() {
///////////////////////////////////////
angular.module('oauth').factory('oauth', ['util', '$http', '$location', function(util, $http, $location) {
	var promise;

	var getUserInfo = function(){
		promise = $http.get($location.protocol() + '://tools.wmflabs.org/widar/?action=get_rights&botmode=1').then(function(response){
			if (response){
				return response.data.result.query;
			}else{
				return null;
			}
		});
		return promise;
	};

	var setLabel = function(id, label, lang){
		var result = $http.get($location.protocol() 
				+ '://tools.wmflabs.org/widar/index.php?action=set_label&q=' 
				+ id + '&lang=' 
				+ lang + '&label=' 
				+ encodeURIComponent(label) + '&botmode=1').then(function(response){
			if (response){
				return response;
				console.log(response);
			}else{
				return null;
			}});
		return result;
	};


	var userinfo = function(){
		if (!promise){
			return getUserInfo();
		}else{
			return promise;
		}
	};

	return {
		userinfo: userinfo,
		refreshUserInfo: getUserInfo,
		setLabel: setLabel
	};
}]);

return {}; }); // module definition end
