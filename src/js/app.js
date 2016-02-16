'use strict'; // indicate that code is executed strict

// namespace to avoid huge amount of global variables
var util = {

  JSON_LABEL: "l",
  JSON_INSTANCES: "i",
  JSON_SUBCLASSES: "s",
  JSON_RELATED_PROPERTIES: "r",


  httpGet: function(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    //xmlHttp.setRequestHeader("Accept","text/csv; charset=utf-8");
	xmlHttp.setRequestHeader("Accept","application/sparql-results+json");
    xmlHttp.send( null );
    return xmlHttp.responseText;
  },

  parseClassesCSV: function(content) {
    var lines = content.split("\n")
    var result = []
    for (var i = 0; i < lines.length; i++){
      var l = lines[i];
      var data = l.split(',');
      result.push(data);
    }
    return result;
  },

  getQueryString: function (field) {
    var href = window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
  }

};

angular.module('classBrowserApp', ['ngAnimate', 'ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {templateUrl: 'views/start.html'})
      .when('/browse', { templateUrl: 'views/browseData.html' })
      .when('/datatypes', { templateUrl: 'views/datatypes.html' })
      .when('/about', { templateUrl: 'views/about.html' })
	  .when('/classview', { templateUrl: 'views/classview.html' })
      .otherwise({redirectTo: '/'});
    /*
      .when('/', { templateUrl: 'articles.html' })
      .when('/about', { templateUrl: 'about.html' })
      .otherwise({ redirectTo: '/'});
      */
  })
  .factory('ClassView', function() {
	var qid = "Q5";	
	return {
	  getQid: function(){
		  return qid;
	  }
    };
  })
  .factory('Classes', function() {

	  var classes = JSON.parse(util.httpGet("data/classes.json"));
    var args; 

    var refreshArgs = function(){
      args = {
        from: (util.getQueryString("from")) ? parseInt(util.getQueryString("from")) : 0,
        to: (util.getQueryString("to")) ? parseInt(util.getQueryString("to")) : 10,
        type: (util.getQueryString("type")) ? util.getQueryString("type") : "classes"
      }
    }

    var initArray = function(json){
      var ret = []
      for (var entry in json) {
          var obj = json[entry];
          var subobj = {id: entry, 
              label: obj[util.JSON_LABEL], 
              numberOfInstances: obj[util.JSON_INSTANCES], 
              numberOfSubclasses: obj[util.JSON_SUBCLASSES]
            };
          ret.push(subobj);
        }
      return ret;
    }

    args = refreshArgs();
    var classesArray = initArray(classes);

    return {

      classesHeader: ["ID","Label","Instances","Subclasses"],

      getContent: function(){
        console.log(classesArray.slice(args.from, args.to));
		    return classesArray.slice(args.from, args.to);
      },
      refresh: function(){
        refreshArgs();
      }
    };
  })
  .controller('ClassViewController', function($scope,Classes,ClassView){
	$scope.qid = ClassView.getQid();
	$scope.classData = getClassData($scope.qid);
	$scope.exampleInstances = getExampleInstances($scope.qid);
  })
  .controller('MyController', function($scope, Classes){
    $scope.classesForClasses = Classes; 
    $scope.classesForClasses.refresh();
  });
