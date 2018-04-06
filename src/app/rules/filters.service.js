define(['rules/rules.module',
		'rules/ast.service',
		'i18n/i18n.service'
	   ],
function() {
	angular.module('rules').factory('filters',
	['$sce', 'i18n', 'ast',
	function($sce, i18n, ast) {
		function formatRule(rule) {
			return $sce.trustAsHtml(
				ast.print(rule, {
					prettify: true
				}));
		}

		function linkToRule(rule) {
			return ('#/rules/consequences?rule=' +
					encodeURIComponent(angular.toJson(rule)));
		}

		function linkToEntity(entity) {
			return (((('entity-type' in entity) &&
					  (entity['entity-type'] === 'item'))
					 ? 'Q'
					 : 'P') +
					entity['numeric-id']);
		}

		function labelEntity(entity) {
			return $sce.trustAsHtml(
				i18n.getEntityLabel(entity)
			);
		}

		function formatParseError(err) {
			if (angular.isUndefined(err)) {
				return '';
			}

			return $sce.trustAsHtml(
				err.message
			);
		}

		return {
			formatRule: formatRule,
			linkToRule: linkToRule,
			linkToEntity: linkToEntity,
			labelEntity: labelEntity,
			formatParseError: formatParseError
		};

	 }]);

	return {};
});
