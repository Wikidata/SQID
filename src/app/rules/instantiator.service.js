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
					if ((name.type === 'literal') ||
						(name.type === 'literal-expression')) {
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

			var variablesInHeadAnnotation = ast.variables(head.annotation);

			if (variablesInHeadAnnotation.length > 0) {
				variablesInHeadAnnotation =
					variablesInHeadAnnotation.map(function(variable) {
					return variable.name;
					});
			}

			angular.forEach(ast.variables(head),
							function(variable) {
								if (!(variable.name in query.bindings) &&
									!(variablesInHeadAnnotation.indexOf(variable.name) != -1)) {
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

					switch(assignment.value.type) {
					case 'variable':
						if (!(property in qualifiers)) {
							qualifiers[property] = [];
						}

						qualifiers[property] = bindingOrLiteral(assignment.value);
						break;

					case 'dot':
						var sourceClaim = bindingOrLiteral(assignment.value.fromSpecifier);

						angular.forEach(query.bindings, function(binding) {
							if ((angular.isObject(binding)) &&
								('id' in binding) &&
								(binding.id === sourceClaim) &&
								(assignment.value.item.name in binding.qualifiers)) {
								qualifiers[property] = binding.qualifiers[assignment.value.item.name];
							}
						});

						break;

					default:
						if (!(property in qualifiers)) {
							qualifiers[property] = [];
						}

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
			var mainsnak = {
				snaktype: 'value',
				property: predicate
			};

			if (head.arguments[1].type === 'literal-expression') {
				mainsnak.datatype = 'string';
				mainsnak.datavalue = { value: head.arguments[1].name };
			} else {
				mainsnak.datatype = 'wikibase-item';
				mainsnak.datavalue = {
					type: 'wikibase-entityid',
					value: { 'entity-type': ((object.substring(0, 1) === 'Q')
											 ? 'item'
											 : 'property'),
											 'numeric-id': object.substring(1)
						   },
				};
			}

			statement[predicate] = [{ mainsnak: mainsnak,
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

			console.log(statement)
			return statement;
		}

		return { augmentBindingsWithSPARQLResult: augmentBindingsWithSPARQLResult,
				 augmentBindingsWithAPIResult: augmentBindingsWithAPIResult,
				 instantiateRuleHead: instantiateRuleHead
		};
	}]);

	return {};
});
