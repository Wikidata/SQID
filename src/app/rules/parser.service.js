//////// Module Definition ////////////
define([
	'parsimmon',
	'rules/rules.module',
	'rules/ast.service'
], function(parsimmon) {
	///////////////////////////////////////
	angular.module('rules').factory('parser',
	['$log', 'ast',
	function($log, ast) {
		var P = parsimmon;

		function word(w) {
			return P.string(w).trim(P.regexp(/\s*/m));
		}

		function assignment(r, rhs) {
			return P.seqObj(['attribute', r.ObjectTerm],
							r.equals,
							['value', rhs])
					.thru(type('assignment'));
		}

		function specifier(r, opening, closing, typ) {
			return P.seqObj(opening,
							['assignments',
							 P.sepBy(r.AssignmentWithPlaceholder,
							 r.comma)],
							 closing)
					.thru(type(typ + '-specifier'));
		}

		function specifierExpression(r, type)
		{
			return P.seqObj(r.openingParenthesis,
							['lhs', r.SpecifierTerm],
							r[type],
							['rhs', r.SpecifierTerm],
							r.closingParenthesis)
					.map(function(obj) {
						return {
							type: type,
							specifiers: [obj.lhs, obj.rhs]
						};
					});
		}

		function relationalAtom(r, setTerm) {
			return P.seqObj(r.openingParenthesis,
							['subject', r.ObjectTerm],
							r.dot,
							['predicate', r.ObjectTerm],
							r.equals,
							['object', r.ObjectTerm],
							r.closingParenthesis,
							r.at,
							['annotation', setTerm])
				.map(function(obj) {
					return {
						type: 'relational-atom',
						predicate: obj.predicate,
						arguments: [obj.subject, obj.object],
						annotation: obj.annotation
					};
				});
		}

		function type(type) {
			return function(parser) {
				return parser.map(function(obj) {
					obj.type = type;
					return obj;
				});
			};
		}

		var MARPL = P.createLanguage({
			at: function() { return word('@'); },
			dot: function() { return word('.'); },
			comma: function() { return word(','); },
			colon: function() { return word(':'); },
			arrow: function() { return word('->'); },
			union: function() { return word('||'); },
			equals: function() { return word('='); },
			difference: function() { return word('\\'); },
			intersection: function() { return word('&&'); },
			objectName: function() { return P.regexp(/[PQ]\d+/); },
			variableName: function() { return P.regexp(/\?[a-zA-Z]\w*/); },
			openingBrace: function() { return word('{'); },
			closingBrace: function() { return word('}'); },
			openingFloor: function() { return word('('); },
			closingFloor: function() { return word(')'); },
			openingBracket: function() { return word('['); },
			closingBracket: function() { return word(']'); },
			openingParenthesis: function() { return word('('); },
			closingParenthesis: function() { return word(')'); },
			someVariable: function(r) {
				return P.seqObj(['name', r.variableName])
						.thru(type('some-variable'));
			},
			ObjectVariable: function(r) {
				return P.seqObj(['name', r.variableName])
						.thru(type('variable'));
			},
			ObjectLiteral: function(r) {
				return P.seqObj(['name', r.objectName])
						.thru(type('literal'));
			},
			ObjectTerm: function(r) {
				return P.alt(
					r.ObjectVariable,
					r.ObjectLiteral
				);
			},
			SetLiteral: function(r) {
				return P.seqObj(r.openingBrace,
								['assignments', P.sepBy(r.Assignment, r.comma)],
								r.closingBrace)
						.thru(type('set-term'));
			},
			SetVariable: function(r) {
				return P.seqObj(['name', r.variableName])
						.thru(type('set-variable'));
				},
			SetTerm: function(r) {
				return P.alt(
					r.SetLiteral,
					r.SetVariable,
					specifier(r, r.openingFloor, r.closingFloor, 'open'),
					specifier(r, r.openingBracket, r.closingBracket, 'closed')
				);
			},
			FunctionTerm: function(r) {
				return P.seqObj(['name', P.regexp(/[a-zA-Z]\w*/)],
								r.openingParenthesis,
								['arguments',
								 P.sepBy(P.alt(r.ObjectLiteral,
											   r.SetLiteral,
											   r.someVariable),
										 r.comma)],
								r.closingParenthesis)
						.thru(type('function-term'));
			},
			RelationalAtom: function(r) {
				return relationalAtom(r, r.SetTerm);
			},
			RelationalAtomWithFunctionTerm: function(r) {
				return relationalAtom(r, r.FunctionTerm);
			},
			SimpleRelationalAtom: function(r) {
				return P.seqObj(r.openingParenthesis,
								['subject', r.ObjectTerm],
								r.dot,
								['predicate', r.ObjectTerm],
								r.equals,
								['object', r.ObjectTerm],
								r.closingParenthesis)
					.map(function(obj) {
						return {
							type: 'relational-atom',
							predicate: obj.predicate,
							arguments: [obj.subject, obj.object],
							annotation: {
								type: 'set-term',
								assignments: []
							}
						};
					});
			},
			Placeholder: function() {
				return P.alt(
					word('*').map(function() {
						return {
							type: "star"
						};
					}),
					word('+').map(function() {
						return {
							type: "plus"
						};
					})
				);
			},
			Assignment: function(r) {
				return assignment(r, r.ObjectTerm);
			},
			AssignmentWithPlaceholder: function(r) {
				return assignment(r, P.alt(
					r.ObjectTerm,
					r.Placeholder
				));
			},
			Specifier: function(r) {
				return P.alt(
					specifier(r, r.openingFloor, r.closingFloor, 'open'),
					specifier(r, r.openingBracket, r.closingBracket, 'closed')
				);
			},
			SpecifierExpression: function(r) {
				return P.alt(
					specifierExpression(r, 'union'),
					specifierExpression(r, 'intersection'),
					specifierExpression(r, 'difference')
				);
			},
			SpecifierTerm: function(r) {
				return P.alt(r.SpecifierExpression,
							 r.Specifier);
			},
			SpecifierAtom: function(r) {
				return P.seqObj(['set', r.SetVariable],
								r.colon,
								['specifier', r.SpecifierTerm])
						.thru(type('specifier-atom'));
			},
			Rule: function(r) {
				return P.seqObj(['body', r.Body],
								r.arrow,
								['head', r.Head])
						.thru(type('rule'));
			},
			Head: function(r) {
				return P.alt(
					r.RelationalAtom,
					r.SimpleRelationalAtom,
					r.RelationalAtomWithFunctionTerm
				);
			},
			Body: function(r) {
				return P.sepBy(
					P.alt(
						r.RelationalAtom,
						r.SimpleRelationalAtom,
						r.SpecifierAtom),
					r.comma);
			}
		});

		function parse(rule, skipVerification) {
			var parsed = MARPL.Rule.tryParse(rule);

			parsed = Object.freeze(rewrite(parsed));
			if (skipVerification !== true) {
				ast.verify(parsed);
			}

			return parsed;
		}

		function rewrite(ast) {
			if (ast.head.annotation.type === 'function-term') {
				// disambiguate variable names in the function term
				var args = ast.head.annotation.arguments.length;
				arguments: for (var arg = 0; arg < args; ++arg) {
					if (ast.head.annotation.arguments[arg].type === 'some-variable') {
						// find a binding for this variable in the body
						var name = ast.head.annotation.arguments[arg].name;
						var atoms = ast.body.length;

						for (var atom = 0; atom < atoms; ++atom) {
							switch (ast.body[atom].type) {
							case 'relational-atom':
								if (ast.body[atom].annotation.type === 'set-variable' &&
									ast.body[atom].annotation.name === name) {
									ast.head.annotation.arguments[arg].type = 'set-variable';
									continue arguments;
								}

								for (var property in ['subject, predicate, object']) {
									if (ast.body[atom][property].type === 'variable' &&
										ast.body[atom][property].name === name) {
										ast.head.annotation.arguments[arg].type = 'variable';
										continue arguments;
									}
								}
								break;
							case 'set-atom':
								if (ast.body[atom].set.type === 'set-variable' &&
									ast.body[atom].set.name === name) {
									ast.head.annotation.arguments[arg].type = 'set-variable';
									continue arguments;
								}

								if (ast.body[atom].attribute === name ||
									ast.body[atom].value === name) {
									ast.head.annotation.arguments[arg].type = 'variable';
									continue arguments;
								}
								break;
							case 'specifier-atom':
								if (ast.body[atom].set === name) {
									ast.head.annotation.arguments[arg].type = 'set-variable';
									continue arguments;
								}

								var assignments = ast.body[atom].assignments.length;
								for (var i = 0; i < assignments; ++i) {
									if (ast.body[atom].assignments[i].attribute === name ||
										ast.body[atom].assignments[i].value === name) {
										ast.head.annotation.arguments[arg].type = 'variable';
										continue arguments;
									}
								}
								break;
							default:
								// something unexpected happened, ignore it.
								$log.warn("unexpected atom type `" +
										  ast.body[atom].type +
										  "'in rule body: " + ast);
							}
						}
					}

					if (ast.head.annotation.arguments[arg].type === 'some-variable') {
						// this variable does not occour within the body, as is required
						throw new SyntaxError("Variable `" + name +
											  "' is unbound in rule: " + ast);
					}
				}
			}

			function specifierAtom(name, spec) {
				return {type: 'specifier-atom',
						set: {type: 'set-variable',
							  name: name
							 },
						specifier: spec
					   };
			}

			if (ast.head.annotation.type === 'closed-specifier') {
				// just treat it as a set literal
				ast.head.annotation.type = 'set-term';
			}

			atoms = ast.body.length;
			var newAtoms = [];

			// push specifiers into specifier atoms
			for (atom = 0; atom < atoms; ++atom) {
				if (ast.body[atom].type !== 'relational-atom') {
					continue;
				}

				if (ast.body[atom].annotation.type !== 'open-specifier' &&
					ast.body[atom].annotation.type !== 'closed-specifier') {
					continue;
				}

				var variable = '?_body_spec_for_' + atom;
				newAtoms = newAtoms.concat(
					specifierAtom(variable, ast.body[atom].annotation));
				ast.body[atom].annotation = {type: 'set-variable',
											 name: variable
											};
			}

			ast.body = ast.body.concat(newAtoms);

			return ast;
		}

		function isVariableName(name) {
			try {
				MARPL.variableName.tryParse(name);
			} catch (err) {
				return false;
			}

			return true;
		}

		function isObjectName(name) {
			try {
				MARPL.objectName.tryParse(name);
			} catch (err) {
				return false;
			}
		 return true;
		}


		return {
			parse: parse,
			isVariableName: isVariableName,
			isObjectName: isObjectName
		};
	}]);

	return {};
});
