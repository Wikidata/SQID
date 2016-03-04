(function() {
	//classBrowser.controller('QueryController', function($scope, Arguments, Classes, Properties, jsonData) {
	qry = angular.module('queryInterface', ['angucomplete-alt']);

	qry.controller('QueryController', ['$scope','Classes', function($scope, Classes) {

		$scope.selected = false;
		$scope.classes = [];

		// dumb label search for auto suggestions (case insensitive) 
		$scope.labelSearch = function(str) {
			var i = $scope.classes.length, matches = [], l;
			str = str.toString().toLowerCase();
			while(i--) {
				l = $scope.classData[$scope.classes[i]].l;
				if (l !== undefined && l !== null && l.toLowerCase().indexOf(str) > -1) {
					matches.push($scope.classData[$scope.classes[i]]);
					matches[matches.length-1].d = "Q" + $scope.classes[i];
				}
			}
			matches.sort(function(a,b){
				return (a.ai > b.ai) ? -1 : ( (a.ai = b.ai) ? 0 : 1);
			});
			return matches.slice(0,9);
		};
		Classes.then(function(data){
			console.log('classes loaded');
			$scope.classData = data.getClasses();
			for(var p in $scope.classData) {
				if($scope.classData.hasOwnProperty(p)) {
					$scope.classes.push(p);
				}
			}
			 
		});
	}]);
})();
