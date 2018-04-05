define(['rules/rules.module',
		'rules/ast.service',
		'rules/rules.service',
		'rules/parser.service',
		'rules/labels.service',
		'rules/filters.service',
		'rules/matcher.service',
		'rules/provider.service',
		'rules/references.service',
		'rules/instantiator.service',
		'rules/browse.controller',
		'rules/editor.controller',
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
				.when('/rules/consequences', {templateUrl: 'app/rules/consequences.html'})
				.when('/rules/edit', {templateUrl: 'app/rules/edit.html'})
				.when('/rules/new', {templateUrl: 'app/rules/edit.html'});
			$filterProvider
				.register('formatRule', ['filters', function(filters) {
					return filters.formatRule;
				}]);
			$filterProvider
				.register('linkToRule', ['filters', function(filters) {
					return filters.linkToRule;
				}]);
			$filterProvider
				.register('linkToEntity', ['filters', function(filters) {
					return filters.linkToEntity;
				}]);
			$filterProvider
				.register('labelEntity', ['filters', function(filters) {
					return filters.labelEntity;
				}]);
	}]);

	return {};
});
