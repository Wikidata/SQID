//////// Module Definition ////////////
define([
	'angular',
	'spin'
], function() {
///////////////////////////////////////


angular.module('utilities', [])
.factory('spinner', function() {
	var opts = {
		lines: 15, // The number of lines to draw
		length: 13, // The length of each line
		width: 5, // The line thickness
		radius: 2, // The radius of the inner circle
		scale: 1.25, // Scales overall size of the spinner
		corners: 1, // Corner roundness (0..1)
		color: ['#006698', '#339966', '#900', '#339966'], //'#000', // #rgb or #rrggbb or array of colors
		opacity: 0.1, // Opacity of the lines
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		speed: 1, // Rounds per second
		trail: 56, // Afterglow percentage
		fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		className: 'spinner', // The CSS class to assign to the spinner
		top: '50%', // Top position relative to parent
		left: '50%', // Left position relative to parent
		shadow: true, // Whether to render a shadow
		hwaccel: true, // Whether to use hardware acceleration
		position: 'absolute' // Element positioning
	}
	return function(target) {
		var Spinner = require('spin');
		return new Spinner(opts).spin(target);
	};
})



.factory('htmlCache', ['$sce', function($sce) {
	var trustedHtmlSnippets = [];

	return {
		reset : function() { trustedHtmlSnippets = []; },
		getKey : function(html) {
			trustedHtmlSnippets.push($sce.trustAsHtml(html));
			return trustedHtmlSnippets.length-1;
		},
		getValue : function(key) {
			if (key < trustedHtmlSnippets.length) {
				return trustedHtmlSnippets[key];
			} else {
				return $sce.trustAsHtml('<span style="color: red;">HTML key ' + index + ' not found!</span>');
			}
		}
	};
}])

.factory('util', ['$http', '$q', function($http, $q) {

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

return {}; // module
});		  // definition end