'use strict'; // indicate that code is executed strict

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
    var classes = parseClassesCSV(httpGet("data/classes.csv"));
    return {
      getClasses: function() {
        return classes;
      },
      getClasses: function(from, to){
        var subarray = classes.slice(from, to);
        for (var i = 0; i < (to-from); i++){
          for (var j = 0; j < subarray[i].length; j++){
            if (subarray[i][j].length > 20){
              subarray[i][j] = subarray[i][j].substring(0, 20) + " ...";
            }
            subarray[i][j] = subarray[i][j].replace("@", ", ");
            subarray[i][j] = subarray[i][j].replace("\"", "");
          }
        }
        return subarray;
      } 
    };
  })
  .controller('MyController', function($scope, Classes){
    $scope.classesForClasses = Classes; 
  });
