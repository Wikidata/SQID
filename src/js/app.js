'use strict'; // indicate that code is executed strict


var JSON_LABEL = "l";
var JSON_INSTANCES = "i";
var JSON_SUBCLASSES = "s";
var JSON_RELATED_PROPERTIES = "r";


function httpGet(url) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.setRequestHeader("Accept","text/csv; charset=utf-8");
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

function parseClassesCSV(content) {
  var lines = content.split("\n")
  var result = []
  for (var i = 0; i < lines.length; i++){
    var l = lines[i];
    var data = l.split(',');
    result.push(data);
  }
  return result;
}

function getJsonHeader(){
	return [["ID","Label","Items","Subclasses"]];
}

angular.module('classBrowserApp', ['ngAnimate', 'ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {templateUrl: 'views/start.html'})
      .when('/browse', { templateUrl: 'views/browseData.html' })
      .when('/datatypes', { templateUrl: 'views/datatypes.html' })
      .when('/about', { templateUrl: 'views/about.html' })
      .otherwise({redirectTo: '/'});
    /*
      .when('/', { templateUrl: 'articles.html' })
      .when('/about', { templateUrl: 'about.html' })
      .otherwise({ redirectTo: '/'});
      */
  })
  .factory('Classes', function() {
	var classes = JSON.parse(httpGet("data/classes.json"));
    return {
      getClasses: function() {
        return classes;
      },
      getClasses: function(from, to){
		var i = 0;
		var ret = getJsonHeader();
	    for (var entry in classes) {
			i++;
			var obj = classes[entry];
			var subarray = [entry,obj[JSON_LABEL],obj[JSON_INSTANCES],obj[JSON_SUBCLASSES]];
			ret.push(subarray);
			if (i == 10){
				break;
			}
		}
		return ret;
      } 
    };
  })
  .controller('MyController', function($scope, Classes){
    $scope.classesForClasses = Classes; 
  });