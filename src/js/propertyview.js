classBrowser.controller('PropertyViewController', function($scope, ClassView){
	$scope.pid = ClassView.getQid();
	ClassView.refresh().then(function(data){
		$scope.propertyData = data.getClassData();
		console.log($scope.classData);
	});
  	$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;
});