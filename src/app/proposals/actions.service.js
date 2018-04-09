define(['proposals/proposals.module',
		'oauth/oauth.service'
], function() {
	angular.module('proposals').factory('actions',
	['$http', '$location', '$translate', '$log', 'oauth', function($http, $location, $translate, $log, oauth) {
		function approveStatement(context) {
			return approveStatementAndReference(
				stripReferences(context)
			);
		}

		var STATEMENT_KEY_WHITELIST = [
			'mainsnak',
			'type',
			'rank',
			'qualifiers',
			'references'
		];

		function copyWhitelistedKeys(from, whitelist) {
			var to = {};

			angular.forEach(from, function(value, key) {
				if (whitelist.indexOf(key) !== -1) {
					to[key] = value;
				}
			});

			return to;
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
			var stmt = copyWhitelistedKeys(
				context,
				STATEMENT_KEY_WHITELIST
			);

			stmt.type = 'statement';

			return oauth.addStatement(
				context.proposalFor,
				stmt
			);
		}

		function approveStatementAndMaybeReference(context) {
			if (context.references && context.references.length > 1) {
				return approveStatement(context);
			} else {
				return approveStatementAndReference(context);
			}
		}

		function approveReference(context) {
			$log.debug(context);
		}

		function deprecateStatement(context) {
			var stmt = stripReferences(context);
			stmt.rank = 'deprecated';

			return approveStatement(stmt);
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
