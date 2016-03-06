
classBrowser.factory('ClassView', function($route, sparql, wikidataapi) {
	var id;
	var fetchedEntityId = null;
	var entityDataPromise = null;
	return {
		updateId: function() {
			id = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		},

		getId: function(){
			return id;
		},

		getClassInfo: function(classNumIds, classes) {
			var ret = [];
			angular.forEach(classNumIds, function(classNumId) {
				ret.push({label: classes.getLabelOrId(classNumId), url: classes.getUrl(classNumId), icount: classes.getAllInstanceCount(classNumId)});
			});
			return ret;
		},

		getEntityData: function() {
			if (fetchedEntityId != id) {
				entityDataPromise = wikidataapi.getEntityData(id).then(function(data) {
					return data;
				});
				fetchedEntityId = id;
			}
			return entityDataPromise;
		}
	};
})
.controller('ClassViewController',
	function($scope, $route, ClassView, Classes, Properties, sparql, wikidataapi){
		var MAX_EXAMPLE_INSTANCES = 20;
		var MAX_DIRECT_SUBCLASSES = 10;
		var RELATED_PROPERTIES_THRESHOLD = 5;

		ClassView.updateId();
		$scope.id = ClassView.getId();
		$scope.isItem = ( $scope.id.substring(0,1) == 'Q' );

		$scope.classes = null;
		$scope.properties = null;
		$scope.entityData = null;

		$scope.exampleInstances = null;
		$scope.exampleSubclasses = null;
		$scope.superClasses = null;
		$scope.instanceClasses = null;
		
		$scope.examplePropertyItems = null;

		$scope.directInstances = 0;
		$scope.directSubclasses = 0;
		$scope.allInstances = 0;
		$scope.allSubclasses = 0;
		$scope.nonemptySubclasses = 0;
		$scope.propertyStatementCount = 0;
		$scope.propertyQualifierCount = 0;
		$scope.propertyReferenceCount = 0;
		$scope.propertyDatatype = null;

		ClassView.getEntityData().then(function(data) {
			$scope.entityData = data;
		});

		Properties.then(function(properties){
			$scope.instanceOfUrl = properties.getUrl("31");
			$scope.subclassOfUrl = properties.getUrl("279");
			if (!$scope.isItem) {
				var numId = $scope.id.substring(1);

				$scope.relatedProperties = properties.formatRelatedProperties(properties.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD);

				$scope.propertyItemCount = properties.getItemCount(numId);
				$scope.propertyStatementCount = properties.getStatementCount(numId);
				$scope.propertyQualifierCount = properties.getQualifierCount(numId);
				$scope.propertyReferenceCount = properties.getReferenceCount(numId);
				$scope.propertyDatatype = properties.getDatatype(numId);

				if ($scope.propertyItemCount > 0) {
					sparql.getPropertySubjects($scope.id, null, MAX_DIRECT_SUBCLASSES + 1).then(function(result) {
						$scope.examplePropertyItems = result;
					});
				}
			}
		});

		$scope.url = "http://www.wikidata.org/entity/" + $scope.id;

		Classes.then(function(classes){
			ClassView.getEntityData().then(function(data) {
				if ($scope.isItem) {
					$scope.superClasses = ClassView.getClassInfo(data.superclasses, classes);
				}
				$scope.instanceClasses = ClassView.getClassInfo(data.instanceClasses, classes);
			});

			if ($scope.isItem) {
				var numId = $scope.id.substring(1);

				Properties.then(function(properties){
					$scope.relatedProperties = properties.formatRelatedProperties(classes.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD);
				});
				$scope.directInstances = classes.getDirectInstanceCount(numId);
				$scope.directSubclasses = classes.getDirectSubclassCount(numId);
				$scope.allInstances = classes.getAllInstanceCount(numId);
				$scope.allSubclasses = classes.getAllSubclassCount(numId);
				$scope.nonemptySubclasses = classes.getNonemptySubclasses(numId);

				if ($scope.directInstances > 0) {
					sparql.getPropertySubjects("P31", $scope.id, MAX_EXAMPLE_INSTANCES + 1).then(function(result) {
						$scope.exampleInstances = result;
					});
				}
				if ($scope.directSubclasses > 0) {
					sparql.getPropertySubjects("P279", $scope.id, MAX_DIRECT_SUBCLASSES + 1).then(function(result) {
						$scope.exampleSubclasses = result;
					});
				}
			}
		});
	}
);

