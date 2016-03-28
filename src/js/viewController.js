
classBrowser.factory('View', function($route, sparql, entitydata, i18n, util) {
	var id;
	var fetchedEntityId = null;
	var fetchedEntityLanguage = null;
	var entityDataPromise = null;
	return {
		updateId: function() {
			id = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		},

		updateLang: function() {
			var lang = ($route.current.params.lang) ? ($route.current.params.lang) : "en";
			i18n.setLanguage(lang);
		},

		getId: function(){
			return id;
		},

		getSchemaEntityInfo: function(numIds, data) {
			var ret = [];
			angular.forEach(numIds, function(numId) {
				ret.push({label: data.getLabelOrId(numId), url: data.getUrl(numId), icount: data.getMainUsageCount(numId)});
			});
			return ret;
		},

		getEntityData: function() {
			if (fetchedEntityId != id || fetchedEntityLanguage != i18n.getLanguage()) {
				entityDataPromise = entitydata.getEntityData(id).then(function(data) {
					return data;
				});
				fetchedEntityId = id;
				fetchedEntityLanguage = i18n.getLanguage();
			}
			return entityDataPromise;
		},

		/**
		 * Formats a map numericPropertyId => someNumericValue as a list of
		 * objects with label, url, and "count" (value) keys, sorted by value,
		 * and cut off at the threshold, if non-null.
		 */
		formatPropertyMap: function(propertyMap, threshold) {
			var propertyIds = [];
			angular.forEach(propertyMap, function(value, numPropId) {
				propertyIds.push('P' + numPropId);
			});
			return i18n.waitForPropertyLabels(propertyIds).then( function() {
				var ret = [];
				var resultCount = 0;
				angular.forEach(propertyMap, function(value, numPropId) {
					var propId = 'P' + numPropId;
					ret.push({ label: i18n.getPropertyLabel(propId), url: i18n.getEntityUrl(propId), count: value } );
					if (threshold !== null && value > threshold) {
						resultCount++;
					}
				});
				util.sortByCount(ret);

				if (threshold !== null) {
					return ret.slice(0, resultCount);
				} else {
					return ret;
				}
			});
		}
	};
})
.controller('ViewController',
	function($scope, $route, $sce, View, Classes, Properties, sparql, util, i18n){
		var MAX_EXAMPLE_INSTANCES = 20;
		var MAX_DIRECT_SUBCLASSES = 10;
		var MAX_PROP_SUBJECTS = 10;
		var MAX_PROP_VALUES = 20;
		var RELATED_PROPERTIES_THRESHOLD = 5;

		i18n.checkCacheSize();

		View.updateId();
		View.updateLang();
		$scope.id = View.getId();
		$scope.isItem = ( $scope.id.substring(0,1) != 'P' );

		$scope.classes = null;
		$scope.properties = null;
		$scope.entityData = null;
		$scope.richDescription = null;

		$scope.exampleInstances = null;
		$scope.exampleSubclasses = null;
		$scope.superClasses = null;
		$scope.instanceClasses = null;
		
		$scope.examplePropertyItems = null;
		$scope.examplePropertyValues = null;
		$scope.superProperties = null;

		$scope.directInstances = 0;
		$scope.directSubclasses = 0;
		$scope.allInstances = 0;
		$scope.allSubclasses = 0;
		$scope.nonemptySubclasses = 0;
		$scope.propertyStatementCount = 0;
		$scope.propertyAverageStatements = 0;
		$scope.propertyQualifierCount = 0;
		$scope.propertyReferenceCount = 0;
		$scope.propertyDatatype = null;

		View.getEntityData().then(function(data) {
			$scope.entityData = data;
			$scope.richDescription = $sce.trustAsHtml(i18n.autoLinkText($scope.entityData.description));
		});

		Properties.then(function(properties){
			$scope.instanceOfUrl = properties.getUrl("31");
			$scope.subclassOfUrl = properties.getUrl("279");
			$scope.subpropertyOfUrl = properties.getUrl("1647");
			if (!$scope.isItem) {
				View.getEntityData().then(function(data) {
					$scope.superProperties = View.getSchemaEntityInfo(data.superProperties, properties);
				});
				
				var numId = $scope.id.substring(1);

				View.formatPropertyMap(properties.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD).then( function(formattedProperties) {
					$scope.relatedProperties = formattedProperties;
				});

				$scope.propertyItemCount = properties.getItemCount(numId);
				$scope.propertyStatementCount = properties.getStatementCount(numId);
				$scope.propertyAverageStatements = Math.round($scope.propertyStatementCount/$scope.propertyItemCount*100)/100;
				$scope.propertyQualifierCount = properties.getQualifierCount(numId);
				$scope.propertyReferenceCount = properties.getReferenceCount(numId);
				$scope.propertyDatatype = properties.getDatatype(numId);

				View.formatPropertyMap(properties.getQualifiers(numId), null).then( function(formattedProperties) {
					$scope.propertyQualifiers = formattedProperties;
				});

				if ($scope.propertyItemCount > 0) {
					sparql.getPropertySubjects($scope.id, null, MAX_PROP_SUBJECTS + 1).then(function(result) {
						$scope.examplePropertyItems = result;
					});
				}
				if ($scope.propertyDatatype == 'WikibaseItem' || $scope.propertyDatatype == 'WikibaseProperty') {
					sparql.getPropertyObjects(null, $scope.id, MAX_PROP_VALUES + 1).then(function(result) {
						$scope.examplePropertyValues = result;
					});
				}
			}
		});

		$scope.url = "http://www.wikidata.org/entity/" + $scope.id;

		Classes.then(function(classes){
			View.getEntityData().then(function(data) {
				if ($scope.isItem) {
					$scope.superClasses = View.getSchemaEntityInfo(data.superclasses, classes);
				}
				$scope.instanceClasses = View.getSchemaEntityInfo(data.instanceClasses, classes);
			});

			if ($scope.isItem) {
				var numId = $scope.id.substring(1);

				View.formatPropertyMap(classes.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD).then( function(formattedProperties) {
					$scope.relatedProperties = formattedProperties;
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

