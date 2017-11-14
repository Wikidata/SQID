define(['proposals/proposals.module',
		'proposals/actions.service',
		'proposals/primarySources.service',
		'rules/rules.service',
		'util/util.service',
		'util/entitydata.service'
], function() {
	angular.module('proposals').factory('proposals',
	['$q', '$log', 'util', 'entitydata', 'rules', 'primarySources', 'i18n',
	function($q, $log, util, entitydata, rules, primarySources, i18n) {

		function getEntityDataListener(id) {
			return function(newData, oldData, scope) {
				var providers = [];
				var haveEditingRights = scope.hasEditRights;
				var haveEntityData = angular.isObject(newData[0]);
				var haveEntityInData = angular.isObject(newData[1]);
				var haveBothData = haveEntityData && haveEntityInData;

				if (haveEntityData && haveEditingRights) {
					// add providers that only need statements
					providers = providers.concat(
						primarySources.getProvider()
					);
				}

				if (haveEntityInData) {
					// add providers that only need inlinks
				}

				if (haveBothData) {
					// add providers that depend on statements and inlinks
					providers = providers.concat(
						rules.getProvider(newData[1], haveEditingRights)
					);
				}

				if (providers.length > 0) {
					includeProposals(
						id,
						providers,
						newData[0]
					).map(function (promise) {
						return promise.then(function(entities) {
							scope.entityData = entitydata.mergeStatements(scope.entityData, entities);
						});
					});
				}
			};
		}

		function includeProposals(id, providers, entities) {
			return providers.map(function(provider) {
				return provider.getStatements(id, entities).then(function(data) {
					return {
						response: data,
						addProposalInformation: provider.addProposalInformation
					};
				}).then(function(result) {
					var entities = [];
					var properties = [];

					if (!('claims' in result.response)) {
						return result;
					}

					entities = entities.concat(entitydata.getEntityIds(result.response.claims));
					properties = properties.concat(entitydata.getPropertyIds(result.response.claims));

					return i18n.waitForPropertyLabels(
						util.unionArrays(properties, [])
					).then(function() {
						return i18n.waitForTerms(
							util.unionArrays(entities, [])
						);
					}).then(function() {
						return result;
					});
				}).then(function(responses) {
					var response = {};

					angular.forEach([responses], function(res) {
						if ('claims' in res.response) {
							angular.forEach(res.response.claims, function(statements) {
								res.addProposalInformation(statements, id);
							});
						}

						angular.forEach(res.response, function(value, key) {
							if (!(key in response)) {
								response[key] = value;
							} else {
								response[key] = Object.assign(response[key], value);
							}
						});
					});

					// make a copy so we don't actually modify the
					// existing entities in-place, which would cause
					// the update to not trigger any listeners
					entities = angular.copy(entities);

					if ('claims' in response){
						angular.forEach(response.claims, function(statementGroup, property) {
							entitydata.sortStatementGroup(statementGroup, entities.language);

							// // add proposal information
							// res.addProposalInformation(statementGroup, id);

							// if there is no corresponding statement group in entities
							// -> create empty statement group
							if (!(property in entities.statements)){
								entities.statements[property] = [];
							}

							// add proposals to existing statement group
							angular.forEach(statementGroup, function(pStmt) {
								var equivalentStatements = entitydata.determineEquivalentStatements(entities.statements[property], pStmt);
								var isNew = (equivalentStatements.length == 0);

								if (!isNew){
									var result = entitydata.hasNoneDuplicates(pStmt.references, equivalentStatements);

									// determine default action
									// $log.debug(pStmt.actions, result.refStatements.map(function(stmnt) { return stmnt.actions; }));

									if (false && result.nonProposal || true) {
										// only propose a new reference for an existing statement.

									} else {
										// need to add a new statement.
										result.actions = pStmt.actions;
									}


									if (result.nonProposal) {
										// add proposed references to already existing Wikidata-Statement
										// -> approve add the reference to the respective Wikidata-Statement
										angular.forEach(result.refStatements, function(ref) {
											if (result.nonProposal.references) {
												ref['refId'] = pStmt.id; // add primary sources id to approve or reject reference
												ref['approve'] = function(refresh) {
													primarySources.approveReference(result.nonProposal.id, ref.snaks, pStmt.id, refresh);
												};
												ref['reject'] = function(refresh) {
													primarySources.rejectReference(result.nonProposal.id, ref.snaks, pStmt.id, refresh);
												};
												result.nonProposal.references.push(ref);
											} else {
												ref['refId'] = pStmt.id;
												result.nonProposal.references = [ref];
											}
										});
									} else {
										// merge proposed references to a single statement
										// -> approve functions create new Wikidata-Statements
										if (result.refStatements != []) {
											if (result.duplicate) {
												angular.forEach(result.refStatements, function(ref) {
													ref['refId'] = pStmt.id;
													ref['approve'] = function(refresh) {
														primarySources.approveNewStatementsReference(id, ref.parent, pStmt.id, refresh);
													};
													ref['reject'] = function(refresh) {
														primarySources.rejectReference(result.duplicate.id, ref.snaks, pStmt.id, refresh);
													};
													entitydata.mergeReferences(result.duplicate, ref);
												});
											} else {
												entities.statements[property].push(pStmt);
											}
										}
									}
								} else {
									entities.statements[property].push(pStmt);
								}
							});
							entitydata.sortStatementGroup(entities.statements[property], entities.language);
						});
					}

					return entities;
				});
			});
		}


		return {
			getEntityDataListener: getEntityDataListener
		};

	}]);

	return {};
});
