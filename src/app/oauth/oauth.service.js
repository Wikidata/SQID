//////// Module Definition ////////////
define([
	'oauth/oauth.module',
	'util/util.service'
], function() {
///////////////////////////////////////
angular.module('oauth').factory('oauth', ['util', '$http', '$location', '$route', function(util, $http, $location, $route) {
	var promiseUserInfo;
	var dummyLogin = false;

	var setDummyLogin = function(){
		dummyLogin = true;
	}

	var unsetDummyLogin = function(){
		dummyLogin = false;
	}

	var checkDummy = function(){
		if ($route.current.params.dummy){
			if ((String($route.current.params.dummy) == 'true') ||
				(String($route.current.params.dummy) == '1')){
				setDummyLogin();
			}else{
				unsetDummyLogin();
			}
		}else{
			unsetDummyLogin();
		}
	}


	var getUserInfo = function(){
		checkDummy();

		if (dummyLogin){
			return Promise.resolve({"userinfo": {"name": "Dummy"}});
		}
		if ($location.host() == "localhost"){
			return Promise.resolve(null);
		}
		promiseUserInfo = $http.get($location.protocol() + '://tools.wmflabs.org/widar/?action=get_rights&botmode=1').then(function(response){
			if (response){
				return response.data.result.query;
			}else{
				return null;
			}
		});
		return promiseUserInfo;
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

	var addStatement = function(qid, statement){
		var data = '"{\\\"claims\\\":[' + statement.replace(/"/g, '\\\"') + ']}"';
		var jsonArg = '{"action": "wbeditentity", "id":"' + qid	 +'", "data": ' + data + '}';
		var genericQueryString = $location.protocol()
			+ '://tools.wmflabs.org/widar/index.php?botmode=1&action=generic&json=' + encodeURIComponent(jsonArg);
		var resp = $http.get(genericQueryString).then(function(response){
			if (response.data.error){
				console.log(response.data.error);
			}
		});
		return resp;
	}

	var addSource = function(snaks, stmtId){
		var jsonArg = JSON.stringify(snaks);
		var url = $location.protocol()
			+ '://tools.wmflabs.org/widar/index.php?botmode=1&action=add_source&statement='
			+ stmtId + '&snaks=' + jsonArg;
		var resp = $http.get(url).then(function(response){
			if (response.data.error){
				console.log(response.data.error);
			}
		});
		return resp;
	}

	var userinfo = function(){
		if (!promiseUserInfo){
			return getUserInfo();
		}else{
			return promiseUserInfo;
		}
	};

	var logout = function(){
		promiseUserInfo = null;
		unsetDummyLogin();
	}

	return {
		userinfo: userinfo,
		refreshUserInfo: getUserInfo,
		setLabel: setLabel,
		setClaims: setClaims,
		setString: setString,
		addStatement: addStatement,
		addSource: addSource,
		logout: logout,
		setDummyLogin: setDummyLogin,
		unsetDummyLogin: unsetDummyLogin,
		isDummy: function() {
			checkDummy();

			return (dummyLogin === true);
		}
	};
}]);

return {}; }); // module definition end
