//////// Module Definition ////////////
define([
	'app/app', // pulls angular, ngRoute and utilties
	'util/util'
], function() {
///////////////////////////////////////


angular.module('classBrowserApp').factory('Properties', ['$http', '$route', 'util', 'Arguments', function($http, $route, util, Arguments){
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

	Arguments.refreshArgs();
	var status = Arguments.getStatus();
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
	var getUrl = function(id) { return "#/view?id=P" + id; };

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

	var getSortCriteria = function(){
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
			var sortCriteria = getSortCriteria();

			var sortIdArray = function(comparator, category){
				sortedIdArrays[category] = util.cloneObject(idArray);
				sortedIdArrays[category].sort(comparator(properties));
			};

			for (var i=0; i < sortCriteria.length; i++){
				sortIdArray(util.getSortComparator(sortCriteria[i][1], 1), sortCriteria[i][2]);
			}
			updateSorting(sortCriteria);

			return {
				propertiesHeader: [["Label (ID)", "col-xs-5", sortCriteria[0][0], function(status, value){status.sortCriteria.properties.label = value}], 
					["Datatype", "col-xs-1", sortCriteria[1][0], function(status, value){status.sortCriteria.properties.datatype = value}], 
					["Uses in statements", "col-xs-2", sortCriteria[2][0], function(status, value){status.sortCriteria.properties.statements = value}], 
					["Uses in qualifiers", "col-xs-2", sortCriteria[3][0], function(status, value){status.sortCriteria.properties.qualifiers = value}], 
					["Uses in references", "col-xs-2", sortCriteria[4][0], function(status, value){status.sortCriteria.properties.references = value}]],
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
				sortProperties: function() { updateSorting(getSortCriteria()); }
			}
		});
	}
	return promise;
}]);

return {}; // module
});		  // definition end