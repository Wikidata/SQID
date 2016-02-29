
classBrowser.factory('ClassView', function($route, util, sparql, wikidataapi) {
	var MAX_EXAMPLE_INSTANCES = 20;
	var MAX_DIRECT_SUBCLASSES = 20;
	var RELATED_PROPERTIES_THRESHOLD = 5;

	var qid;
	return {
		MAX_EXAMPLE_INSTANCES: MAX_EXAMPLE_INSTANCES,
		MAX_DIRECT_SUBCLASSES: MAX_DIRECT_SUBCLASSES,
		RELATED_PROPERTIES_THRESHOLD: RELATED_PROPERTIES_THRESHOLD,

		updateQid: function() {
			qid = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		},

		getInstances: function() {
			return sparql.getPropertySubjects("P31", qid, MAX_EXAMPLE_INSTANCES + 1);
		},

		getSubclasses: function() {
			return sparql.getPropertySubjects("P279", qid, MAX_DIRECT_SUBCLASSES + 1);
		},

		getClassData: function() {
			return wikidataapi.fetchEntityData(qid);
		},

		getQid: function(){
			return qid;
		}
	};
})
.controller('ClassViewController',
	function($scope, $route, ClassView, Classes, Properties, sparql, wikidataapi){
		ClassView.updateQid();
		$scope.qid = ClassView.getQid();
		$scope.exampleInstances = null;
		$scope.exampleSubclasses = null;
		$scope.classData = null;

		ClassView.getClassData().then(function(data) {
			$scope.classData = wikidataapi.extractEntityData(data, $scope.qid);
		});

		$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;

		Classes.then(function(classes){
			Properties.then(function(properties){
				$scope.relatedProperties = properties.formatRelatedProperties(classes.getRelatedProperties($scope.qid), ClassView.RELATED_PROPERTIES_THRESHOLD);
			});
			ClassView.getSubclasses().then(function(data) {
				$scope.exampleSubclasses = sparql.prepareInstanceQueryResult(data, "P279", ClassView.getQid(), ClassView.MAX_DIRECT_SUBCLASSES + 1, classes);
			});
			$scope.directInstances = classes.getDirectInstanceCount($scope.qid);
			$scope.directSubclasses = classes.getDirectSubclassCount($scope.qid);
			$scope.allInstances = classes.getAllInstanceCount($scope.qid);
			$scope.allSubclasses = classes.getAllSubclassCount($scope.qid);

			if ($scope.directInstances > 0) {
				ClassView.getInstances().then(function(data) {
					$scope.exampleInstances = sparql.prepareInstanceQueryResult(data, "P31", ClassView.getQid(), ClassView.MAX_EXAMPLE_INSTANCES + 1, null);
				});
			}
		});
	}
);

