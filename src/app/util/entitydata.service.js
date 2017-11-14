//////// Module Definition ////////////
define([
	'util/util.module',
	'util/wikidataapi.service',
	'util/util.service',
	'util/sparql.service',
	'proposals/primarySources.service',
	'i18n/i18n.service'
], function() {
///////////////////////////////////////

angular.module('util').factory('entitydata', [
'wikidataapi', 'util', 'i18n', 'sparql', 'primarySources', '$q',
function(wikidataapi, util, i18n, sparql, primarySources, $q) {

	/**
	 * Returns the "best" value among a list of statements. This is the value of
	 * the first preferred statement, or (if no statement exists), the value of the
	 * first non-deprecated statement.
	 */
	var getBestStatementValue = function(statementsJson, defaultValue) {
		var result = null;
		var hasPreferred = false;
		angular.forEach(statementsJson, function(statementJson) {
			if (hasPreferred) { // poor man's "break"
				return;
			}
			if (statementJson.rank == 'preferred') {
				hasPreferred = true;
				result = getStatementValue(statementJson, defaultValue);
			} else if (statementJson.rank != 'deprecated' && result == null) {
				result = getStatementValue(statementJson, defaultValue);
			}
		});
		return result != null ? result : defaultValue;
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
//				console.log('stmt', statement)
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

	/**
	 * Returns a number to represent the rank of the given statement.
	 * Deprecated is 1, normal is 2, and preferred is 3.
	 */
	var getRankNumber = function(statement) {
		switch (statement.rank) {
			case 'deprecated': return 1;
			case 'preferred': return 3;
			default: case 'normal': return 2;
		}
	}

	/**
	 * Returns the first snak assigned to the first qualifier in the list, or null
	 * if none of the qualifiers in the list have any value.
	 */
	var getQualifierSnak = function(statement, qualifierPropertyList) {
		var snak = null;
		if ('qualifiers' in statement) {
			angular.forEach(qualifierPropertyList, function(qualifierProperty) {
				if (snak != null) return;
				angular.forEach(statement.qualifiers, function(snakList, property) {
					if (snak == null && property == qualifierProperty) {
						snak = snakList[0];
					}
				});
			});
		}
		return snak;
	}

	/**
	 * Returns a list representation of a time associated with the statement,
	 * or the maximal date if there is none.
	 */
	var getStatementTime = function(statement) {
		var dateSnak = getQualifierSnak(statement, ['P580','P585','P582']);
		if (dateSnak != null && dateSnak.snaktype == 'value') {
			return util.getTimeComponents(dateSnak.datavalue, [0,1,1,0,0,0]);
		} else {
			return [Number.MAX_VALUE,12,31,23,59,59];
		}
	}

	getStatementLanguage = function(statement, language) {
		var lang = 'ZZZ';
		if (statement.mainsnak.snaktype == 'value' && statement.mainsnak.datavalue.type == 'monolingualtext') {
			lang = statement.mainsnak.datavalue.value.language;
			if (lang == language) {
				lang = '0'; // sorts first
			}
		}
		return lang;
	}

	/**
	 * Returns the integer representation of the numeric position or rank qualifier
	 * value associated with a statement, or Number.MAX_VALUE if there is no such qualifier.
	 */
	var getStatementPosition = function(statement) {
		var posSnak = getQualifierSnak(statement, ['P1352','P1545']);
		if (posSnak != null && posSnak.snaktype == 'value') {
			return parseInt(posSnak.datavalue.value.amount);
		} else {
			return Number.MAX_VALUE;
		}
	}

	/**
	 * Sorts the list of statements of one property based on a number
	 * of hierarchical criteria such as rank, time qualifiers, position
	 * quantifiers, and language.
	 */
	var sortStatementGroup = function(statementGroup, language) {
		statementGroup.sort(function(s1, s2) {
			var rank1 = getRankNumber(s1);
			var rank2 = getRankNumber(s2);
			if (rank1 < rank2) {
				return 1;
			} else if (rank2 < rank1) {
				return -1;
			} else {
				var time1 = getStatementTime(s1);
				var time2 = getStatementTime(s2);
				var comparison = util.lexicographicComparator(time1,time2);
				if (comparison != 0) {
					return comparison;
				} else {
					var pos1 = getStatementPosition(s1);
					var pos2 = getStatementPosition(s2);
					if (pos1 < pos2) {
						return -1;
					} else if (pos1 > pos2) {
						return 1;
					} else {
						var lang1 = getStatementLanguage(s1, language);
						var lang2 = getStatementLanguage(s2, language);
						if (lang1 < lang2) {
							return -1;
						} else if (lang1 > lang2) {
							return 1;
						} else {
							return 0;
						}
					}
				}
			}
		});
	}

	var getEntityData = function(id) {
		var language = i18n.getLanguage();
		return wikidataapi.getEntityData(id, language, true).then(function(response) {
			var ret = {
				language: language, // this is fixed for this result!
				label: '',
				labelorid: id,
				description: '',
				aliases: [],
				statements: {},
				sitelinks: {},
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
				ret.label = util.escapeHtml(entityData.labels[ret.language].value);
				ret.labelorid = util.escapeHtml(entityData.labels[ret.language].value);
			}
			if ("descriptions" in entityData && ret.language in entityData.descriptions) {
				ret.description = util.escapeHtml(entityData.descriptions[ret.language].value);
			}
			if ("aliases" in entityData && ret.language in entityData.aliases) {
				var aliasesData = entityData.aliases[ret.language];
				for (var i in aliasesData){
					ret.aliases.push(util.escapeHtml(aliasesData[i].value));
				}
			}
			if ("claims" in entityData) {
				ret.statements = {};
				angular.forEach(entityData.claims, function(statementGroup, property) {
					sortStatementGroup(statementGroup, ret.language);
					for (var i=0; i < statementGroup.length; i++){
						statementGroup[i]['source'] = 'Wikidata';
					}
					ret.statements[property] = statementGroup;
				});
			}
			if ("sitelinks" in entityData) {
				ret.sitelinks = {};
				for (var i in entityData.sitelinks){
					ret.sitelinks[entityData.sitelinks[i].site] = entityData.sitelinks[i].title;
				}
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
				return	sparql.getQueryRequest(getSparqlQueryForInProps(id)).then(function(propData){
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

	var determineEquivalentStatements = function(eStatementGroup, pStmt){
		var equivalentStatements = [];
		angular.forEach(eStatementGroup, function(eStmt){
			if (angular.isUndefined(eStmt.mainsnak.datavalue) ||
				angular.isUndefined(pStmt.mainsnak.datavalue)) {
				return;
			}

			if (valueIsEquivalent(eStmt.mainsnak.datavalue, pStmt.mainsnak.datavalue)){

				// check qualifiers
				var qualEq = true;
				if (pStmt.qualifiers){
					angular.forEach(eStmt.qualifiers, function(qualifierGroup, qProperty){
						if (qProperty in pStmt.qualifiers){
							angular.forEach(qualifierGroup, function(qStmt){
								var eqExists = false;
								angular.forEach(pStmt.qualifiers[qProperty], function(pqStmt){
									if (valueIsEquivalent(qStmt.datavalue, pqStmt.datavalue)){
										eqExists = true;
									}
								});
								if (!eqExists){
									qualEq = false;
								}
							})
						}
					});
				}

				if (qualEq){
					equivalentStatements.push(eStmt);
						isNew = false;
				}
			}
		});
		return equivalentStatements;
	};

	var valueIsEquivalent = function(v1, v2){
		if (v1.type != v2.type){
			return false;
		}

		if (v1.value == v2.value){ // type=string
			return true;
		}

		if (v1.type == 'quantity'){
			return (v1.value.amount == v2.value.amount);
		}

		if (v1.type == 'wikibase-entityid'){
			return ((v1.value['numeric-id'] == v2.value['numeric-id']) &&
				(v1.value['entity-type'] == v2.value['entity-type']));
		}

		if (v1.type == 'time'){
			return (v1.value.time == v2.value.time);
		}

		if (v1.type == 'globecoordinate'){
			return ((v1.value.globe == v2.value.globe) &&
				(v1.value.latitude == v2.value.latitude) &&
				(v1.value.longitude == v2.value.longitude));
		}

		if (v1.type == 'monolingualtext'){
			return ((v1.value.language == v2.value.language) &&
				(v1.value.text == v2.value.text));
		}

		return false;

	}

	var hasNoneDuplicates = function(pReferences, eStatements){
		var nonEquivalentRefsStatements = [];
		var hasEquivalent = false;
		angular.forEach(eStatements, function(eStmt){
			// check if eStmt has references
			var equivalent = true;
			angular.forEach(pReferences, function(pRef){ // check if all pReferences in eStmt
				var pRefExists = false;
				angular.forEach(eStmt.references, function(eRef){
					// check if eRef == pRef -> set pRefExists = true
					var snakGroupMissing = false;
					angular.forEach(pRef.snaks, function(pRefGroup, pProperty){
						var eHasSnakGroup = false;
						angular.forEach(eRef.snaks, function(eRefGroup, eProperty){
							var eRefGroupIsPRefGroup = true;
							if (eProperty == pProperty){
								angular.forEach(pRefGroup, function(pRefGroupValue){
									var pRefGroupValueIneRefGroup = false;
										angular.forEach(eRefGroup, function(eRefGroupValue){
											if (valueIsEquivalent(eRefGroupValue.datavalue, pRefGroupValue.datavalue)){
												pRefGroupValueIneRefGroup = true;
											}
										});
									if (!pRefGroupValueIneRefGroup){
										eRefGroupIsPRefGroup = false;
									}
								})
							}else{
								eRefGroupIsPRefGroup = false;
							}
							if (eRefGroupIsPRefGroup){
								eHasSnakGroup = true;
							}
						});
						if (!eHasSnakGroup){
							snakGroupMissing = true;
						}
					});
					if (!snakGroupMissing){
						pRefExists = true;
					}
				});
				if (!pRefExists){
					equivalent = false;
				}
			});
			if (equivalent){
				hasEquivalent = true;
			}
		});
		if (!hasEquivalent){
			angular.forEach(pReferences, function(pRef){
				nonEquivalentRefsStatements.push(pRef);
			});
		}
		var result = {};
		result.refStatements = nonEquivalentRefsStatements;
		for (var i=0; i < eStatements.length; i++){
			if (eStatements[i].source == 'Wikidata'){
				result.nonProposal = eStatements[i];
			}
		}
		result.duplicate = eStatements[0];
		return result;
	}

	var mergeReferences = function(statement, reference){
		reference.parent = statement;
		statement.references.push(reference);
	}

	function mergeStatements(into, from) {
		var modified = false;

		if (!('statements' in from)) {
			// nothing to see here, move along
			return into;
		}

		if (!('statements' in into)) {
			into.statements = {};
		}

		angular.forEach(from.statements, function(statementGroup, property) {
			if (!(property in into.statements)) {
				into.statements[property] = [];
			}

			angular.forEach(statementGroup, function(statement) {
				var isNew = true;
				var statements = into.statements[property].length;

				for (var i = 0; i < statements; ++i) {
					var otherStatement = into.statements[property][i];

					if ((otherStatement.source !== 'Wikidata') &&
						(otherStatement.source != statement.source)) {
						// never consider statements equal between
						// sources, unless the original statement is
						// from Wikidata itself
						continue;
					}

					// TODO this is probably not as robust as it should be.
					if ((angular.equals(otherStatement.mainsnak, statement.mainsnak)) &&
						(angular.equals(otherStatement.qualifiers, statement.qualifiers))) {
							isNew = false;
							break;
						}
				}

				if (isNew) {
					into.statements[property] = into.statements[property].concat([statement]);
					modified = true;
				}
			});
		});

		// If we modified something, return a copy so that watchers will get notified
		return ((modified)
				? angular.copy(into)
				: into);
	}

	return {
		getStatementValue: getStatementValue,
		getBestStatementValue: getBestStatementValue,
		getEntityData: getEntityData,
		getInlinkData: getInlinkData,
		determineEquivalentStatements: determineEquivalentStatements,
		sortStatementGroup: sortStatementGroup,
		hasNoneDuplicates: hasNoneDuplicates,
		mergeReferences: mergeReferences,
		mergeStatements: mergeStatements,
		getPropertyIds: getPropertyIds,
		getEntityIds: getEntityIds
	};
}]);

return {}; }); // module definition end
