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
	'oauth/oauth.service',
	'view/resolver.service',
	'i18n/i18n.service'
], function() {
///////////////////////////////////////

angular.module('view').factory('view', ['$route', '$q', '$sce', 'sparql', 'entitydata', 'i18n', 'util', 'dataFormatter', 'properties', 'htmlCache', 'oauth', 'resolver', 'primarySources', 'rules',
  function($route, $q, $sce, sparql, entitydata, i18n, util, dataFormatter, Properties, htmlCache, oauth, resolver, primarySources, rules) {
	var id;
	var fetchedEntityId = null;
	var fetchedEntityLanguage = null;
	var entityDataPromise = null;
	var entityInDataPromise = null;
	var hasEditRights = false;

	function getValueListData(statementGroup, properties, listener, propertiesOrClasses) {
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

	function updateId() {
		var promise;
		if ($route.current.params.find){
			promise = resolver.getQIdQuick($route.current.params.find);
		}else{
			if (($route.current.params.prop) && ($route.current.params.value)){
				promise = resolver.getQIdFromStatement($route.current.params.prop, $route.current.params.value);
			}else{
				var deferred = $q.defer();
				deferred.resolve( ($route.current.params.id) ? ($route.current.params.id) : "Q5");
				promise = deferred.promise;
			}
		}
		promise.then(function(newId){
			id = newId? newId : "Q0";

			return id;
		});
		return promise;
	}

	function haveValidCachedData() {
		return ((fetchedEntityId === id) &&
				(fetchedEntityLanguage === i18n.getLanguage()));
	}

	function updateCacheMetadata() {
		fetchedEntityId = id;
		fetchedEntityLanguage = i18n.getLanguage();
	}

	// Get a promise for the entity data.
	// It is cached since the controller needs it in several places.
	function getEntityData() {
		if (!haveValidCachedData() || !entityDataPromise) {
			entityDataPromise = entitydata.getEntityData(id);
			updateCacheMetadata();
		}

		return entityDataPromise;
	}

	// cache this as well, since we need it to compute inferred statements
	function getEntityInData() {
		if (!haveValidCachedData() || !entityInDataPromise) {
			entityInDataPromise = entitydata.getInlinkData(id);
			updateCacheMetadata();
		}

		return entityInDataPromise;
	}

	function clearEntityDataCache(){
		entityDataPromise = null;
		entityInDataPromise = null;
		fetchedEntityId = null;
		fetchedEntityLanguage = null;
	}

	return {
		updateId: updateId,

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

		getEntityData: getEntityData,

		clearEntityDataCache: clearEntityDataCache,

		getEntityDataUncached: function(providers) {
			clearEntityDataCache();
			return getEntityData(providers);
		},

		hasEditRights: function(){
			return hasEditRights;
		},

		setEditRights: function(hasRights){
			hasEditRights = hasRights;
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

		// Find best Wikivoyage banner
		getBanner: function(statements) {
			if ("P948" in statements) {
				var imageFileName = entitydata.getBestStatementValue(statements.P948,null);
				return imageFileName.replace(" ","_");
			} else {
				return null;
			}
		},

		// Find best homepage URL
		getHomepage: function(statements) {
			if ("P856" in statements) {
				return entitydata.getBestStatementValue(statements.P856, null);
			} else {
				return null;
			}
		},

		// Find Wikipedia article
		getUrlWikipedia: function(sitelinks) {
			var lang = i18n.getLanguage(true);
			var wikiName = lang + 'wiki';
			if (lang != null && wikiName in sitelinks) {
				return	'https://' + lang + '.wikipedia.org/wiki/' + sitelinks[wikiName].replace(" ","_");
			} else {
				return null;
			}
		},

		getEntityInlinks: getEntityInData,

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
