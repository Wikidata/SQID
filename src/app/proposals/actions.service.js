define(['proposals/proposals.module'
], function() {
	angular.module('proposals').factory('actions',
	['$http', '$location', '$translate', function($http, $location, $translate) {
		function approveStatement(context) {
			// todo: do something
		}

		function approveStatementAndReference(group, statement, context) {
			approveStatement(context);
			approveReference(group, statement, context);
		}

		function approveStatementAndMaybeReference(context) {
			// todo: do something
		}

		function approveReference(context) {
			// todo: do something
		}

		function deprecateStatement(context) {
			// todo: do something
		}

		function doNothing(context) {
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
