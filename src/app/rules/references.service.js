define(['rules/rules.module'
	   ],
function() {
	angular.module('rules').factory('references',
	['ast',
	function(ast) {
		function annotateBindings(query) {
			var bindings = {};

			angular.forEach(query.bindings, function(binding) {
				if (('id' in binding) &&
					('name' in binding) &&
					(!('type' in binding) || (binding.type !== 'set-variable')))  {
					bindings[binding.name] = binding.id;
				}
			});

			angular.forEach(ast.variables(query.rule.head), function(variable) {
				var name = variable.name;
				if (!(name in bindings)) {
					return;
				}
				bindings[name] = { id: query.bindings[name].id,
								   type: query.bindings[name].type,
								   qualifiers: query.bindings[name].qualifiers,
								   fromSpecifier: query.bindings[name].fromSpecifier,
								   item: query.bindings[name].item
								 };
			});

			return { rule: query.rule,
					 query: query.query,
					 bindings: bindings,
					 constraints: query.constraints
				   };
		}

		function generateReference(query) {
			var url = ('#/rules/explain?origin=' +
					   encodeURIComponent(query.rule.origin) +
					   '&offset=' + query.rule.offset +
					   '&item=' + query.bindings[query.rule.head.arguments[0].name].id);
			var reference = { P854: [{ datatype: 'url',
									   datavalue: { type: 'string',
													value: url
												  },
									   snaktype: 'value',
									   property: 'P854'
									 }]
							};

			return [{ snaks: reference,
					  'snaks-order': ['P854']
					}];
		}

		return { annotateBindings: annotateBindings,
				 generateReference: generateReference
			   };
	}]);

	return {};
});
