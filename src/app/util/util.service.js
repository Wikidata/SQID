//////// Module Definition ////////////
define([
	'util/util.module'
], function() {
///////////////////////////////////////


angular.module('util').factory('util', ['$http', '$q', function($http, $q) {

	var httpRequest = function(url) {
		return $http.get(url).then(function(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				// invalid response
				return $q.reject(response.data);
			}
		},
		function(response) {
			// something went wrong
			return $q.reject(response.data);
		});
	}

	var jsonpRequest = function(url) {
		return $http.jsonp(url).then(function(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				// invalid response
				return $q.reject(response.data);
			}
		},
		function(response) {
			// something went wrong
			return $q.reject(response.data);
		});
	}
	
	var getIdFromUri = function(uri) {
		if ( uri.substring(0, "http://www.wikidata.org/entity/".length) === "http://www.wikidata.org/entity/" ) {
			return uri.substring("http://www.wikidata.org/entity/".length, uri.length);
		} else {
			return null;
		}
	}

	var cloneObject = function(obj) {
	    if (obj === null || typeof obj !== 'object') {
	        return obj;
	    }
	 
	    var temp = obj.constructor(); // give temp the original obj's constructor
	    for (var key in obj) {
	        temp[key] = cloneObject(obj[key]);
	    }
	 
	    return temp;
	};

	var unionArrays = function(a1, a2){
		var unique = [];
		$.each(a1.concat(a2), function(i, el){
    		if($.inArray(el, unique) === -1){
				unique.push(el);
			}
		});
		return unique;
	};

	var sortByField = function(objectList, fieldName) {
		objectList.sort(function(a, b) {
			return a[fieldName] < b[fieldName] ? 1 : (a[fieldName] > b[fieldName] ? -1 : 0);
		});
	}

	var createIdArray = function(json){
		var ret = []
		for (var entry in json) {
			ret.push(entry);
		}
		return ret;
	}

	var getSortComparator = function(criteria, direction){
      return function(data){
        return function(a, b){
          var x = a;
          var y = b;
          var a = data[a][criteria];
          var b = data[b][criteria];
          if (a == b){          	
          	return 0;
          }
          if ((b == undefined) || (a > b)){
            return 1 * direction;
          }
          if ((a == undefined) || (a < b)){
            return (-1) * direction;
          }
          return 0;
        };
      }
    }

    var reverseDeepCopy = function(array){
    	var newarray = [];
		var j=0;
		for (var i=array.length-1; i >= 0; i--){
			newarray[j] = array[i];
			j++;
		}
		return newarray;
    }

	return {
		httpRequest: httpRequest,
		jsonpRequest: jsonpRequest,
		getIdFromUri: getIdFromUri,
		cloneObject: cloneObject,
		unionArrays: unionArrays,
		sortByField: sortByField,
		createIdArray: createIdArray,
		getSortComparator: getSortComparator,
		reverseDeepCopy: reverseDeepCopy
	};

}]);

return {}; }); // module definition end