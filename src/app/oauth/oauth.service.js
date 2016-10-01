//////// Module Definition ////////////
define([
	'oauth/oauth.module',
	'util/util.service'
], function() {
///////////////////////////////////////
angular.module('oauth').factory('oauth', ['util', '$http', '$location', '$route', function(util, $http, $location, $route) {
	var promise;
	var dummyLogin = false;

	var setDummyLogin = function(){
		dummyLogin = true;
	}

	var unsetDummyLogin = function(){
		dummyLogin = false;
	}


	var getUserInfo = function(){
		if (dummyLogin){
			return Promise.resolve({"userinfo": {"name": "Dummy"}});
		}
		if ($location.host() == "localhost"){
			return Promise.resolve(null);
		}
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
		logout: logout,
		setDummyLogin: setDummyLogin,
		unsetDummyLogin: unsetDummyLogin
	};
}]);

return {}; }); // module definition end
