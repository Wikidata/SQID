define(['rules/rules.module'
	   ],
function() {
	angular.module('rules').factory('references',
	['ast',
	function(ast) {
		function generateReference(query, linkText) {
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

		return { generateReference: generateReference
			   };
	}]);

	return {};
});
