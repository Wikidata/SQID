//////// Module Definition ////////////
define([
	'data/data.module',
	'util/util.service'
], function() {
///////////////////////////////////////


angular.module('data').factory('classes', ['$http', '$route', 'util', function($http, $route, util) {
	var promise;
	var classes;
	var idArray = null;

	var sortedIdArrays = {
		label: [],
		instances: [],
		subclasses: []
	};
	var sorting = {
		category: "instances",
		direction: -1
	};

	var sortCriteria = [[null, "l", "label"],
						[null, "i", "instances"],
						[null, "s", "subclasses"]
					   ];

	var sortComparators;

	var getData = function(id, key, defaultValue) {
		try {
			var result = classes[id][key];
			if (typeof result !== 'undefined' && result !== null) {
				return result;
			}
		} catch(e){
			// fall through
		}
		return defaultValue;
	};

	var getLabel = function(id){ return getData(id, 'l', null); };
	var getUrl = function(id, lang) { if(lang === undefined) { lang = null; }
		var str = "#/view?id=Q" + id;
		if (lang != null){
			str += '&lang=' + lang;
		}
		return str;
	};
	var getAllInstanceCount = function(id){ return getData(id, 'ai', 0); };

	function getSortedIdArray() {
		// sort on first use
		if (idArray === null) {
			idArray = Object.keys(classes);
		}

		if (sortedIdArrays[sorting.category].length === 0) {
			sortedIdArrays[sorting.category] = angular.copy(idArray);
			sortedIdArrays[sorting.category].sort(sortComparators[sorting.category]);
		}

		var array = sortedIdArrays[sorting.category];



		return (sorting.direction === ((sorting.category === 'label')
									   ? 1
									   : -1)
				? array
				: util.reverseDeepCopy(array));
	}

	var getSortCriteria = function(status){
		sortCriteria[0][0] = status.sortCriteria.classes.label;
		sortCriteria[1][0] = status.sortCriteria.classes.instances;
		sortCriteria[2][0] = status.sortCriteria.classes.subclasses;
		return sortCriteria;
	}

	var updateSorting = function(sortCriteria){
		for (var i=0; i < sortCriteria.length; i++){
			if (sortCriteria[i][0] != "fa fa-sort"){
				sorting.category = sortCriteria[i][2];
				sorting.direction = sortCriteria[i][0] == "fa fa-sort-asc" ? 1 : -1;
			}
		}
	}

	if (!promise){
		promise = $http.get("data/classes.json").then(function(response){
			classes = response.data;
			sortComparators = {
				label: util.getSortComparator(classes, 'l', 1),
				instances: util.getSortComparator(classes, 'i', -1),
				subclasses: util.getSortComparator(classes, 's', -1)
			};

			var getClassesHeader = function(status){
				sortCriteria = getSortCriteria(status);
				updateSorting(sortCriteria);

				return [["TABLE_HEADER.LABEL", "col-xs-9", sortCriteria[0][0], function(status, value){status.sortCriteria.classes.label = value}],
					["TABLE_HEADER.INSTATNCES", "col-xs-1", sortCriteria[1][0], function(status, value){status.sortCriteria.classes.instances = value}],
					["TABLE_HEADER.SUBCLASSES", "col-xs-1", sortCriteria[2][0], function(status, value){status.sortCriteria.classes.subclasses = value}]];
			};

			return {
				getClassesHeader: getClassesHeader,
				getClasses: function(){ return classes; },
				getIdArray: getSortedIdArray,
				hasEntity: function(id){ return (id in classes); },
				getLabel: getLabel,
				getLabelOrId: function(id){ return getData(id, 'l', 'Q' + id); },
				getDirectInstanceCount: function(id){ return getData(id, 'i', 0); },
				getDirectSubclassCount: function(id){ return getData(id, 's', 0); },
				getAllInstanceCount: getAllInstanceCount,
				getAllSubclassCount: function(id){ return getData(id, 'as', 0); },
				getRelatedProperties: function(id){ return getData(id, 'r', {}); },
				getSuperClasses: function(id){ return getData(id, 'sc', []); },
				getMainUsageCount: getAllInstanceCount,
				getUrl: getUrl,
				getNonemptySubclasses: function(id){ return getData(id, 'sb', []); },
				sortClasses: function(status){ updateSorting(getSortCriteria(status)); }
			}
		});
	}
	return promise;
}]);

return {}; // module
});		  // definition end
