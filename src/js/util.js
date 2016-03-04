
angular.module('utilities', [])
.factory('jsonData', function() {

	var JSON_LABEL = "l";
	var JSON_INSTANCES = "i";
	var JSON_SUBCLASSES = "s";
	var JSON_RELATED_PROPERTIES = "r";

	return {
		JSON_LABEL: JSON_LABEL,
		JSON_INSTANCES: JSON_INSTANCES,
		JSON_SUBCLASSES: JSON_SUBCLASSES,
		JSON_RELATED_PROPERTIES: JSON_RELATED_PROPERTIES,

		JSON_ITEMS_WITH_SUCH_STATEMENTS: "i",
		JSON_USES_IN_STATEMENTS: "s",
		JSON_USES_IN_STATEMENTS_WITH_QUALIFIERS: "w",
		JSON_USES_IN_QUALIFIERS: "q",
		JSON_USES_IN_PROPERTIES: "p",
		JSON_USES_IN_REFERENCES: "e",
		JSON_DATATYPE: "d",

		TABLE_SIZE: 15,
		PAGE_SELECTOR_SIZE: 2
	};

})

.factory('util', function($http, $q) {

	var httpRequest = function(url) {
		return $http.get(url).then(function(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				// invalid response
				return $q.reject(response.data);
			}
		},
		function(response) {
			// something went wrong
			return $q.reject(response.data);
		});
	}

	var jsonpRequest = function(url) {
		return $http.jsonp(url).then(function(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				// invalid response
				return $q.reject(response.data);
			}
		},
		function(response) {
			// something went wrong
			return $q.reject(response.data);
		});
	}
	
	var getIdFromUri = function(uri) {
		if ( uri.substring(0, "http://www.wikidata.org/entity/".length) === "http://www.wikidata.org/entity/" ) {
			return uri.substring("http://www.wikidata.org/entity/".length, uri.length);
		} else {
			return null;
		}
	}

	var getItemUrl = function(itemId) { return "#/classview?id=" + itemId; };
	var getPropertyUrl = function(propertyId) { return "#/propertyview?id=" + propertyId; };

	var getEntityUrl = function(entityId) {
		if (entityId.substring(0,1) == 'Q') {
			return getItemUrl(entityId);
		} else {
			return getPropertyUrl(entityId);
		}
	}

	return {
		httpRequest: httpRequest,
		jsonpRequest: jsonpRequest,
		getEntityUrl: getEntityUrl,
		getItemUrl: getItemUrl,
		getPropertyUrl: getPropertyUrl,
		getIdFromUri: getIdFromUri
	};
})

.factory('sparql', function(util) {

	var SPARQL_SERVICE = "https://query.wikidata.org/bigdata/namespace/wdq/sparql";
	var SPARQL_UI_PREFIX = "https://query.wikidata.org/#";

	var getQueryUrl = function(sparqlQuery) {
		return SPARQL_SERVICE + "?query=" + encodeURIComponent(sparqlQuery);
	}

	var getQueryUiUrl = function(sparqlQuery) {
		return SPARQL_UI_PREFIX + encodeURIComponent(sparqlQuery);
	}
	
	var getQueryForPropertySubjects = function(propertyId, objectId, limit) {
		return "PREFIX wikibase: <http://wikiba.se/ontology#> \n\
PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n\
PREFIX wd: <http://www.wikidata.org/entity/> \n\
SELECT $p $pLabel \n\
WHERE { \n\
   $p wdt:" + propertyId + " wd:" + objectId + " . \n\
   SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" . } \n\
} LIMIT " + limit;
	}

	var getPropertySubjects = function(propertyId, objectId, limit) {
		var url = getQueryUrl(getQueryForPropertySubjects(propertyId, objectId, limit));
		return util.httpRequest(url);
	}

	var getInstance = function(sparqlQuery) {
		return SPARQL_UI_PREFIX + encodeURIComponent(sparqlQuery);
	}

	var getInlinkCount = function(propertyID, objectItemId) {
		var query = "PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n\
PREFIX wd: <http://www.wikidata.org/entity/> \n\
SELECT (count(*) as $c) WHERE { $p wdt:" + propertyID + " wd:" + objectItemId + " . }";
		var result = JSON.parse(httpGet(getQueryUrl(query)));
		return result.results.bindings[0].c.value;
	}

	var prepareInstanceQueryResult = function(data, propertyId, objectId, limit) {
		instances = [];
		try {
			var instanceJson = data.results.bindings;
			var element;
			for (var i = 0; i < instanceJson.length; i++) {
				if ( i < limit-1 ) {
					id = util.getIdFromUri(instanceJson[i].p.value);
					var uri = util.getEntityUrl(id);
					element = {
						label: instanceJson[i].pLabel.value,
						uri: uri
					};
				} else {
					element = {
						label: "... further results",
						uri: getQueryUiUrl(getQueryForPropertySubjects(propertyId, objectId, 1000))
					};
				}
				instances.push(element);
			}
		}
		catch (err) {
			//nothing to do here
		}
		return instances;
	}

	return {
		getQueryUrl: getQueryUrl,
		getQueryUiUrl: getQueryUiUrl,
		getInlinkCount: getInlinkCount,
		getPropertySubjects: getPropertySubjects,
		getIdFromUri: util.getIdFromUri, // deprecated; only for b/c
		prepareInstanceQueryResult: prepareInstanceQueryResult
	};

})

.factory('wikidataapi', function(util, $q) {

	var language = "en";

	var fetchEntityData = function(id) {
// 		return util.httpRequest("https://www.wikidata.org/wiki/Special:EntityData/" + id + ".json?action=purge");
		// Alternatively, the following API call also works. What is faster?
				return util.jsonpRequest('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + id + '&redirects=yes&props=sitelinks|descriptions|claims|datatype|aliases|labels&languages=' + language + '&callback=JSON_CALLBACK');
	}

	var getStatementValue = function(statementJson, defaultValue) {
		try {
			var ret = statementJson.mainsnak.datavalue.value;
			if (ret) return ret;
		} catch (err) {
			// fall through
		}
		return defaultValue;
	}

	var extractEntityData = function(response, id) {
		var ret = {
			label: "",
			labelorid: id,
			description: "",
			images: [],
			aliases: [],
			banner: null,
			superclasses: [],
			instanceClasses: [],
			statements: {}
		};

		var entityData = response.entities[id];

		if (language in entityData.labels) {
			ret.label = entityData.labels[language].value;
			ret.labelorid = entityData.labels[language].value;
		}
		if (language in entityData.descriptions) {
			ret.description = entityData.descriptions[language].value;
		}
		if (language in entityData.aliases) {
			var aliasesData = entityData.aliases[language];
			for (var i in aliasesData){
				ret.aliases.push(aliasesData[i].value);
			}
		}
		
		if ("claims" in entityData) {
			// image
			if ("P18" in entityData.claims) {
				for (var i in entityData.claims.P18) {
					var imageFileName = getStatementValue(entityData.claims.P18[i],"");
					ret.images.push(imageFileName.replace(" ","_"));
				}
			}
			// instance of
			if ("P31" in entityData.claims) {
				for (var i in entityData.claims.P31) {
					ret.instanceClasses.push(getStatementValue(entityData.claims.P31[i],{"numeric-id": 0})["numeric-id"].toString());
				}
			}
			// subclass of
			if ("P279" in entityData.claims) {
				for (var i in entityData.claims.P279) {
					ret.superclasses.push(getStatementValue(entityData.claims.P279[i],{"numeric-id": 0})["numeric-id"].toString());
				}
			}
			// Wikivoyage banner; only pick the first banner if multiple
			if ("P948" in entityData.claims) {
				var imageFileName = getStatementValue(entityData.claims.P948[0],"");
				ret.banner = imageFileName.replace(" ","_");
			}
			
			ret.statements = entityData.claims;
		}

		return ret;
	};

	var getEntityTerms = function(entityIds) {
		var baseUrl = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&redirects=yes&props=descriptions%7Clabels&languages=' + language + '&callback=JSON_CALLBACK';
		var requests = [];

		for (var i = 0; i < entityIds.length; i += 50) {
			requests.push(util.jsonpRequest(baseUrl + '&ids=' + entityIds.slice(i,i+50).join('|')));
		}

		return $q.all(requests).then( function(responses) {
			var ret = {};
			angular.forEach(responses, function(response) {
				if ("entities" in response) {
					angular.forEach(response.entities, function(data,entityId) {
						var label = entityId;
						var desc = "";
						if (language in data.labels) label = data.labels[language].value;
						if (language in data.descriptions) desc = data.descriptions[language].value;
						ret[entityId] = { label: label, description: desc };
					});
				}
			});
			return ret;
		});
	};

	return {
		fetchEntityData: fetchEntityData,
		extractEntityData: extractEntityData,
		getEntityTerms: getEntityTerms
	};
});

