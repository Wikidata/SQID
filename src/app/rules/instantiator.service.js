define(['rules/rules.module',
		'util/util.service',
		'rules/ast.service',
		'rules/matcher.service',
		'rules/references.service'
	   ],
function() {
	angular.module('rules').factory('instantiator',
	['util', 'ast', 'matcher', 'references',
	function(util, ast, matcher, references) {
		function augmentBindingsWithSPARQLResult(bindings,
												 sparqlResult) {
			var binds = angular.copy(bindings);
			angular.forEach(sparqlResult, function(item, name) {
				var varName = '?' + name;

				if (!(varName in binds)) {
					binds[varName] = { name: varName };
				}

				if (item.type === 'uri') {
					var id = util.getClaimIdFromSPARQLResult(
						util.getIdFromUri(item.value));

					binds[varName].id = id;
					binds[varName].item = item;
				} else {
					binds[varName].item = item;

					if (item.type === 'literal') {
						binds[varName].item.type = 'literal';
					}
				}
			});

			return binds;
		}

		function augmentBindingsWithAPIResult(bindings,
											  apiResult) {
			angular.forEach(apiResult, function(result) {
				var property = Object.keys(result.claims)[0]; // only a single claim
				var claim = result.claims[property][0];

				// find binding for this claim
				angular.forEach(bindings, function(binding, idx) {
					if (('id' in bindings[idx]) &&
						(bindings[idx].id === claim.id)) {
						bindings[idx].qualifiers =
							(('qualifiers' in claim)
							 ? claim.qualifiers
							 : []);
						bindings[idx].rank = claim.rank;
					}
				});
			});

			angular.forEach(apiResult, function(result) {
				var property = Object.keys(result.claims)[0]; // only a single claim
				var claim = result.claims[property][0];

				// find binding for this claim
				angular.forEach(bindings, function(binding, idx) {
					if (('fromSpecifier' in bindings[idx]) &&
						!('rank' in bindings[idx])) {
						var spec = bindings[bindings[idx].fromSpecifier];

						if (claim.id === spec.id) {
							// todo: support variables in attribute positions
							var prop = bindings[idx].item.attribute.name;
							bindings[idx].item = spec.qualifiers[prop];
							bindings[idx].rank = spec.rank;
						}
					}
				});
			});

			return bindings;
		}

		function instantiateRuleHead(query, linkText, skipReferences) {
			var head = query.rule.head;

			function bindingOrLiteral(name) {
				if (('name' in name) && ('type' in name)) {
					if (name.type === 'literal') {
						return name.name;
					}

					name = name.name;
				}

				if (name in query.bindings) {
					if ('id' in query.bindings[name]) {
						return query.bindings[name].id;
					} else {
						return query.bindings[name].item;
					}
				}

				return name;
			}

			angular.forEach(ast.variables(head),
							function(variable) {
								if (!(variable.name in query.bindings)) {
									throw new RangeError("variable `" + variable.name +
														 "' is not among result bindings");
								}
							});

			var predicate = bindingOrLiteral(head.predicate);
			var object = bindingOrLiteral(head.arguments[1]);
			var qualifiers = {};

			switch (head.annotation.type) {
			case 'set-variable':
				qualifiers = matcher.copyQualifiers(
					query.bindings[head.annotation.name].qualifiers
				);

				break;

			case 'set-term':
				// fallthrough
			case 'closed-specifier':
				angular.forEach(head.annotation.assignments, function(assignment) {
					var property = bindingOrLiteral(assignment.attribute);

					if (!(property in qualifiers)) {
						qualifiers[property] = [];
					}

					switch(assignment.value.type) {
					case 'variable':
						qualifiers[property] = bindingOrLiteral(assignment.value);
						break;

					default:
						qualifiers[property].push({
						snaktype: 'value',
						datatype: 'wikibase-item',
						datavalue: { value: { 'entity-type': 'item',
											  'numeric-id': bindingOrLiteral(assignment.value).substring(1)
											},
									 type: 'wikibase-entityid'
								   },
						property: property
						});
						break;
					}
				});

				break;

			case 'open-specifier':
				// fallthrough
			case 'function-term':
				// fallthrough
			default:
				throw new RangeError("unsupported annotation type `" +
									 head.annation.type + "' in rule head");
			}

			// FIXME turn annotation into qualifiers
			var statement = {};
			statement[predicate] = [{ mainsnak: { snaktype: 'value',
												  property: predicate,
												  datavalue: { type: 'wikibase-entityid',
															   value: { 'entity-type': ((object.substring(0, 1) === 'Q')
																						? 'item'
																						: 'property'),
																		'numeric-id': object.substring(1)
																	  }
															 },
												  datatype: 'wikibase-item'
												},
									  rank: 'normal',
									  type: 'statement',
									  qualifiers: qualifiers,
									  references: ((skipReferences !== true)
												   ? references.generateReference(query,
																				  linkText)
												   : []),
									  proposalType: query.rule.kind,
									  proposalFor: bindingOrLiteral(head.arguments[0])
									}];

			return statement;
		}

		return { augmentBindingsWithSPARQLResult: augmentBindingsWithSPARQLResult,
				 augmentBindingsWithAPIResult: augmentBindingsWithAPIResult,
				 instantiateRuleHead: instantiateRuleHead
		};
	}]);

	return {};
});
