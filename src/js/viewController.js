
classBrowser.factory('View', function($route, $q, $sce, sparql, entitydata, i18n, util, dataFormatter, Properties, Arguments, htmlCache) {
	var id;
	var fetchedEntityId = null;
	var fetchedEntityLanguage = null;
	var entityDataPromise = null;

	var getValueListData = function(statementGroup, properties, listener, propertiesOrClasses) {
		var ret = [];
		angular.forEach(statementGroup, function(statement) {
			var count = null;
			if (propertiesOrClasses !== null) {
				var mainSnak = statement.mainsnak;
				if (mainSnak.snaktype == 'value' && mainSnak.datavalue.type == 'wikibase-entityid') { 
					count = propertiesOrClasses.getMainUsageCount(mainSnak.datavalue.value["numeric-id"]);
				}
			}
			ret.push({ 
				value : dataFormatter.getStatementMainValueHtml(statement, properties, listener, true),
				qualifiers : dataFormatter.getStatementQualifiersHtml(statement, properties, listener, true),
				count: count
			});
		});
		util.sortByField(ret, 'count');
		return ret;
	}

	return {
		updateId: function() {
			id = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		},

		updateLang: function() {
			Arguments.refreshArgs();
			var lang = Arguments.getStatus().lang;
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

		getValueList: function(data, propertyId, propertiesOrClasses) {
			return Properties.then(function(properties){
				return data.waitForPropertyLabels().then(function() {
					var statementGroup = data.statements[propertyId];
					var listener = { hasMissingTerms : false };
					var ret = getValueListData(statementGroup, properties, listener, propertiesOrClasses);
					if (listener.hasMissingTerms) {
						return data.waitForTerms().then( function() {
							return getValueListData(statementGroup, properties, listener, propertiesOrClasses);
						});
					} else {
						var deferred = $q.defer();
						deferred.resolve(ret);
						return deferred.promise;
					}
				});
			});
		},

		getValueListTrustedHtml: function(valueList, showCounts) {
			var result = '';
			angular.forEach(valueList, function(item, index) {
				if (index>0) {
					result += ', ';
				}
				result += item.value;
				if (item.qualifiers != '') {
					result += ' <span uib-popover-html="getCachedHtml(' + htmlCache.getKey(item.qualifiers) + ')"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></span>';
				}
				if (showCounts && item.count !== null) {
					result += ' <span class="info-badge">' + item.count + '</span>';
				}
			});
			return $sce.trustAsHtml(result);
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
				util.sortByField(ret, 'count');

				if (threshold !== null) {
					return ret.slice(0, resultCount);
				} else {
					return ret;
				}
			});
		},

		formatNonemptySubclasses: function(numId, classes, countFunction) {
			classNumIds = classes.getNonemptySubclasses(numId);
			if (i18n.getLanguage() == 'en') { // get labels from classes data
				var ret = [];
				angular.forEach(classNumIds, function(classNumId) {
					var count = countFunction(classNumId);
					if (count > 0) {
						ret.push({ label: classes.getLabelOrId(classNumId), url: i18n.getEntityUrl('Q' + classNumId), count: count });
					}
				});
				util.sortByField(ret, 'count');
				var deferred = $q.defer();
				deferred.resolve(ret);
				return deferred.promise;
			} else { // fetch labels using i18n
				var classIds = [];
				angular.forEach(classNumIds, function(classNumId) {
					classIds.push('Q' + classNumId);
				});
				return i18n.waitForTerms(classIds).then(function() {
					var ret = [];
					angular.forEach(classNumIds, function(classNumId) {
						var count = countFunction(classNumId);
						if (count > 0) {
							ret.push({ label: i18n.getEntityTerms('Q' + classNumId).label, url: i18n.getEntityUrl('Q' + classNumId), count: count });
						}
					});
					util.sortByField(ret, 'count');
					return ret;
				});
			}
		}

	};
})
.controller('ViewController',
	function($scope, $sce, $translate, View, Classes, Properties, sparql, util, i18n, htmlCache){
		var MAX_EXAMPLE_INSTANCES = 20;
		var MAX_DIRECT_SUBCLASSES = 10;
		var MAX_PROP_SUBJECTS = 10;
		var MAX_PROP_VALUES = 20;
		var RELATED_PROPERTIES_THRESHOLD = 5;

		i18n.checkCacheSize();

		htmlCache.reset();
		$scope.getCachedHtml = htmlCache.getValue;

		View.updateId();
		View.updateLang();
		$scope.id = View.getId();
		var numId = $scope.id.substring(1);
		$scope.isItem = ( $scope.id.substring(0,1) != 'P' );
		
		$scope.translations = {};
		$scope.test=true; // DEBUG

		$translate(['SEC_CLASSIFICATION.INSTANCE_SUBCLASSES_HINT', 'SEC_CLASSIFICATION.SUBCLASS_SUBCLASSES_HINT', 'SEC_CLASSIFICATION.ALL_SUBCLASSES_HINT', 'TYPICAL_PROPS.HINT_CLASS', 'TYPICAL_PROPS.HINT_PROP', 'SEC_PROP_USE.ENTITIES_HINT', 'SEC_PROP_USE.VALUES_HINT', 'SEC_PROP_USE.STATEMENTS_HINT', 'SEC_PROP_USE.QUALIFIERS_HINT']).then( function(translations) {
			$scope.translations['SUBCLASS_SUBCLASSES_HINT'] = translations['SEC_CLASSIFICATION.SUBCLASS_SUBCLASSES_HINT'];
			$scope.translations['INSTANCE_SUBCLASSES_HINT'] = translations['SEC_CLASSIFICATION.INSTANCE_SUBCLASSES_HINT'];
			$scope.translations['ALL_SUBCLASSES_HINT'] = translations['SEC_CLASSIFICATION.ALL_SUBCLASSES_HINT'];
			$scope.translations['TYPICAL_PROPS_HINT_CLASS'] = translations['TYPICAL_PROPS.HINT_CLASS'];
			$scope.translations['TYPICAL_PROPS_HINT_PROP'] = translations['TYPICAL_PROPS.HINT_PROP'];
			$scope.translations['PROP_ENTITIES_HINT'] = translations['SEC_PROP_USE.ENTITIES_HINT'];
			$scope.translations['PROP_VALUES_HINT'] = translations['SEC_PROP_USE.VALUES_HINT'];
			$scope.translations['PROP_STATEMENTS_HINT'] = translations['SEC_PROP_USE.STATEMENTS_HINT'];
			$scope.translations['PROP_QUALIFIERS_HINT'] = translations['SEC_PROP_USE.QUALIFIERS_HINT'];
		});

		$scope.classes = null;
		$scope.properties = null;
		$scope.entityData = null;
		$scope.richDescription = null;

		$scope.exampleInstances = null;
		$scope.exampleSubclasses = null;
		$scope.superClassCount = -1;
		$scope.instanceClassCount = -1;

		$scope.examplePropertyItems = null;
		$scope.examplePropertyValues = null;
		$scope.superPropertyCount = -1;

		$scope.directInstances = 0;
		$scope.directSubclasses = 0;
		$scope.allInstances = 0;
		$scope.allSubclasses = 0;
		$scope.nonemptySubclasses = null;
		$scope.propertyStatementCount = 0;
		$scope.propertyAverageStatements = 0;
		$scope.propertyQualifierCount = 0;
		$scope.propertyReferenceCount = 0;
		$scope.propertyDatatype = null;

		View.getEntityData().then(function(data) {
			$scope.entityData = data;
			$scope.richDescription = $sce.trustAsHtml(i18n.autoLinkText($scope.entityData.description));
			data.waitForPropertyLabels().then( function() {
				$scope.instanceOfUrl = i18n.getEntityUrl("P31");
				$scope.instanceOfLabel = i18n.getPropertyLabel("P31");
				$scope.subclassOfUrl = i18n.getEntityUrl("P279");
				$scope.subclassOfLabel = i18n.getPropertyLabel("P279");
				$scope.subpropertyOfUrl = i18n.getEntityUrl("P1647");
				$scope.subpropertyOfLabel = i18n.getPropertyLabel("P1647");
			});

			Classes.then(function(classes){
				View.getValueList(data, 'P31', classes).then( function(instanceClasses) {
					$scope.instanceClassCount = instanceClasses.length;
					$scope.instanceClassesHtml = View.getValueListTrustedHtml(instanceClasses, false);
				});
				if ($scope.isItem) {
					View.getValueList(data, 'P279', classes).then( function(superClasses) {
						$scope.superClassCount = superClasses.length;
						$scope.superClassesHtml = View.getValueListTrustedHtml(superClasses, false);
						$scope.superClassesHtmlWithCounts = View.getValueListTrustedHtml(superClasses, true);
					});
				}
			});
		});

		Properties.then(function(properties){
			if (!$scope.isItem) {
				View.getEntityData().then(function(data) {
					View.getValueList(data, 'P1647', properties).then( function(superProperties) {
						$scope.superPropertyCount = superProperties.length;
						$scope.superPropertiesHtml = View.getValueListTrustedHtml(superProperties, false);
					});
				});

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

		$scope.url = 'https://www.wikidata.org/wiki/' + 
			( $scope.isItem ? '' : 'Property:' ) +
			$scope.id +
			( i18n.fixedLanguage() ? ('?uselang=' + i18n.getLanguage()) : '' );
		$scope.urlReasonator = 'https://tools.wmflabs.org/reasonator/?q=' + $scope.id +
			( i18n.fixedLanguage() ? ('?lang=' + i18n.getLanguage()) : '' );

		Classes.then(function(classes){
			if ($scope.isItem) {
				View.formatPropertyMap(classes.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD).then( function(formattedProperties) {
					$scope.relatedProperties = formattedProperties;
				});
				$scope.directInstances = classes.getDirectInstanceCount(numId);
				$scope.directSubclasses = classes.getDirectSubclassCount(numId);
				$scope.allInstances = classes.getAllInstanceCount(numId);
				$scope.allSubclasses = classes.getAllSubclassCount(numId);
				$translate('SEC_INSTANCES.ALL_INSTANCES_HINT', { subclassCount : $scope.allSubclasses } ).then( function(result) {
					$scope.translations['ALL_INSTANCES_HINT'] = result;
				});

				View.formatNonemptySubclasses(numId, classes, classes.getAllInstanceCount).then( function(subclasses) {
					$scope.instanceSubclasses = subclasses;
					View.formatNonemptySubclasses(numId, classes, classes.getAllSubclassCount).then( function(subclasses) {
						$scope.subclassSubclasses = subclasses;
						if ($scope.instanceSubclasses.length > 0) {
							$scope.subclassActiveTab = 0;
						} else if ($scope.subclassSubclasses.length > 0) {
							$scope.subclassActiveTab = 1;
						} else {
							$scope.subclassActiveTab = 2;
						}
					});
				});

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

