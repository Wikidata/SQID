//////// Module Definition ////////////
define([
	'util/util.module',
	'util/util.service',
	'oauth/oauth.service'
], function() {
///////////////////////////////////////

angular.module('util').factory('primarySources', ['util', '$http', '$location', 'oauth', function(util, $http, $location, oauth) {
	var baseUrl = $location.protocol() + '://tools.wmflabs.org/wikidata-primary-sources/';

	var STATEMENT_APPROVAL_URL = 'https://tools.wmflabs.org/wikidata-primary-sources/statements/{{id}}' +
		'?state={{state}}&user={{user}}';

	var STATEMENT_STATES = {
		approved: 'approved',
		wrong: 'wrong',
		duplicate: 'duplicate',
		blacklisted: 'blacklisted',
		unapproved: 'unapproved'
  };

	var getStatements = function(qId){
		var url = baseUrl + 'entities/' + qId + '?callback=JSON_CALLBACK';

		$http.defaults.headers.common.Accept = 'application/vnd.wikidata+json';
		var promise = $http.get(url).then(function(response){
			if (!response){
				return null;
			}
			for (key in response.data.entities[qId].claims){
				angular.forEach(response.data.entities[qId].claims[key], function(statement){
					if ('qualifiers' in statement){
						var ref = [];
						var toDelete = [];
						for (qkey in statement.qualifiers){
							if (qkey[0] == 'S'){
								var refStatementGroup = [];
								angular.forEach(statement.qualifiers[qkey], function(qualifier){
									appendReference(qualifier, refStatementGroup);
								});
								ref.push([qkey.replace('S', 'P'), refStatementGroup]);
								toDelete.push(qkey);
							}
						}
						angular.forEach(toDelete, function(pId){
							delete statement.qualifiers[pId];
						});
						if (ref.length > 0){
							statement['references'] = createReferences(ref);
						}
					}
				});
			}
			return response.data.entities[qId];
		},function(data){
			return {};	
		});

		$http.defaults.headers.common.Accept = 'application/json';
		
		return promise;
	};

	var setRefreshFunction = function(refresh){
		refreshFunction = refresh;
	};	

	var approve = function(qid, statement, refresh){
		var stmt = JSON.parse(statement);
		var psId = stmt.id;
		delete stmt.id;
		delete stmt.source;
		stmt.type = 'statement';
		statement = JSON.stringify(stmt);
		return oauth.addStatement(qid, statement).then(function(){
			oauth.userinfo().then(function(data){
				var user = data.userinfo.name;
				var url = STATEMENT_APPROVAL_URL
					.replace(/\{\{user\}\}/, user)
					.replace(/\{\{state\}\}/, STATEMENT_STATES.approved)
					.replace(/\{\{id\}\}/, psId);

				$http.post(url).then(function(res){
					console.log(res);
					if(refresh){
						refreshFunction();
					}
				});
			});
		});
	};

	var reject = function(qid, statement, refresh){
		oauth.userinfo().then(function(data){
			var user = data.userinfo.name;
			var url = STATEMENT_APPROVAL_URL
				.replace(/\{\{user\}\}/, user)
				.replace(/\{\{state\}\}/, STATEMENT_STATES.wrong)
				.replace(/\{\{id\}\}/, JSON.parse(statement).id);

			$http.post(url).then(function(res){
				console.log(res);
				if(refresh){
					refreshFunction();
				}
			});
		});
	};

	var approveReference = function(stmtId, snaks, psId, refresh){
		psId = psId ? psId : stmtId;
		return oauth.addSource(snaks, stmtId).then(function(){
			oauth.userinfo().then(function(data){
				var user = data.userinfo.name;
				var url = STATEMENT_APPROVAL_URL
					.replace(/\{\{user\}\}/, user)
					.replace(/\{\{state\}\}/, STATEMENT_STATES.approved)
					.replace(/\{\{id\}\}/, psId);

				$http.post(url).then(function(res){
					console.log(res);
					if(refresh){
						refreshFunction();
					}
				});
			});
		});

		// TODO send approve to primary sources
	}

	var rejectReference = function(stmtId, snaks, psId, refresh){
		psId = psId ? psId : stmtId;
		oauth.userinfo().then(function(data){
			var user = data.userinfo.name;
			var url = STATEMENT_APPROVAL_URL
				.replace(/\{\{user\}\}/, user)
				.replace(/\{\{state\}\}/, STATEMENT_STATES.wrong)
				.replace(/\{\{id\}\}/, psId);
			$http.post(url).then(function(res){
				console.log(res);
				if (refresh){
					refreshFunction();
				}
			});
		});
	}

	var appendReference = function(squalifier, references){
		var pId = squalifier.property.replace('S', 'P');
		// without hash and datatype
		references.push({datavalue: squalifier.datavalue, property: pId, snaktype: squalifier.snaktype });
	}

	var createReferences = function(references){
		var result = [{}];
		result[0]['snaks'] = {};
		result[0]['snak-order'] = [];
		angular.forEach(references, function(ref){
			result[0]['snaks'][ref[0]] = ref[1];
			result[0]['snak-order'].push(ref.property);
		});
		return result;
	}

	var refreshFunction = function(){};

	return {
		getStatements: getStatements,
		setRefreshFunction: setRefreshFunction,
		approve: approve,
		reject: reject,
		approveReference: approveReference,
		rejectReference: rejectReference
	};
}]);


return {}; }); // module definition end
