define(['proposals/proposals.module'
], function() {
	angular.module('proposals').factory('actions',
	['$http', '$location', '$translate', function($http, $location, $translate) {
		function approveStatement(group, statement, context) {
			// todo: do something
		}

		function approveStatementAndReference(group, statement, context) {
			approveStatement(group, statement, context);
			approveReference(group, statement, context);
		}

		function approveStatementAndMaybeReference(group, statement, context) {
			// todo: do something
		}

		function approveReference(group, statement, context) {
			// todo: do something
		}

		function deprecateStatement(grop, statement, context) {
			// todo: do something
		}

		function doNothing(group, statement, context) {
			return true;
		}

		return {
			approveStament: approveStament,
			approveStatementAndMaybeReference: approveStatementAndMaybeReference,
			approveReference: approveReference,
			deprecateStatement: deprecateStatement,
			doNothing: doNothing
		};
	}]);
});
