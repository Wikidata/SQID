define(['ajv',
		'rules/rules.module'
	   ],
function(ajv) {
	angular.module('rules').factory('ast',
	['$http', '$log', '$sce', 'i18n',
	 function($http, $log, $sce, i18n) {
		function print(ast, opts) {
			if (angular.isUndefined(opts)) {
				opts = {};
			}

			opts.prettify = opts.prettify || false;
			opts.dropUnusedBodyVariables = opts.dropUnusedBodyVariables || false;

			return _print(ast, opts);
		}

		function _print(ast, opts) {
			var result = '';

			function nobreak(str) {
				return ((opts.prettify)
						? '<span style="white-space: nowrap;">' + str + '</span>'
						:str);
			}

			function bold(str) {
				return ((opts.prettify)
						? '<strong class="text-muted">' + str + '</strong>'
						: str);
			}

			function classify(str, cls) {
				return ((opts.prettify)
						? '<span class="' + cls + '">' + str + '</span>'
						: str);
			}

			if (angular.isArray(ast)) {
				return ast.join(', ');
			}

			switch (ast.type) {
			case 'variable':
				result = classify(ast.name, 'text-primary');
				break;
			case 'set-variable':
				result = classify(ast.name, 'text-info');
				break;

			case 'rule':
				var bodyPrinter = function(body) {
					return _print(body,
								  angular.extend(opts, {
									  variablesInHead: variables(ast.head),
									  variablesInBody: variables(ast.body)
								  }));
				};

				result = ast.body.map(bodyPrinter).join(',<br>') + '<br> ⟶ ' +
					_print(ast.head,
						   angular.extend(opts, {
							   dropUnusedBodyVariables: false
						   }));
				break;

			case 'relational-atom':
				var annotation = _print(ast.annotation, opts);
				result = bold('(') + nobreak(_print(ast.arguments[0], opts)) +
					bold('.') + nobreak(_print(ast.predicate, opts)) +
					bold(' = ') + nobreak(_print(ast.arguments[1], opts)) +
					bold(')') + ((annotation.length > 0)
								 ? (bold('@') + annotation)
								 : '');
				break;

			case 'set-term':
				result = ((!opts.prettify || (ast.assignments.length > 0))
						  ? ('{' + ast.assignments.map(function(as) {
							  return nobreak(_print(as.attribute, opts)) + bold(' = ') + nobreak(_print(as.value, opts));
						  }).join(', ') + '}')
						  : (''));
				break;

			case 'specifier-atom':
				result = _print(ast.set, opts) + bold(':') + _print(ast.specifier, opts);
				break;

			case 'union':
				result = ('(' + _print(ast.specifiers[0], opts) + bold(' || ') +
						  _print(ast.specifiers[1], opts) + ')');
				break;

			case 'intersection':
				result = ('(' + _print(ast.specifiers[0], opts) + bold(' && ')  +
						  _print(ast.specifiers[1], opts) + ')');
				break;

			case 'difference':
				result = ('(' + _print(ast.specifiers[0], opts) + bold(' \\ ') +
						  _print(ast.specifiers[1], opts) + ')');
				break;

			case 'function-term':
				result = ast.name + '(' +
					ast.arguments.map(function(elt) {
						return _print(elt, opts);
					}).join(', ') + ')';
				break;

			case 'open-specifier':
				result = bold('(') + ast.assignments.map(function(as) {
					return _print(as.attribute, opts) + bold(' = ') + _print(as.value, opts);
				}).join(', ') + bold(')');
				break;

			case 'closed-specifier':
				result = bold('[') + ast.assignments.map(function(as) {
					return _print(as.attribute, opts) + bold(' = ') + _print(as.value, opts);
				}).join(', ') + bold(']');
				break;

			case 'star':
				result = bold('*');
				break;

			case 'plus':
				result = bold('+');
				break;

			case 'dot':
				result = _print(ast.fromSpecifier, opts) + bold('.') + _print(ast.item, opts);
				break;

			case 'literal':
				result = ((opts.prettify)
						  ? (['<span class="text-success" title="',
							  ast.name,
							  '">',
							  $sce.trustAsHtml(i18n.getEntityLabel(ast.name)),
							  '</span><sup>',
							  ast.name,
							  '</sup>'].join(''))
						  : ast.name);
				break;

			default:
				$log.debug("unknown object in _print(): " + ast);
				break;
			}

			return result;
		}

		function bind(m, f) {
			return m.map(f).reduce(function(acc, elt) {
				return acc.concat(elt);
			}, []);
		}

		function literals(ast) {
			var collector = [];

			if (angular.isArray(ast)) {
				return collector.concat(bind(ast, literals));
			}

			switch (ast.type) {
			case 'star': // fallthrough
			case 'plus': // fallthrough
			case 'variable': // fallthrough
			case 'set-variable':
				break;

			case 'rule':
				collector = collector.concat(
					bind(ast.body, literals),
					literals(ast.head)
				);
				break;

			case 'relational-atom':
				collector = collector.concat(
					literals(ast.predicate),
					bind(ast.arguments, literals),
					literals(ast.annotation)
				);
				break;

			case 'set-term':
				collector = collector.concat(
					bind(ast.assignments, literals)
				);
				break;

			case 'specifier-atom':
				collector = collector.concat(
					literals(ast.set),
					literals(ast.specifier)
				);
				break;

			case 'union': // fallthrough
			case 'intersection': // fallthrough
			case 'difference':
				collector = collector.concat(
					literals(ast.specifiers[0]),
					literals(ast.specifiers[1])
				);
				break;

			case 'function-term':
				collector = collector.concat(
					bind(ast.arguments, literals)
				);
				break;

			case 'open-specifier': // fallthrough
			case 'closed-specifier':
				collector = collector.concat(
					bind(ast.assignments, literals)
				);
				break;

			case 'assignment':
				collector = collector.concat(
					literals(ast.attribute),
					literals(ast.value)
				);
				break;

			case 'dot':
				collector = collector.concat(
					literals(ast.fromSpecifier),
					literals(ast.item)
				);
				break;

			case 'literal':
				collector = ast;
				break;

			default:
				// something different. assume it doesn't have literals.
				break;
			}

			return collector;
		}

		function variables(ast) {
			var collector = [];

			if (angular.isArray(ast)) {
				return collector.concat(bind(ast, variables));
			}

			switch (ast.type) {
			case 'variable': // fall through
			case 'set-variable':
				collector = ast;
				break;

			case 'rule':
				collector = collector.concat(
					bind(ast.body, variables),
					variables(ast.head)
				);
				break;

			case 'relational-atom':
				collector = collector.concat(
					variables(ast.predicate),
					bind(ast.arguments, variables),
					variables(ast.annotation)
				);
				break;

			case 'set-term':
				collector = collector.concat(
					bind(ast.assignments, variables)
				);
				break;

			case 'specifier-atom':
				collector = collector.concat(
					variables(ast.set),
					variables(ast.specifier)
				);
				break;

			case 'union': // fallthrough
			case 'intersection': // fallthrough
			case 'difference':
				collector = collector.concat(
					variables(ast.specifiers[0]),
					variables(ast.specifiers[1])
				);
				break;

			case 'function-term':
				collector = collector.concat(
					bind(ast.arguments, variables)
				);
				break;

			case 'open-specifier': // fallthrough
			case 'closed-specifier':
				collector = collector.concat(
					bind(ast.assignments, variables)
				);
				break;

			case 'assignment':
				collector = collector.concat(
					variables(ast.attribute),
					variables(ast.value)
				);
				break;

			case 'dot':
				collector = collector.concat(
					variables(ast.fromSpecifier),
					variables(ast.item)
				);
				break;

			case 'star': // fallthrough
			case 'plus': // fallthough
			case 'literal': // fallthrough
			default:
				// something different. assume it doesn't have variables.
				break;
			}

			return collector;
		}

		function verify(ast) {
			// verify that the AST conforms to the schema
			$http.get('data/rules.schema.json')
				.then(function(response) {
					var schema = response.data;
					var validator = new ajv();
					var valid = validator.validate(schema, ast);
				 if (!valid) {
						var errMsg = 'Failed to validate rule AST: ' +
							validator.errors;
					 $log.error(validator.errors);
						throw new SyntaxError(errMsg);
					}
				});

			// ensure rule safety
			var variablesInHead = variables(ast.head);
			var variablesInBody = variables(ast.body);

			vars: for (var variable in variablesInHead) {
				for (var other in variablesInBody) {
					if (variable.name === other.name) {
						if (variable.type !== other.type) {
							throw new SyntaxError("Variable `" + variable +
												  " occurs with different types.");
						}

						continue vars;
					}
				}

				throw new SyntaxError("Variable `" + variable +"' " +
									  "does not occur in rule body");
			}
		}

	return { print: print,
			 verify: verify,
			 literals: literals,
			 variables: variables
		   };
	}]);

	return {};
});
