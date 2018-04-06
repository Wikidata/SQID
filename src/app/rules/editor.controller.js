define(['rules/rules.module',
		'i18n/i18n.service',
		'util/wikidataapi.service',
		'util/dataFormatter.service',
		'rules/labels.service',
		'rules/parser.service'
	   ],
function() {
	angular.module('rules').controller('EditorController',
	['$scope', '$route', '$sce', '$translate', '$q', '$location',
	'i18n', 'wikidataapi', 'dataFormatter', 'labels', 'parser',
	function($scope, $route, $sce, $translate, $q, $location, i18n, wikidataapi, dataFormatter, labels, parser) {

		$scope.body = '';
		$scope.head = '';
		$scope.rule = undefined;
		$scope.error = undefined;

		var wantNewRule = ($location.path().endsWith === '/new');
		$scope.$parent.addOrEdit = (wantNewRule
									? 'add'
									: 'edit');

		$scope.renderRule = function() {
			var rule = undefined;
			var input = $scope.body + ' -> ' + $scope.head;

			try {
				rule = parser.parse(input, false);
			} catch(err) {
				// parse error, build an error message
				$scope.error = err;
			}

			if (angular.isUndefined(rule)) {
				// no new rule, so we're done here
				return $q.resolve();
			}

			// got a rule, so clear the error message
			$scope.error = undefined;

			// fetch all the relevant labels, then redraw the rule
			return labels.labelPromiseForRule(
					rule
			).then(function() {
				$scope.rule = rule;
			});
		};
	}]);


	return {};
});
