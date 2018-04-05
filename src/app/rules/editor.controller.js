define(['rules/rules.module',
		'i18n/i18n.service',
		'util/wikidataapi.service',
		'util/dataFormatter.service',
		'rules/labels.service',
		'rules/parser.service'
	   ],
function() {
	angular.module('rules').controller('EditorController',
	['$scope', '$route', '$sce', '$translate', '$q',
	'i18n', 'wikidataapi', 'dataFormatter', 'labels', 'parser',
	function($scope, $route, $sce, $translate, $q, i18n, wikidataapi, dataFormatter, labels, parser) {

		$scope.rule = undefined;

		$scope.renderRule = function() {
			var rule = undefined;
			var input = $scope.body + ' -> ' + $scope.head;

			try {
				rule = parser.parse(input);

			} catch(e) {
				// parse error, ignore
			}

			if (angular.isDefined(rule)) {
				// redraw the rule only if parsing succeeds,
				// and fetch all relevant labels before doing so
				return labels.labelPromiseForRule(
					rule
				).then(function() {
					$scope.rule = rule;
				});
			}

			return undefined;
		};
	}]);


	return {};
});
