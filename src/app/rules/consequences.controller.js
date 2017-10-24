define(['rules/rules.module',
		'rules/ast.service',
		'rules/matcher.service',
		'rules/rules.service',
		'util/util.service',
		'util/sparql.service',
		'util/sqidStatementTable.directive',
		'i18n/i18n.service'
	   ],
function() {
	angular.module('rules').controller('ConsequencesController',
	['$scope', '$translate', '$q', '$routeParams',
	'i18n', 'rules', 'ast', 'matcher', 'sparql', 'util',
	 function($scope, $translate, $q, $routeParams,
			  i18n, rules, ast, matcher, sparql, util) {
		 var rule = JSON.parse($routeParams.rule);

		 $scope.statements = null;
		 $scope.query = matcher.getInstanceCandidatesQuery(rule, [], 42);
		 sparql.getQueryRequest(
			 $scope.query.query
		 ).then(function(results) {
			 console.log(results)
			 return rules.handleSparqlResults($scope.query, results);
		 }).then(
			 rules.injectReferences
		 ).then(function(results) {
			 return i18n.waitForPropertyLabels(util.unionArrays(
					 results.requests.propertyIds,
				 [])).then(function() {
					 return results;
				 });
		 }).then(function(results) {
			 return i18n.waitForTerms(util.unionArrays(
				 results.requests.entityIds,
				 [])).then(function() {
					 return results;
				 });
		 }).then(function(results) {
			 return rules.deduplicateStatements(
				 { statements: {} },
				 results
			 );
		 }).then(function(results) {
			 $scope.statements = {
				 statements: results,
				 waitForPropertyLabels: function() {
					 return $q.resolve(true);
				 },
				 waitForTerms: function() {
					 return $q.resolve(true);
				 }
			 };
		 });

	 }]);

	return {};
});
