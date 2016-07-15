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

	/**
	 * Returns the parts of a Wikidata time value as a list [year,month,day,hour,minute,second].
	 * Unspecified components (based on precision) are set to the respective entries in defaults,
	 * where year precisions/defaults are currently ignored. To get the earliest possible date in
	 * a given range, use defaults [0,1,1,0,0,0]. To get null markers for undefined components,
	 * use [0,null,null,null,null,null].
	 */
	var getTimeComponents = function(timeValue, defaults) {
		var dateParts = timeValue.value.time.split(/[-T]/);
		var timeParts = dateParts[3].split(/[:]/);
		var prec = timeValue.value.precision;

		var year;
		if (dateParts[0] == '') {
			dateParts.shift();
			year = -parseInt(dateParts[0]);
		} else {
			year = parseInt(dateParts[0]);
		}
		var month = prec >= 10 ? parseInt(dateParts[1]) : defaults[1];
		var day = prec >= 11 ? parseInt(dateParts[2]) : defaults[2];
		var hour = prec >= 12 ? parseInt(timeParts[0]) : defaults[3];
		var minute = prec >= 13 ? parseInt(timeParts[1]) : defaults[4];
		var second = prec >= 14 ? parseInt(timeParts[2]) : defaults[5]; // this ignores the trailing Z
		return [year,month,day,hour,minute,second];
	}

	/**
	 * Compares two lists of equal length in lexicigraphic order.
	 * The natural "<" comparators of JavaScript are used.
	 */
	var lexicographicComparator = function(aList,bList) {
		for (var i = 0; i < aList.length; i++) {
			if (aList[i] < bList[i]) {
				return 1;
			} else if (aList[i] > bList[i]) {
				return -1;
			}
		}
		return 0;
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

	// FIXME This is a rather weird function, which overwrites its
	// parameters and introduces unused local variables x and y instead.
	// It also lacks documentation.
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
		getTimeComponents: getTimeComponents,
		lexicographicComparator: lexicographicComparator,
		cloneObject: cloneObject,
		unionArrays: unionArrays,
		sortByField: sortByField,
		createIdArray: createIdArray,
		getSortComparator: getSortComparator,
		reverseDeepCopy: reverseDeepCopy
	};

}]);

return {}; }); // module definition end