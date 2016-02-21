'use strict'; // indicate that code is executed strict

// namespace to avoid huge amount of global variablesC
var util = {

  JSON_LABEL: "l",
  JSON_INSTANCES: "i",
  JSON_SUBCLASSES: "s",
  JSON_RELATED_PROPERTIES: "r",
  
  JSON_ITEMS_WITH_SUCH_STATEMENTS: "i",
  JSON_USES_IN_STATEMENTS: "s",
  JSON_USES_IN_STATEMENTS_WITH_QUALIFIERS: "w",
  JSON_USES_IN_QUALIFIERS: "q",
  JSON_USES_IN_PROPERTIES: "p",
  JSON_USES_IN_REFERENCES: "e",
  JSON_DATATYPE: "d",
  
  TABLE_SIZE: 15,
  PAGE_SELECTOR_SIZE: 2,
  
  httpGet: function(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    //xmlHttp.setRequestHeader("Accept","text/csv; charset=utf-8");
	xmlHttp.setRequestHeader("Accept","application/sparql-results+json");
    xmlHttp.send( null );
    return xmlHttp.responseText;
  },
  
  parseClassNumbers: function (qid, json){
	var numbers = {instances : "", subclasses: ""};
	try {
		numbers.instances = json[qid][util.JSON_INSTANCES];
		numbers.subclasses = json[qid][util.JSON_SUBCLASSES];
	} catch(e){}
	return numbers;
  },
  
  parseRelatedProperties: function(qid, json){
	var ret = [];
	try {
	  var relProps = json[qid][util.JSON_RELATED_PROPERTIES];
	}
	catch (e){}
	for (var prop in relProps){
	  ret.push(prop);
	}
	return ret;
  }

};

var classBrowser = angular.module('classBrowserApp', ['ngAnimate', 'ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {templateUrl: 'views/start.html'})
      .when('/browse', { templateUrl: 'views/browseData.html' })
      .when('/datatypes', { templateUrl: 'views/datatypes.html' })
      .when('/about', { templateUrl: 'views/about.html' })
	  .when('/classview', { templateUrl: 'views/classview.html' })
      .when('/browseProperties', {templateUrl: 'views/browseData.html'})
      .otherwise({redirectTo: '/'});
  })
  .factory('ClassView', function($http, $route) {
	
	var qid;
	
    return {
		getQid: function(){
		  qid = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		  return qid;
		}
      };
  })
  .factory('Arguments', function($http, $route){
    var args = {}; 
    return {
      refreshArgs: function(){
        args = {
          from: ($route.current.params.from) ? parseInt(($route.current.params.from)) : 0,
          to: ($route.current.params.to) ? parseInt(($route.current.params.to)) : util.TABLE_SIZE,
          type: ($route.current.params.type) ? ($route.current.params.type) : "classes"
        }
      },
      getArgs: function(){
        return args;
      }
    }
  })
  .factory('Properties', function($http, $route){
    var promise;
    var properties;
    
    if (!promise) {
        promise = $http.get("data/properties.json").then(function(response){
          properties = response.data;
        return {
          propertiesHeader: [["ID", "col-xs-2"], ["Label", "col-xs-4"], ["Uses in statements", "col-xs-2"], ["Uses in qualifiers", "col-xs-2"], ["Uses in references", "col-xs-2"]],
          
          getProperties: function(){
            return properties;
          }
        }
      });
    }
    return promise;
  })
  .factory('Classes', function($http, $route) {
    
    var promise;
	var classes; 

    if (!promise){
      promise = $http.get("data/classes.json").then(function(response){
        classes = response.data;

        return {
          classesHeader: [["ID", "col-xs-2"], ["Label", "col-xs-6"], ["Instances", "col-xs-2"], ["Subclasses", "col-xs-2"]],

          getClasses: function(){
            return classes;
          }
        }
      });
    }
    return promise;
  })
  .controller('TypeSelectorController', function($scope, Arguments){
    Arguments.refreshArgs();
    var args = Arguments.getArgs();
    switch (args.type) {
    case "classes":
      $scope.firstActive = "active";
      $scope.secondActive = "";
      break;
    case "properties":
      $scope.firstActive = "";
      $scope.secondActive = "active";
      break;
    default:
      console.log("type: " + args.type + " is unknown");
      $scope.firstActive = "active";
      $scope.secondActive = "";
    }
  })
  .controller('ClassViewController', function($scope,Classes,ClassView){
  	$scope.qid = ClassView.getQid();
  	$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;
  	
  		
  	var url = buildUrlForSparQLRequest(getQueryForInstances ($scope.qid, 10));
  	xhr(url).then(function(response) {
  	  $scope.exampleInstances = parseExampleInstances(response);
  	  console.log("parsed ExampleInstances");
  	});
  	 
  	xhr(buildUrlForApiRequest($scope.qid)).then(function(response){
  		$scope.classData = parseClassDataFromJson(response, $scope.qid);
  		console.log("parsed class data");
  	});
  	
  	Classes.then(function(data){
  	  $scope.relatedProperties = util.parseRelatedProperties($scope.qid, data.getClasses());
  	  $scope.classNumbers = util.parseClassNumbers($scope.qid, data.getClasses());
  	  //$scope.exampleInstances = getExampleInstances($scope.qid);
  	  //$scope.classNumbers = getNumberForClass($scope.qid);
  	  console.log("fetched ClassData");
  	});
  });
