'use strict'; // indicate that code is executed strict

var classBrowser = angular.module('classBrowserApp', ['ngAnimate', 'ngRoute', 'utilities'])

	.config(function($routeProvider) {
		$routeProvider
			.when('/', {templateUrl: 'views/start.html'})
			.when('/browse', { templateUrl: 'views/browseData.html' })
			.when('/datatypes', { templateUrl: 'views/datatypes.html' })
			.when('/about', { templateUrl: 'views/about.html' })
			.when('/classview', { templateUrl: 'views/classview.html' })
			.when('/propertyview', { templateUrl: 'views/propertyview.html'})
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
    
		var getData = function(qid, key, defaultValue) {
			try {
				return properties[qid][key];
			} catch(e){
				return defaultValue;
			}
		}

		if (!promise) {
			promise = $http.get("data/properties.json").then(function(response){
				properties = response.data;
				return {
					propertiesHeader: [["ID", "col-xs-2"], ["Label", "col-xs-4"], ["Uses in statements", "col-xs-2"], ["Uses in qualifiers", "col-xs-2"], ["Uses in references", "col-xs-2"]],
					getProperties: function(){ return properties; },
					getLabel: function(qid){ return getData(qid, 'l', null); },
					getItemCount: function(qid){ return getData(qid, 'i', 0); },
					getDatatype: function(qid){ return getData(qid, 'd', null); },
					getStatementCount: function(qid){ return getData(qid, 's', 0); },
					getQualifierCount: function(qid){ return getData(qid, 'q', 0); },
					getReferenceCount: function(qid){ return getData(qid, 'e', 0); },
					getRelatedProperties: function(qid){ return getData(qid, 'r', {}); },
					getQualifiers: function(qid){ return getData(qid, 'qs', []); }
				}
			});
		}
		return promise;
	})

	.factory('Classes', function($http, $route) {
		var promise;
		var classes; 
		
		var getData = function(qid, key, defaultValue) {
			try {
				return classes[qid][key];
			} catch(e){
				return defaultValue;
			}
		}

		if (!promise){
			promise = $http.get("data/classes.json").then(function(response){
				classes = response.data;
				return {
					classesHeader: [["ID", "col-xs-2"], ["Label", "col-xs-6"], ["Instances", "col-xs-2"], ["Subclasses", "col-xs-2"]],
					getClasses: function(){ return classes; },
					hasEntity: function(qid){ return (qid in classes); },
					getLabel: function(qid){ return getData(qid, 'l', null); },
					getDirectInstanceCount: function(qid){ return getData(qid, 'i', 0); },
					getDirectSubclassCount: function(qid){ return getData(qid, 's', 0); },
					getAllInstanceCount: function(qid){ return getData(qid, 'ai', 0); },
					getAllSubclassCount: function(qid){ return getData(qid, 'as', 0); },
					getRelatedProperties: function(qid){ return getData(qid, 'r', {}); },
					getSuperClasses: function(qid){ return getData(qid, 'sc', []); },
					getUrl: function(qid) { return "#/classview?id=" + qid }
				}
			});
		}
		return promise;
	})

	.filter('to_trusted', ['$sce', function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}])

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
	});
