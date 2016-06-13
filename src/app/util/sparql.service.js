//////// Module Definition ////////////
define([
	'util/util.module',
	'util/util.service',
	'i18n/i18n.service'
], function() {
///////////////////////////////////////

angular.module('util').factory('sparql', ['util', 'i18n', function(util, i18n) {

	var SPARQL_SERVICE = "https://query.wikidata.org/bigdata/namespace/wdq/sparql";
	var SPARQL_UI_PREFIX = "https://query.wikidata.org/#";

	var getQueryUrl = function(sparqlQuery) {
		return SPARQL_SERVICE + "?query=" + encodeURIComponent(sparqlQuery);
	}

	var getQueryUiUrl = function(sparqlQuery) {
		return '#/query?run=' + encodeURIComponent(sparqlQuery);
		//return SPARQL_UI_PREFIX + encodeURIComponent(sparqlQuery);
	}

	var getStandardPrefixes = function() {
		return 	"PREFIX wikibase: <http://wikiba.se/ontology#> \n" +
				"PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n" +
				"PREFIX wd: <http://www.wikidata.org/entity/> \n";
	};

	var getQueryRequest = function(sparqlQuery) {
		return util.httpRequest(getQueryUrl(sparqlQuery));
	};
	
	var getInnerQueryForPropertySubjects = function(resultVarName, propertyId, objectId, limit) {
		return "SELECT DISTINCT ?" + resultVarName + " WHERE { ?" + resultVarName + " wdt:" + propertyId +  (objectId != null ? " wd:" + objectId : " _:bnode") + " . }"
			+ (limit > 0 ? " LIMIT " + limit : "");
	}

	var getQueryForPropertySubjects = function(propertyId, objectId, limit) {
		return getStandardPrefixes() + "\
SELECT $p $pLabel \n\
WHERE { \n\
   { " + getInnerQueryForPropertySubjects("p", propertyId, objectId, limit) + " } \n\
   SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + i18n.getLanguage() + "\" . } \n\
}";
	}

	var getInnerQueryForPropertyObjects = function(resultVarName, subjectId, propertyId, limit) {
		return "SELECT DISTINCT ?" + resultVarName + " WHERE { " + (subjectId != null ? "wd:" + subjectId : "_:bnode")
			+ " wdt:" + propertyId + " ?" + resultVarName + " . FILTER(isIRI(?" + resultVarName + ")) }"
			+ (limit > 0 ? " LIMIT " + limit : "");
	}

	var getQueryForPropertyObjects = function(subjectId, propertyId, limit) {
		return getStandardPrefixes() + "\
SELECT $p $pLabel \n\
WHERE { \n\
   { " + getInnerQueryForPropertyObjects("p", subjectId, propertyId, limit) + " } \n\
   SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + i18n.getLanguage() + "\" . } \n\
}";
	}

	var fetchPropertySubjects = function(propertyId, objectId, limit) {
		return getQueryRequest(getQueryForPropertySubjects(propertyId, objectId, limit));
	}

	var fetchPropertyObjects = function(subjectId, propertyId, limit) {
		return getQueryRequest(getQueryForPropertyObjects(subjectId, propertyId, limit));
	}

	var getInlinkCount = function(propertyID, objectItemId) {
		var query = "PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n\
PREFIX wd: <http://www.wikidata.org/entity/> \n\
SELECT (count(*) as $c) WHERE { $p wdt:" + propertyID + " wd:" + objectItemId + " . }";
		var result = JSON.parse(httpGet(getQueryUrl(query)));
		return result.results.bindings[0].c.value;
	}

	var parseUnarySparqlQueryResult = function(data, limit, continueUrl) {
		results = [];
		try {
			var instanceJson = data.results.bindings;
			var element;
			for (var i = 0; i < instanceJson.length; i++) {
				if ( i < limit-1 ) {
					var uri = i18n.getEntityUrl(util.getIdFromUri(instanceJson[i].p.value));
					element = {
						label: instanceJson[i].pLabel.value,
						uri: uri
					};
				} else {
					element = {
						label: '... further results', // TODO I18N
						uri: getQueryUiUrl(continueUrl)
					};
				}
				results.push(element);
			}
		}
		catch (err) {
			//nothing to do here
		}
		return results;
	}

	var getPropertySubjects = function(propertyId, objectId, limit) {
		return fetchPropertySubjects(propertyId, objectId, limit).then(function(data){
			return parseUnarySparqlQueryResult(data, limit, getInnerQueryForPropertySubjects("entity", propertyId, objectId, 10000));
		});
	}

	var getPropertyObjects = function(subjectId, propertyId, limit) {
		return fetchPropertyObjects(subjectId, propertyId, limit).then(function(data){
			return parseUnarySparqlQueryResult(data, limit, getInnerQueryForPropertyObjects("entity", subjectId, propertyId, 10000));
		});
	}

	return {
		getQueryUrl: getQueryUrl,
		getQueryUiUrl: getQueryUiUrl,
		getQueryRequest: getQueryRequest,
		getStandardPrefixes: getStandardPrefixes,
		getInlinkCount: getInlinkCount,
		getPropertySubjects: getPropertySubjects,
		getPropertyObjects: getPropertyObjects,
		getIdFromUri: util.getIdFromUri // deprecated; only for b/c
	};

}]);

return {}; }); // module definition end