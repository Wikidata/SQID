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
			}else{
				return null;
			}});
		return result;
	};

	// Only use for properties with data type item
	var setClaims = function(ids, prop, target){
		var result = $http.get($location.protocol()
				+ '://tools.wmflabs.org/widar/index.php?action=set_claims&ids='
				+ ids + '&prop='
				+ prop + '&target='
				+ targets + '&botmode=1'
			).then(function(response){
				if (response){
					return response;
				}else{
					return null;
				}
			});
		return result;
	}

	var setString = function(id, prop, text){
		var result = $http.get($location.protocol()
			+ '://tools.wmflabs.org/widar/index.php?action=set_string&id='
			+ id + '&prop='
			+ prop + '&text='
			+ text + '&botmode=1'
			).then(function(response){
				if (response){
					return response;
				}else{
					return null;
				}
			});
		return result;
	}

	var userinfo = function(){
		if (!promise){
			return getUserInfo();
		}else{
			return promise;
		}
	};

	var logout = function(){
		promise = null;
	}

	return {
		userinfo: userinfo,
		refreshUserInfo: getUserInfo,
		setLabel: setLabel,
		setClaims: setClaims,
		setString: setString,
		logout: logout
	};
}]);

return {}; }); // module definition end
