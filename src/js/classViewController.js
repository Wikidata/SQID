
classBrowser.factory('ClassView', function($route, sparql, wikidataapi) {
	var qid;
	return {
		updateQid: function() {
			qid = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		},

		getQid: function(){
			return qid;
		},

		getClassInfo: function(classNumIds, classes) {
			var ret = [];
			angular.forEach(classNumIds, function(classNumId) {
				ret.push({label: classes.getLabelOrId(classNumId), url: classes.getUrl(classNumId), icount: classes.getAllInstanceCount(classNumId)});
			});
			return ret;
		}
	};
})
.controller('ClassViewController',
	function($scope, $route, ClassView, Classes, Properties, sparql, wikidataapi){
		var MAX_EXAMPLE_INSTANCES = 20;
		var MAX_DIRECT_SUBCLASSES = 10;
		var RELATED_PROPERTIES_THRESHOLD = 5;
	
		ClassView.updateQid();
		$scope.qid = ClassView.getQid();
		$scope.exampleInstances = null;
		$scope.exampleSubclasses = null;
		$scope.classData = null;
		$scope.superClasses = null;
		$scope.instanceClasses = null;
		$scope.classes = null;
		$scope.properties = null;

		$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;

		Classes.then(function(classes){
			var numId = $scope.qid.substring(1);

			Properties.then(function(properties){
				$scope.relatedProperties = properties.formatRelatedProperties(classes.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD);
				$scope.instanceOfUrl = properties.getUrl("31");
				$scope.subclassOfUrl = properties.getUrl("279");
			});
			wikidataapi.getEntityData($scope.qid).then(function(data) {
				$scope.classData = data;
				$scope.superClasses = ClassView.getClassInfo(data.superclasses, classes);
				$scope.instanceClasses = ClassView.getClassInfo(data.instanceClasses, classes);
			});

			$scope.directInstances = classes.getDirectInstanceCount(numId);
			$scope.directSubclasses = classes.getDirectSubclassCount(numId);
			$scope.allInstances = classes.getAllInstanceCount(numId);
			$scope.allSubclasses = classes.getAllSubclassCount(numId);
			$scope.nonemptySubclasses = classes.getNonemptySubclasses(numId);

			if ($scope.directInstances > 0) {
				sparql.getPropertySubjects("P31", $scope.qid, MAX_EXAMPLE_INSTANCES + 1).then(function(result) {
					$scope.exampleInstances = result;
				});
			}
			if ($scope.directSubclasses > 0) {
				sparql.getPropertySubjects("P279", $scope.qid, MAX_DIRECT_SUBCLASSES + 1).then(function(result) {
					$scope.exampleSubclasses = result;
				});
			}
		});
	}
);

