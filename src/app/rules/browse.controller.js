define(['rules/rules.module',
		'rules/provider.service'
	   ],
function() {
	angular.module('rules').controller('BrowseController',
	['$scope', '$translate',
	'provider',
	function($scope, $translate, provider) {
		$scope.translation = {};
		$scope.rules = provider
			.getRules()
			.map(function(rule) {
				return angular.extend({}, rule);
			});
	}]);

	return {};
});
