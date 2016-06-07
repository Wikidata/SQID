//////// Module Definition ////////////
define([
	'data/data.module',
	'util/util'
], function() {
///////////////////////////////////////


angular.module('data').factory('properties', ['$http', '$route', 'util', function($http, $route, util){
	var promise;
	var properties;
	var idArray;

	var sortedIdArrays = {
		label: [],
		datatype: [],
		statements: [],
		references: []
	};
	var sorting = {
		category: "statements",
		direction: -1
	};

	var getData = function(id, key, defaultValue) {
		try {
			var result = properties[id][key];
			if (typeof result !== 'undefined' && result !== null) {
				return result;
			}
		} catch(e){
			// fall through
		}
		return defaultValue;
	}

	var getLabel = function(id) { return getData(id, 'l', null); };
	var getLabelOrId = function(id) { return getData(id, 'l', 'P' + id); };
	var getUrl = function(id, lang) { if(lang === undefined) { lang = null; }
		var str = "#/view?id=P" + id;
		if (lang != null){
			str += '&lang=' + lang;
		}
		return str;
	};

	var getQualifiers = function(id){ return getData(id, 'qs', {}); };

	var getStatementCount = function(id){ return getData(id, 's', 0); };

	var getSortedIdArray = function(){
		var array = sortedIdArrays[sorting.category];
		if (sorting.direction == 1){
			return array;
		}else{
			return util.reverseDeepCopy(array);
		}
	}

	var getSortCriteria = function(status){
		return [[status.sortCriteria.properties.label, "l", "label"], 
			[status.sortCriteria.properties.datatype, "d", "datatype"], 
			[status.sortCriteria.properties.statements, "s", "statements"], 
			[status.sortCriteria.properties.qualifiers, "q", "qualifiers"],
			[status.sortCriteria.properties.references, "e", "references"]];
	}

	var updateSorting = function(sortCriteria){
		for (var i=0; i < sortCriteria.length; i++){
			if (sortCriteria[i][0] != "fa fa-sort"){
				sorting.category = sortCriteria[i][2];
				sorting.direction = sortCriteria[i][0] == "fa fa-sort-asc" ? 1 : -1;
			}
		}
	}


	if (!promise) {
		promise = $http.get("data/properties.json").then(function(response){
			properties = response.data;
			idArray = util.createIdArray(properties);

			var sortIdArray = function(comparator, category){
				sortedIdArrays[category] = util.cloneObject(idArray);
				sortedIdArrays[category].sort(comparator(properties));
			};

			var getPropertiesHeader = function(status){
				var sortCriteria = getSortCriteria(status);

				for (var i=0; i < sortCriteria.length; i++){
					sortIdArray(util.getSortComparator(sortCriteria[i][1], 1), sortCriteria[i][2]);
				}
				updateSorting(sortCriteria);

				return [["TABLE_HEADER.LABEL", "col-xs-5", sortCriteria[0][0], function(status, value){status.sortCriteria.properties.label = value}], 
					["TABLE_HEADER.DATATYPE", "col-xs-1", sortCriteria[1][0], function(status, value){status.sortCriteria.properties.datatype = value}], 
					["TABLE_HEADER.USES_IN_STMTS", "col-xs-2", sortCriteria[2][0], function(status, value){status.sortCriteria.properties.statements = value}], 
					["TABLE_HEADER.USES_IN_QUALS", "col-xs-2", sortCriteria[3][0], function(status, value){status.sortCriteria.properties.qualifiers = value}], 
					["TABLE_HEADER.USES_IN_REFS", "col-xs-2", sortCriteria[4][0], function(status, value){status.sortCriteria.properties.references = value}]];
			}

			return {
				getPropertiesHeader: getPropertiesHeader,
				getProperties: function(){ return properties; },
				getIdArray: getSortedIdArray,
				hasEntity: function(id){ return (id in properties); },
				getLabel: getLabel,
				getLabelOrId: getLabelOrId,
				getItemCount: function(id){ return getData(id, 'i', 0); },
				getDatatype: function(id){ return getData(id, 'd', null); },
				getStatementCount: getStatementCount,
				getQualifierCount: function(id){ return getData(id, 'q', 0); },
				getReferenceCount: function(id){ return getData(id, 'e', 0); },
				getRelatedProperties: function(id){ return getData(id, 'r', {}); },
				getQualifiers: getQualifiers,
				getMainUsageCount: getStatementCount,
				getUrl: getUrl,
				getUrlPattern: function(id){ return getData(id, 'u', null); },
				getClasses: function(id){ return getData(id, 'pc', []); },
				sortProperties: function(status) { updateSorting(getSortCriteria(status)); }
			}
		});
	}
	return promise;
}]);

return {}; // module
});		  // definition end