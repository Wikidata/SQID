//////// Module Definition ////////////
define([
	'i18n/i18n.module',
	'i18n/translate.config',
	'util/wikidataapi.service',
	'data/properties.service',
], function() {
///////////////////////////////////////


angular.module('i18n').factory('i18n', ['wikidataapi', 'properties', '$translate', function(wikidataapi, Properties, $translate) {


	var language = null; // defaults to "en" in this case

	var idTerms = {}; // cache for labels/descriptions of items
	var idTermsSize = 0; // current size of cache

	var propertyLabels = {}; // cache for labels of properties; may be unused for 'en'
	var properties = null; // properties data object (used for language en instead of fetching labels)

	var clearCache = function() {
		idTerms = {};
		idTermsSize = 0;
	}

	var getLanguage = function() {
		return language || $translate.use();
	}

	// Check if an explicit lanuage was set.
	// If not, rather omit the parameter entirely.
	var fixedLanguage = function() {
		return (language != null);
	} 

	var setLanguage = function(newLang) {
		if (getLanguage() != newLang) {
			clearCache(); // clear term cache that was based on old language
			propertyLabels = {}; // clear property label cache for old language
		}
		language = newLang;
		$translate.use(getLanguage());
	}

	// Clear term cache when it grows too big to prevent memory leak.
	// This should only be called at the beginning of a new page display to ensure that
	// we don't delete cache entries that some callers require.
	var checkCacheSize = function() {
		if (idTermsSize > 5000) {
			// 5000 is a lot; only the hugest of items may reach that (which is no problem either)
			clearCache();
		}
	}

	var hasEntityTerms =  function(entityId) {
		return (entityId in idTerms);
	}

	var getEntityTerms = function(entityId) {
		if (hasEntityTerms(entityId)) {
			return idTerms[entityId];
		} else {
			return { label: entityId, description: ''};
		}
	}

	var hasPropertyLabel = function(propertyId) {
		if (getLanguage() == 'en') {
			return properties !== null;
		} else {
			return (propertyId in propertyLabels);
		}
	}

	var getPropertyLabel = function(propertyId) {
		if (hasPropertyLabel(propertyId)) { // implies (properties !== null)
			if (getLanguage() == 'en') {
				var numId = propertyId.substring(1);
				return properties.getLabelOrId(numId);
			} else {
				return propertyLabels[propertyId];
			}
		} else {
			return propertyId;
		}
	}

	var getEntityLabel = function(id) {
		if (id.substring(0,1) == 'Q') {
			return getEntityTerms(id).label;
		} else {
			return getPropertyLabel(id);
		}
	}

	var waitForTerms = function(entities) {
		var missingEntities = [];
		for (var i=0; i < entities.length; i++) {
			if (!hasEntityTerms(entities[i])) {
				missingEntities.push(entities[i]);
			}
		}
		return wikidataapi.getEntityTerms(missingEntities, getLanguage()).then(function(entityTerms) {
			angular.extend(idTerms, entityTerms);
			idTermsSize = Object.keys(idTerms).length;
			return true;
		});
	}

	var waitForPropertyLabels = function(propertyIds) {
		if (getLanguage() == 'en') {
			return Properties.then(function(props) {
				properties = props;
				return true;
			});
		} else {
			var missingPropertyIds = [];
			for (var i=0; i < propertyIds.length; i++) {
				if (!(propertyIds[i] in propertyLabels)) {
					missingPropertyIds.push(propertyIds[i]);
				}
			}
			// Make sure we always have the main properties we use in labels:
			if (!('P31' in propertyLabels)) {
				missingPropertyIds.push('P31');
			}
			if (!('P279' in propertyLabels)) {
				missingPropertyIds.push('P279');
			}
			if (!('P1647' in propertyLabels)) {
				missingPropertyIds.push('P1647');
			}

			return wikidataapi.getEntityLabels(missingPropertyIds, getLanguage()).then(function(entityLabels) {
				angular.extend(propertyLabels, entityLabels);
				return true;
			});
		}
	}

	var getEntityUrl = function(entityId) {
		return "#/view?id=" + entityId + ( fixedLanguage() ? '&lang=' + getLanguage() : '');
	}

	var autoLinkText = function(text) {
		return text.replace(/[QP][1-9][0-9]*/g, function(match) { return '<a href="' + getEntityUrl(match) +'">' + match + '</a>'; });
	}

	var getPropertyLink = function(propertyId) {
		return '<a href="' + getEntityUrl(propertyId) + '">' + getPropertyLabel(propertyId) + '</a>';
	}

	return {
		fixedLanguage: fixedLanguage,
		getLanguage: getLanguage,
		setLanguage: setLanguage,
		getEntityUrl: getEntityUrl,
		autoLinkText: autoLinkText,
		getPropertyLabel: getPropertyLabel,
		getPropertyLink: getPropertyLink,
		checkCacheSize: checkCacheSize,
		getEntityTerms: getEntityTerms,
		hasEntityTerms: hasEntityTerms,
		getEntityLabel: getEntityLabel,
		waitForTerms: waitForTerms,
		waitForPropertyLabels: waitForPropertyLabels
	};
}]);

return {}; }); // module definition end