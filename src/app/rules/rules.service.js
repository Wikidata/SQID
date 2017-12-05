//////// Module Definition ////////////
define([
	'rules/rules.module',
	'rules/ast.service',
	'rules/parser.service',
	'rules/filters.service',
	'rules/matcher.service',
	'rules/provider.service',
	'rules/instantiator.service',
	'proposals/actions.service',
	'util/util.service',
	'util/sparql.service',
	'i18n/i18n.service'
], function() {
	angular.module('rules').factory('rules',
	['$q', '$log', '$translate', 'sparql', 'i18n', 'util', 'entitydata', 'wikidataapi',
	 'ast', 'filters', 'matcher', 'provider', 'instantiator', 'actions',
	 function($q, $log, $translate, sparql, i18n, util, entitydata, wikidataapi,
			  ast, filters, matcher, provider, instantiator, actions) {

		 function getProvider(entityInData, haveEditingRights) {
			 return {
				 getStatements: function(id, entities) {
					 return getStatements(entities, entityInData, id, haveEditingRights);
				 },
				 addProposalInformation: addProposalInformation
			 };
		 }

		 function getStatements(entityData, entityInData, itemId, haveEditingRights) {
			return $q.all([entityData.waitForPropertyLabels(),
						   entityInData.waitForPropertyLabels()
						  ])
				.then(function() {
					return $q.all(checkCandidateRules(
						entityData,
						entityInData,
						itemId,
						haveEditingRights
					));
				}).then(function(results) {
					return deduplicateStatements(entityData, results);
				}).then(function(results) {
					return injectReferences(results);
				}).then(function(results) {
					return { claims: results.statements };
				});
		}

		function checkCandidateRules(entityData, entityInData, itemId, haveEditingRights) {
			return provider.getRules({ canEdit: haveEditingRights })
				.filter(matcher.couldMatch(
					entityData.statements,
					entityInData.statements,
					itemId))
				.map(function(rule) {
					var subject = rule.head.arguments[0].name;
					var binding = {};
					binding[subject] = { id: itemId,
										 name: subject,
										 outbound: entityData,
										 inbound: entityInData
									   };

					var query = matcher.getInstanceCandidatesQuery(rule, binding);

					if (rule.body.length !== 0) {
						return sparql.getQueryRequest(query.query)
							.then(function(sparqlResults) {
								return handleSparqlResults(query, sparqlResults);
							});
					} else {
						// this rule always matches
						return $q.all([handleApiResults(query, [])]);
					}
				});
		}

		function handleSparqlResults(query, sparqlResults) {
			var requests = [];
			angular.forEach(sparqlResults.results.bindings, function(sparqlResult) {
				var qry = angular.copy(query);
				// augment bindings with results from SPARQL
				qry.bindings = instantiator.augmentBindingsWithSPARQLResult(
					query.bindings,
					sparqlResult
				);

				if (sparqlResult.length === 0) {
					return; // no results here, move along
				}

				// find claims we need to retrieve
				var claims = Object.keys(qry.bindings)
					.filter(function(binding) {
						return ((qry.bindings[binding].type ===
								 'set-variable') &&
								'id' in qry.bindings[binding]);
					})
					.map(function(binding) {
						return qry.bindings[binding].id;
					});

				// also retrieve literals via API, so we don't have to
				// do conversion from SPARQL
				angular.forEach(qry.bindings, function(item, binding) {
					if ((item.type === 'set-variable') &&
						('id' in item) &&
						!(item.id in claims)) {
						claims.push(item.id);
					} else if ('fromSpecifier' in item) {
						var id = qry.bindings[item.fromSpecifier].id;

						if (!(id in claims)) {
							claims.push(id);
						}
					}
				});

				requests.push(wikidataapi.getClaims(claims)
					.then(function(apiResults) {
						return handleApiResults(qry, apiResults);
					}));
			});

			return $q.all(requests);
		}

		function handleApiResults(query, apiResults) {
			query.bindings = instantiator.augmentBindingsWithAPIResult(
				query.bindings,
				apiResults
			);

			var instance = matcher.verifyCandidateInstance(query);

			if (angular.isUndefined(instance)) {
				return undefined;
			}

			return $translate('RULES.EXPLAIN').then(function(linkText) {
				return instantiator.instantiateRuleHead(instance, linkText);
			});
		}

		function deduplicateStatements(entityData, data) {
			var statements = {};

			angular.forEach(data, function(candidates) {
				angular.forEach(candidates, function(statement) {
					if (angular.isUndefined(statement)) {
						return;
					}

					angular.forEach(statement, function(snak, property) {
						var isNew = false;

						if (!(property in entityData.statements)) {
							isNew = true;
						} else {
							var existing = entityData.statements[property]
								.filter(function (stmt) {
									// filter out own proposals
									return (('source' in stmt.mainsnak) &&
											stmt.mainsnak.source !== 'MARS');
								});
							var equivalent = entitydata
								.determineEquivalentStatements(existing, snak[0]);

							isNew = (equivalent.length === 0);
						}

						if (isNew) {
							if ((!(property in statements))) {
								statements[property] = [];
							}

							statements[property] = statements[property].concat(snak);
						}
					});
				});
			});

			return statements;
		}

		function injectReferences(results) {
			var statements = results;
			var requests = { propertyIds: [],
							 entityIds: []
						   };
			var num = 0;

			function maybeAddIdForValue(value) {
				var id;

				if (value['entity-type'] === 'item') {
					id = 'Q' + value['numeric-id'];
					if (!(id in requests.entityIds)) {
						requests.entityIds.push(id);
					}
				} else {
					id = 'P' + value['numeric-id'];
					if (!(id in requests.propertyIds)) {
						requests.propertyIds.push(id);
					}
				}
			}

			angular.forEach(statements, function(statement, group) {
				angular.forEach(statement, function(snak, property) {
					statements[group][property].id = ('sqid-inference-' + (++num));
					if (!(property in requests.propertyIds) &&
						(property.length > 0) &&
						(property.substring(1) === 'P')) {
						requests.propertyIds.push(property);
					}


					if (('mainsnak' in snak) &&
						(snak.mainsnak.snaktype === 'value') &&
						(snak.mainsnak.datatype === 'wikibase-item') &&
						(snak.mainsnak.datavalue.type === 'wikibase-entityid')) {
						maybeAddIdForValue(snak.mainsnak.datavalue.value);

						angular.forEach(snak.qualifiers, function(qualifier, property) {
							if (!(property in requests.propertyIds)) {
								requests.propertyIds.push(property);
							}

							angular.forEach(qualifier, function(snak) {
								if ((snak.snaktype === 'value') &&
									(snak.datatype === 'wikibase-item') &&
									(snak.datavalue.type === 'wikibase-entityid')) {
									maybeAddIdForValue(snak.datavalue.value);
								}
							});
						});
					}
				});
			});

			return { requests: requests,
					 statements: statements
				   };
		}

		function addProposalInformation(statements, id) {
			var length = statements.length;
			for (var i = 0; i < length; ++i) {
				statements[i]['source'] = 'MARS';
				angular.forEach(statements[i].references, function(ref, j) {
					ref.refId = statements[i].id + '-ref-' + j;
					ref.source = 'MARS Inference';
					ref.actions = {
						approve: actions.approveReference
						// reject: actions.deprecateReference
					};
				});

				statements[i].actions = {
					approve: actions.approveStatementAndMaybeReference,
					//reject: actions.deprecateStatement

				};
			}

			return statements;
		}

		function getRules() {
			var terms = [];
			var properties = [];

			var rules = provider
				.getRules({ canEdit: true })
				.map(function(rule) {
					ast.literals(rule)
						.map(function(literal) {
							var prefix = literal.name.substr(0, 1);

							if (prefix === 'Q') {
								terms.push(literal.name);
							} else if (prefix === 'Q') {
								properties.push(literal.name);
							}
						});

					return angular.extend({}, rule);
				});

			return $q.all([
				i18n.waitForTerms(terms),
				i18n.waitForPropertyLabels(properties)
			]).then(function() {
				return $translate(['RULES.CONSEQUENCES',
								   'RULES.MATERIALISABLE',
								   'RULES.INFORMATIONAL'
								  ]);
			}).then(function(translations) {
				return rules.map(function(rule) {
					rule.content = ['<emph>' + rule.desc + '</emph><br>' +
									'<code>' + filters.formatRule(rule) + '</code>',
									(translations['RULES.' + rule.kind.toUpperCase()] + '<br>' +
									 '<a href="' + filters.linkToRule(rule) + '">' +
									 translations['RULES.CONSEQUENCES'] + '</a>')
								   ];
					return rule;
				});
			});
		}

		return {
			getRules: getRules,
			getStatements: getStatements,
			getProvider: getProvider,
			handleSparqlResults: handleSparqlResults,
			injectReferences: injectReferences,
			deduplicateStatements: deduplicateStatements
		};
}]);

return {}; }); // module definition end
