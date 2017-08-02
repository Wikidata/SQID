//////// Module Definition ////////////
define([
	'view/view.module',
	'util/sparql.service'
], function() {
///////////////////////////////////////

angular.module('view').factory('resolver', ['sparql',
function(sparql) {
	var idNames = {
		'viaf': 'P214',
		'gnd': 'P227',
		'pubmed': 'P698',
		'geonames': 'P1566',
		'doi': 'P356',
		'freebase': 'P646',
		'isni': 'P213',
		'imdb': 'P345',
		'sudoc': 'P269',
		'twitter': 'P2002',
		'orcid': 'P496'
	};

	var getQIdQuick = function(exId){
		if (exId){
			var splits = exId.split(/\:(.+)/);
			if (splits.length == 3){ // empty string after separator in second place
				var prop, value;
				if (splits[0].toLowerCase() in idNames) {
					prop = idNames[splits[0].toLowerCase()];
				} else {
					prop = splits[0].toUpperCase();
				}
				value = splits[1];
				return getQIdFromStatement(prop, value);
			}
		}
		return null;
	};

	var getQIdFromStatement = function(prop, value){
		if (prop){
			var promise = sparql.getIdFromLiteral(prop, value).then(function(uri){
				if (uri){
					var newId = uri.split('/').pop();
					return newId;
				}
				return null;
			});

			return promise;
		}else{
			return null;
		}
	};


	return {
		getQIdQuick: getQIdQuick,
		getQIdFromStatement: getQIdFromStatement
	};
}]);

return {};}); // module definition end
