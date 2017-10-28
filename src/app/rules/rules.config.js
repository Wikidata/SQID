define(['rules/rules.module',
		'rules/ast.service',
		'rules/rules.service',
		'rules/parser.service',
		'rules/matcher.service',
		'rules/provider.service',
		'rules/references.service',
		'rules/instantiator.service',
		'rules/browse.controller',
		'rules/explain.controller',
		'rules/consequences.controller',
		'i18n/i18n.service'
	   ],
function() {
	angular.module('rules').config(
		['$routeProvider', '$filterProvider',
		function($routeProvider, $filterProvider) {
			$routeProvider
				.when('/rules/explain', {templateUrl: 'app/rules/explain.html'})
				.when('/rules/browse', {templateUrl: 'app/rules/browse.html'})
				.when('/rules/consequences', {templateUrl: 'app/rules/consequences.html'});
			$filterProvider
				.register('formatRule', ['$sce', 'i18n', 'ast', function($sce, i18n, ast) {
					return function(rule) {
						return $sce.trustAsHtml(
							ast.print(rule, {
								prettify: true
							}));
					};
				}]);
			$filterProvider
				.register('linkToRule', [function() {
					return function(rule) {
						return ('#/rules/consequences?rule=' +
							encodeURIComponent(JSON.stringify(rule)));
					};
				}]);
			$filterProvider
				.register('linkToEntity', [function() {
					return function(entity) {
						return (((('entity-type' in entity) &&
								  (entity['entity-type'] === 'item'))
								 ? 'Q'
								 : 'P') +
								entity['numeric-id']);
					};
				}]);
	}]);

	return {};
});
