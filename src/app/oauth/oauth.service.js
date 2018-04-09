//////// Module Definition ////////////
define([
	'oauth/oauth.module',
	'util/util.service'
], function() {
///////////////////////////////////////
angular.module('oauth').factory('oauth', ['util', '$http', '$location', '$route', '$log', '$q', function(util, $http, $location, $route, $log, $q) {
	var promiseUserInfo;
	var dummyLogin = false;

	function checkDummy() {
		if ($route.current.params.dummy) {
			var dummy = String($route.current.params.dummy);
			dummyLogin = (dummy === 'true' ||
						  dummy === '1');
		} else {
			dummyLogin = false;
		}
	}

	function getUserInfo() {
		checkDummy();

		if (dummyLogin) {
			return $q.resolve({"userinfo": {"name": "Dummy"}});
		}

		if ($location.host() == "localhost"){
			return $q.resolve(null);
		}

		promiseUserInfo = widarRequest({
			action: 'get_rights'
		}).then(function(response) {
			if (response) {
				return response.data.result.query;
			}

			return null;
		});

		return promiseUserInfo;
	}

	function userInfo() {
		if (!promiseUserInfo) {
			return getUserInfo();
		}

		return promiseUserInfo;
	}

	function logout() {
		promiseUserInfo = null;
		dummyLogin = false;
	}

	function widarRequest(request) {
		var uri = ($location.protocol() +
					   '://tools.wmflabs.org/widar/index.php?botmode=1');

		for (var key in request) {
			uri += '&' + key + '=' + request[key];
		}

		return $http.get(uri);
	}

	function genericAction(request) {
		return widarRequest({
			action: 'generic',
			json: encodeURIComponent(angular.toJson(request))
		});
	}

	function responseOrNull(response) {
		return ((response)
				? response
				: null);
	}

	function logDataError(response) {
		if (response.data.error) {
			$log.error(response.data.error);
		}

		return response;
	}

	function setLabel(id, label, lang) {
		return widarRequest({
			action: 'set_label',
			q: id,
			lang: lang,
			label: encodeURIComponent(label)
		}).then(responseOrNull);
	}

	// Only use for properties with data type item
	function setClaims(ids, prop, target) {
		return widarRequest({
			action: 'set_claims',
			ids: ids,
			prop: prop,
			target: target
		}).then(responseOrNull);
	}

	function setString(id, prop, text) {
		return widarRequest({
			action: 'set_string',
			id: id,
			prop: prop,
			text: text
		}).then(responseOrNull);
	}

	function addStatement(qid, statement) {
		return genericAction({
			action: 'wbeditentity',
			id: qid,
			data: angular.toJson({claims: [statement]})
		}).then(logDataError);
	}

	function addSource(snaks, stmtId) {
		return widarRequest({
			action: 'add_source',
			statement: stmtId,
			snaks: angular.toJson(snaks)
		}).then(logDataError);
	}

	return {
		userinfo: userInfo,
		refreshUserInfo: getUserInfo,
		setLabel: setLabel,
		setClaims: setClaims,
		setString: setString,
		addStatement: addStatement,
		addSource: addSource,
		genericAction: genericAction,
		logout: logout,
		isDummy: function() {
			checkDummy();

			return (dummyLogin === true);
		}
	};
}]);

return {}; }); // module definition end
