
classBrowser.factory('ClassView', function($route, sparql, wikidataapi) {
	var MAX_EXAMPLE_INSTANCES = 20;
	var MAX_DIRECT_SUBCLASSES = 10;
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
		$scope.superClasses = null;

		$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;

		Classes.then(function(classes){
			var numId = $scope.qid.substring(1);

			Properties.then(function(properties){
				$scope.relatedProperties = properties.formatRelatedProperties(classes.getRelatedProperties(numId), ClassView.RELATED_PROPERTIES_THRESHOLD);
			});
			ClassView.getClassData().then(function(data) {
				$scope.classData = wikidataapi.extractEntityData(data, $scope.qid);
				var superClasses = [];
				for (var i in $scope.classData.superclasses) {
					var superNumId = $scope.classData.superclasses[i];
					superClasses.push({label: classes.getLabel(superNumId), url: classes.getUrl(superNumId), icount: classes.getAllInstanceCount(superNumId)});
				}
				$scope.superClasses = superClasses;
			});

			$scope.directInstances = classes.getDirectInstanceCount(numId);
			$scope.directSubclasses = classes.getDirectSubclassCount(numId);
			$scope.allInstances = classes.getAllInstanceCount(numId);
			$scope.allSubclasses = classes.getAllSubclassCount(numId);
			$scope.nonemptySubclasses = classes.getNonemptySubclasses(numId);

			if ($scope.directInstances > 0) {
				ClassView.getInstances().then(function(data) {
					$scope.exampleInstances = sparql.prepareInstanceQueryResult(data, "P31", ClassView.getQid(), ClassView.MAX_EXAMPLE_INSTANCES + 1, null);
				});
			}
			if ($scope.directSubclasses > 0) {
				ClassView.getSubclasses().then(function(data) {
					$scope.exampleSubclasses = sparql.prepareInstanceQueryResult(data, "P279", ClassView.getQid(), ClassView.MAX_DIRECT_SUBCLASSES + 1, classes);
				});
			}
		});
	}
);

