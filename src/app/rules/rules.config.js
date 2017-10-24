define(['rules/rules.module',
		'rules/ast.service',
		'rules/rules.service',
		'rules/parser.service',
		'rules/matcher.service',
		'rules/provider.service',
		'rules/references.service',
		'rules/instantiator.service',
		'rules/browse.controller',
		'rules/explain.controller'
	   ],
function() {
	angular.module('rules').config(
		['$routeProvider', '$filterProvider',
		function($routeProvider, $filterProvider) {
			$routeProvider
				.when('/rules/explain', {templateUrl: 'app/rules/explain.html'})
				.when('/rules/browse', {templateUrl: 'app/rules/browse.html'});
			$filterProvider
				.register('formatRule', ['$sce', 'i18n', 'ast', function($sce, i18n, ast) {
					return function(rule) {
						return $sce.trustAsHtml(
							ast.print(rule, {
								prettify: true
							}));
					};
				}]);
	}]);

	return {};
});
