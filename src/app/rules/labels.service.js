define(['rules/rules.module',
		'i18n/i18n.service',
		'rules/ast.service'
	   ],
function() {
	angular.module('rules').factory('labels',
	['$sce', '$q', 'i18n', 'ast',
	function($sce, $q, i18n, ast) {
		function literalsInRule(rule) {
			return ast.literals(rule).map(function(literal) {
				return literal.name;
			}).filter(function(literal) {
				return /^[PQ][1-9][0-9]*$/.test(literal);
			});
		}

		function labelForLiteral(literal) {
			if (angular.isUndefined(literal)) {
				return $sce.trustAsHtml('(undefined value in labelForLiteral)');
			}

			var label = '';
			if (literal.startsWith('P')) {
				label = i18n.getPropertyLink(literal);
			} else if (literal.startsWith('Q')) {
				var terms = i18n.getEntityTerms(literal);
				label = ('<a href="' + i18n.getEntityUrl(literal) +
						 '">' + terms.label + '</a>');
				if (terms.description !== '') {
					label += (' <span class="smallnote">(' +
							  i18n.autoLinkText(terms.description) +
							  ')</span>');
				}
			}

			return $sce.trustAsHtml(label);
		}

		function labelPromiseForRule(rule, extraLiterals) {
			if (angular.isUndefined(extraLiterals)) {
				extraLiterals = [];
			}

			var literals = literalsInRule(rule).concat(extraLiterals);

			var properties = literals
			.filter(function(literal) {
				return literal.startsWith('P');
			});

			var terms = literals
			.filter(function(literal) {
				return literal.startsWith('Q');
			});

			return $q.all([
				i18n.waitForPropertyLabels(properties),
				i18n.waitForTerms(terms)
			]);
		}

		return {
			literalsInRule: literalsInRule,
			labelForLiteral: labelForLiteral,
			labelPromiseForRule: labelPromiseForRule
		};
	}]);

	return {};
});
