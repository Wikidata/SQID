//////// Module Definition ////////////
define([
	'view/view.module',
	'ngRoute',
	'util/sparql.service',
	'util/entitydata.service',
	'util/util.service',
	'util/dataFormatter.service',
	'util/htmlCache.service',
	'data/properties.service',
	'i18n/i18n.service'
], function() {
///////////////////////////////////////

angular.module('view').factory('view', ['$route', '$q', '$sce', 'sparql', 'entitydata', 'i18n', 'util', 'dataFormatter', 'properties', 'htmlCache',
function($route, $q, $sce, sparql, entitydata, i18n, util, dataFormatter, Properties, htmlCache) {
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
			var lang = ($route.current.params.lang) ? ($route.current.params.lang) : null;
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

		// Get a promise for the entity data.
		// It is cached since the controller needs it in several places.
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

		// Find images from statements
		getImages: function(statements) {
			var ret = [];
			if ("P18" in statements) {
				for (var i in statements.P18) {
					var imageFileName = entitydata.getStatementValue(statements.P18[i],"");
					ret.push(imageFileName.replace(" ","_"));
				}
			}
			return ret;
		},
		
		// Find Wikivoyage banner; only pick the first banner if multiple
		getBanner: function(statements) {
			if ("P948" in statements) {
				var imageFileName = entitydata.getStatementValue(statements.P948[0],null);
				return imageFileName.replace(" ","_");
			} else {
				return null;
			}
		},

		// homepage URL; only pick the first URL if multiple
		getHomepage: function(statements) {
			if ("P856" in statements) {
				return entitydata.getStatementValue(statements.P856[0],null);
			} else {
				return null;
			}
		},

		getEntityInlinks: function() {
			// Not chached. Should only be asked for in one place in the controller (alternatively add caching)
			return entitydata.getInlinkData(id);
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
}]);

return {};}); // module definition end