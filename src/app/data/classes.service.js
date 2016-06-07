//////// Module Definition ////////////
define([
	'data/data.module',
	'util/util'
], function() {
///////////////////////////////////////


angular.module('data').factory('classes', ['$http', '$route', 'util', function($http, $route, util) {
	var promise;
	var classes;
	var idArray;

	var sortedIdArrays = {
		label: [],
		instances: [],
		subclasses: []
	};
	var sorting = {
		category: "instances",
		direction: -1
	};

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

	var getSortedIdArray = function(){
		var array = sortedIdArrays[sorting.category];
		if (sorting.direction == 1){
			return array;
		}else{
			return util.reverseDeepCopy(array);
		}
	}

	var getSortCriteria = function(status){
		return [[status.sortCriteria.classes.label, "l", "label"], 
			[status.sortCriteria.classes.instances, "i", "instances"], 
			[status.sortCriteria.classes.subclasses, "s", "subclasses"]];
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
			idArray = util.createIdArray(classes);

			var sortIdArray = function(comparator, category){
				sortedIdArrays[category] = util.cloneObject(idArray);
				sortedIdArrays[category].sort(comparator(classes));
			};

			var getClassesHeader = function(status){
				var sortCriteria = getSortCriteria(status);

				for (var i=0; i < sortCriteria.length; i++){
						sortIdArray(util.getSortComparator(sortCriteria[i][1], 1), sortCriteria[i][2]);
					}
				updateSorting(sortCriteria);

				return [["TABLE_HEADER.LABEL", "col-xs-9", sortCriteria[0][0], function(status, value){status.sortCriteria.classes.label = value}],
					["TABLE_HEADER.INSTATNCES", "col-xs-1", sortCriteria[1][0], function(status, value){status.sortCriteria.classes.instances = value}], 
					["TABLE_HEADER.SUBCLASSES", "col-xs-1", sortCriteria[2][0], function(status, value){status.sortCriteria.classes.subclasses = value}]];
			}
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