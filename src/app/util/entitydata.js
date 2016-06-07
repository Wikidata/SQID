//////// Module Definition ////////////
define([
	'util/util', // pulls in angular
	'util/wikidataapi',
	//'util/i18n'
], function() {
///////////////////////////////////////

angular.module('utilities').factory('entitydata', ['wikidataapi', 'util', 'i18n', 'sparql', '$q', function(wikidataapi, util, i18n, sparql, $q) {

	var getStatementValue = function(statementJson, defaultValue) {
		try {
			var ret = statementJson.mainsnak.datavalue.value;
			if (ret) return ret;
		} catch (err) {
			// fall through
		}
		return defaultValue;
	}

	var addEntityIdsFromSnak = function(snak, missingIds) {
		if (snak.snaktype == 'value') {
			switch (snak.datavalue.type) {
				case 'wikibase-entityid':
					if (snak.datavalue.value["entity-type"] == "item") {
						missingIds["Q" + snak.datavalue.value["numeric-id"]] = true;
					}
					break;
				case 'quantity':
					var unit = util.getIdFromUri(snak.datavalue.value.unit);
					if (unit !== null) {
						missingIds[unit] = true;
					}
					break;
				case 'globecoordinate':
					var globe = util.getIdFromUri(snak.datavalue.value.globe);
					if (globe !== null) {
						missingIds[globe] = true;
					}
					break;
				case 'time':
				case 'string':
				case 'monolingualtext':
				default:
					break; // no ids
			}
		}
	}
	
	var addEntityIdsFromSnaks = function(snaks, result) {
		angular.forEach(snaks, function (snakList) {
			angular.forEach(snakList, function(snak) {
				addEntityIdsFromSnak(snak, result);
			});
		});
	}

	var getEntityIds = function(statements) {
		var result = {};
		angular.forEach(statements, function(statementGroup) {
			angular.forEach(statementGroup, function (statement) {
				addEntityIdsFromSnak(statement.mainsnak, result);
				if ('qualifiers' in statement) {
					addEntityIdsFromSnaks(statement.qualifiers, result);
				}
				if ('references' in statement) {
					angular.forEach(statement.references, function (reference) {
						addEntityIdsFromSnaks(reference.snaks, result);
					});
				}
			});
		});
		return Object.keys(result);
	}

	var addPropertyIdsFromSnak = function(snak, missingIds) {
		if ( snak.snaktype == 'value'
			&& snak.datavalue.type == 'wikibase-entityid'
			&& snak.datavalue.value["entity-type"] == "property" ) {
				missingIds["P" + snak.datavalue.value["numeric-id"]] = true;
		}
		missingIds[snak.property] = true;
	}
	
	var addPropertyIdsFromSnaks = function(snaks, result) {
		angular.forEach(snaks, function (snakList) {
			angular.forEach(snakList, function(snak) {
				addPropertyIdsFromSnak(snak, result);
			});
		});
	}

	var getPropertyIds = function(statements) {
		var result = {};
		angular.forEach(statements, function(statementGroup) {
			angular.forEach(statementGroup, function (statement) {
				addPropertyIdsFromSnak(statement.mainsnak, result);
				if ('qualifiers' in statement) {
					addPropertyIdsFromSnaks(statement.qualifiers, result);
				}
				if ('references' in statement) {
					angular.forEach(statement.references, function (reference) {
						addPropertyIdsFromSnaks(reference.snaks, result);
					});
				}
			});
		});
		return Object.keys(result);
	}

	var getEntityData = function(id) {
		var language = i18n.getLanguage();
		return wikidataapi.getEntityData(id, language).then(function(response) {
			var ret = {
				language: language, // this is fixed for this result!
				label: '',
				labelorid: id,
				description: '',
				aliases: [],
				statements: {},
				missing: false,
				termsPromise: null,
				propLabelPromise: null,
				waitForPropertyLabels: function() {
					if (this.propLabelPromise == null) {
						var propIdList = getPropertyIds(this.statements);
						this.propLabelPromise = i18n.waitForPropertyLabels(propIdList, language);
					}
					return this.propLabelPromise;
				},
				waitForTerms: function() {
					if (this.termsPromise == null) {
						var termIdList = getEntityIds(this.statements);
						this.termsPromise = i18n.waitForTerms(termIdList, language);
					}
					return this.termsPromise;
				}
			};

			if ("error" in response || "missing" in response.entities[id]) {
				ret.missing = true;
				return ret;
			}

			var entityData = response.entities[id];

			if ("labels" in entityData && ret.language in entityData.labels) {
				ret.label = entityData.labels[ret.language].value;
				ret.labelorid = entityData.labels[ret.language].value;
			}
			if ("descriptions" in entityData && ret.language in entityData.descriptions) {
				ret.description = entityData.descriptions[ret.language].value;
			}
			if ("aliases" in entityData && ret.language in entityData.aliases) {
				var aliasesData = entityData.aliases[ret.language];
				for (var i in aliasesData){
					ret.aliases.push(aliasesData[i].value);
				}
			}
			if ("claims" in entityData) {
				ret.statements = entityData.claims;
			}

			return ret;
		});
	};

	var getSparqlQueryForInlinks = function(objectId, limit) {
		return sparql.getStandardPrefixes() + "\
SELECT ?it ?s ?p (SAMPLE(?pq) as ?pqs) \n\
WHERE { \n\
	{ SELECT DISTINCT ?it ?s ?p { \n\
		?s ?ps wd:" + objectId + " . ?it ?pc ?s . \n\
		?p wikibase:statementProperty ?ps . ?p wikibase:claim ?pc . \n\
		FILTER( ?p != <http://www.wikidata.org/entity/P31> ) \n\
	} LIMIT " + limit + " } \n\
	OPTIONAL { ?s ?pq ?v . ?psub wikibase:qualifier ?pq } \n\
} GROUP BY ?it ?s ?p";
	}

	var getSparqlQueryForInlinksByProperty = function(propertyId, objectId, limit) {
		return sparql.getStandardPrefixes() + "\
SELECT ?it ?s (SAMPLE(?pq) as ?pqs) \n\
WHERE { \n\
	{ SELECT DISTINCT ?it ?s { \n\
		?s ps:" + propertyId + " wd:" + objectId + " . ?it p:" + propertyId + " ?s . \n\
    } LIMIT " + limit + " } \n\
    OPTIONAL { ?s ?pq ?v . ?psub wikibase:qualifier ?pq } \n\
} GROUP BY ?it ?s ";
	}

	var getSparqlQueryForInlinksByPropertyContinuation = function(propertyId, objectId, limit) {
		return sparql.getStandardPrefixes() + "\
SELECT DISTINCT ?entity { \n\
	?entity p:" + propertyId + "/ps:" + propertyId + " wd:" + objectId + "\n\
} LIMIT " + limit;
	}

	var getContinuationLink = function(propertyId, objectId) {
		return sparql.getQueryUiUrl(getSparqlQueryForInlinksByPropertyContinuation(propertyId, objectId, 10000));
	}

	var getSparqlQueryForInProps = function(objectId) {
		return sparql.getStandardPrefixes() + "\
SELECT DISTINCT ?p { \n\
		?s ?ps wd:" + objectId + " . \n\
		?p wikibase:statementProperty ?ps . \n\
		FILTER( ?p != <http://www.wikidata.org/entity/P31> ) \n\
}";
	}
	
	var addInlinksFromQuery = function(instanceJson, statements, propertyIds, itemIds, objectId, fixedPropId) {
		for (var i = 0; i < instanceJson.length; i++) {
			var pid = fixedPropId ? fixedPropId : instanceJson[i].p.value.substring("http://www.wikidata.org/entity/".length);
			var eid = instanceJson[i].it.value.substring("http://www.wikidata.org/entity/".length);
			var sid = instanceJson[i].s.value.substring("http://www.wikidata.org/entity/statement/".length);
			var hasQualifiers = ("pqs" in instanceJson[i]); // TODO use this information

			if (! (pid in statements) ) {
				statements[pid] = [];
				propertyIds[pid] = true;
			}

			if (statements[pid].length < 100) {
				var entityType;
				if (eid.substring(0,1) == "P") {
					entityType = "property";
					propertyIds[eid] = true;
				} else {
					entityType = "item";
					itemIds[eid] = true;
				}

				var value = { "entity-type": entityType, "numeric-id": parseInt(eid.substring(1)) };
				var snak = {
					snaktype: "value",
					property: pid,
					datatype: "wikibase-item",
					datavalue: {value: value, type: "wikibase-entityid"}
				}; 
				var stmt = { mainsnak: snak, rank: "normal", type: "statement", id: sid }; 
				statements[pid].push(stmt);
			} else {
				var snak = {
					snaktype: "value",
					property: pid,
					datatype: "sqid-text",
					datavalue: {value: '<a href="' + getContinuationLink(pid, objectId) + '"><span translate="FURTHER_RESULTS"></span></a>', type: "sqid-text"}
				}; 
				var stmt = { mainsnak: snak, rank: "normal", type: "statement", id: sid }; 
				statements[pid].push(stmt);
			}
		}
	}
	
	var getInlinkRecord = function(language, statements, propertyIds, itemIds) {
		return {
				language: language, // this is fixed for this result!
				statements: statements,
				termsPromise: null,
				propLabelPromise: null,
				waitForPropertyLabels: function() {
					if (this.propLabelPromise == null) {
						this.propLabelPromise = i18n.waitForPropertyLabels(Object.keys(propertyIds), language);
					}
					return this.propLabelPromise;
				},
				waitForTerms: function() {
					if (this.termsPromise == null) {
						this.termsPromise = i18n.waitForTerms(Object.keys(itemIds), language);
					}
					return this.termsPromise;
				}
			};
	}

	var getInlinkData = function(id) {
		var language = i18n.getLanguage();
		return sparql.getQueryRequest(getSparqlQueryForInlinks(id,101)).then(function(data){
			var instanceJson = data.results.bindings;
			var element;
			var statements = {};
			var propertyIds = {};
			var itemIds = {};

			if (instanceJson.length < 101) { // got all inlinks in one query
				addInlinksFromQuery(instanceJson, statements, propertyIds, itemIds, id);
				return getInlinkRecord(language, statements, propertyIds, itemIds);
			} else {
				return  sparql.getQueryRequest(getSparqlQueryForInProps(id)).then(function(propData){
					var requests = [];
					var propIds = [];
					angular.forEach(propData.results.bindings, function (binding) {
						var propId = util.getIdFromUri( binding.p.value );
						propIds.push(propId);
						requests.push( sparql.getQueryRequest(getSparqlQueryForInlinksByProperty(propId, id, 101)) );
					});
					return $q.all(requests).then( function(responses) {
						for (var i = 0; i < responses.length; i++) {
							addInlinksFromQuery(responses[i].results.bindings, statements, propertyIds, itemIds, id, propIds[i]);
						}
						return getInlinkRecord(language, statements, propertyIds, itemIds);
					});
				})
			}
		});
	}

	return {
		getStatementValue: getStatementValue,
		getEntityData: getEntityData,
		getInlinkData: getInlinkData
	};
}]);

return {}; // module
});		  // definition end