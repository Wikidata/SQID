define(['proposals/proposals.module',
		'oauth/oauth.service'
], function() {
	angular.module('proposals').factory('actions',
	['$http', '$location', '$translate', '$log', 'oauth', function($http, $location, $translate, $log, oauth) {
		function approveStatement(context) {
			return approveStatementAndReference(stripReferences(context));
		}

		function stripReferences(statement) {
			var stmt = {};
			angular.forEach(statement, function(value, key) {
				if (key != 'references') {
					stmt[key] = value;
				}
			});

			return stmt;
		}

		function approveStatementAndReference(context) {
			var statement = context;
			var stmt = {};

			delete stmt.id;
			delete stmt.source;
			delete stmt.approve;
			delete stmt.reject;
			delete stmt.proposalType;
			delete stmt.actions;

			stmt.type = 'statement';

			return oauth.addStatement(context.qid,
									  JSON.stringify(stmt)
									 );

			approveStatement(context);
			approveReference(group, statement, context);
		}

		function approveStatementAndMaybeReference(context) {
			if (context.references && context.references.length > 1) {
				return approveStatement(context);
			} else {
				return approveStatementAndReference(context);
			}
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
			approveStament: approveStatement,
			approveStatementAndMaybeReference: approveStatementAndMaybeReference,
			approveReference: approveReference,
			deprecateStatement: deprecateStatement,
			doNothing: doNothing
		};
	}]);
});
