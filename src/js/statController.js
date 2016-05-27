angular.module('classBrowserApp').controller('StatController',
	 ['$scope', 'statistics', function($scope, statistics){
		statistics.then(function(stats) {
			$scope.dumpDate = stats.getDumpDate().toLocaleDateString();
			$scope.propDate = stats.getPropertyUpdateTime().toLocaleString();
			$scope.classDate = stats.getClassUpdateTime().toLocaleString();

			$scope.entityCount = stats.getEntityCount();
			$scope.siteLinkCount = stats.getSiteLinkCount();

			$scope.itemStatistics = stats.getItemStatistics();
			$scope.propertyStatistics = stats.getPropertyStatistics();
		});
	}
]);