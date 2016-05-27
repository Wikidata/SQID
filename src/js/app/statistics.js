//////// Module Definition ////////////
define([
	'app/app', // pulls angular, ngroute and utilties
], function() {
///////////////////////////////////////

angular.module('classBrowserApp').factory('statistics', ['$http', '$route', function($http, $route){
	var promise;
	var statistics; 

	if (!promise){
		promise = $http.get("data/statistics.json").then(function(response){
			statistics = response.data;
			return {
				getDumpDateStamp: function(){ return statistics['dumpDate']; },
				getDumpDateString: function(){
					var dateStamp = statistics['dumpDate'];
					return dateStamp.substring(0,4) + '-' + dateStamp.substring(4,6) + '-' + dateStamp.substring(6,8);
				},
				getDumpDate:  function(){
					var dateStamp = statistics['dumpDate'];
					var month = parseInt(dateStamp.substring(4,6)) - 1;
					return new Date(dateStamp.substring(0,4), month, dateStamp.substring(6,8));
				},
				getPropertyUpdateTime: function() {
					return new Date(statistics['propertyUpdate']);
				},
				getClassUpdateTime: function() {
					return new Date(statistics['classUpdate']);
				},
				getEntityCount: function() {
					return statistics['entityCount'];
				},
				getSiteLinkCount: function() {
					return statistics['siteLinkCount'];
				},
				getItemStatistics: function() {
					return statistics['itemStatistics'];
				},
				getPropertyStatistics: function() {
					return statistics['propertyStatistics'];
				},
				getSites: function() {
					return statistics['sites'];
				},
			}
		});
	}
	return promise;
}]).controller('StatController',

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

return {}; // module
});		  // definition end