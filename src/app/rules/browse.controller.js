define(['rules/rules.module',
		'rules/provider.service'
	   ],
function() {
	angular.module('rules').controller('BrowseController',
	['$scope', '$translate', '$q',
	'i18n', 'ast', 'provider',
	function($scope, $translate, $q, i18n, ast, provider) {
		$scope.translation = {};

		var rules = provider.getRules(true);

		$q.all(rules.map(function(rule) {
				   var literals = ast
					   .literals(rule)
					   .map(function (literal) {
						   return literal.name;
					   });
				   var terms = literals.filter(function(id) {
					   return id.substr(0, 1) === 'Q';
				   });
				   var properties = literals.filter(function(id) {
					   return id.substr(0, 1) === 'P';
				   });

				   return $q.all([
					   i18n.waitForTerms(terms),
					   i18n.waitForPropertyLabels(properties)
				   ]);
			   })
			  ).then(function() {
				  $scope.rules = rules.map(function(rule) {
						  // thaw rule
						  return angular.extend({}, rule);
					  });
			  });
	}]);

	return {};
});
