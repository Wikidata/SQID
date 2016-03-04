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

	.factory('Arguments', function($http, $route, jsonData){
		var args = {}; 
		return {
			refreshArgs: function(){
				args = {
					from: ($route.current.params.from) ? parseInt(($route.current.params.from)) : 0,
					to: ($route.current.params.to) ? parseInt(($route.current.params.to)) : jsonData.TABLE_SIZE,
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
    
		var getData = function(id, key, defaultValue) {
			try {
				return properties[id][key];
			} catch(e){
				return defaultValue;
			}
		};

		var getLabel = function(id) { return getData(id, 'l', null); };
		var getUrl = function(id) { return "#/propertyview?id=P" + id; };

		var formatRelatedProperties = function(relatedProperties, threshold){
			var ret = [];
			try {
				var relPropsList = [];
				for (var relProp in relatedProperties) relPropsList.push([relProp, relatedProperties[relProp]]);

				relPropsList.sort(function(a, b) {
					var a = a[1];
					var b = b[1];
					return a < b ? 1 : (a > b ? -1 : 0);
				});

				for (var i = 0; i < relPropsList.length; i++) {
					if (relPropsList[i][1] < threshold) break;
					var propId = relPropsList[i][0];
					var resultObj = {label : getLabel(propId) , link: getUrl(propId)};
					ret.push(resultObj);
				}
			} catch (e){}

			return ret;
		};

		if (!promise) {
			promise = $http.get("data/properties.json").then(function(response){
				properties = response.data;
				return {
					propertiesHeader: [["ID", "col-xs-2"], ["Label", "col-xs-4"], ["Uses in statements", "col-xs-2"], ["Uses in qualifiers", "col-xs-2"], ["Uses in references", "col-xs-2"]],
					getProperties: function(){ return properties; },
					hasEntity: function(id){ return (id in properties); },
					getLabel: getLabel,
					getLabelOrId: function(id) { return getData(id, 'l', 'P' + id); },
					getItemCount: function(id){ return getData(id, 'i', 0); },
					getDatatype: function(id){ return getData(id, 'd', null); },
					getStatementCount: function(id){ return getData(id, 's', 0); },
					getQualifierCount: function(id){ return getData(id, 'q', 0); },
					getReferenceCount: function(id){ return getData(id, 'e', 0); },
					getRelatedProperties: function(id){ return getData(id, 'r', {}); },
					getQualifiers: function(id){ return getData(qid, 'qs', []); },
					getUrl: getUrl,
					formatRelatedProperties: formatRelatedProperties,
				}
			});
		}
		return promise;
	})

	.factory('Classes', function($http, $route) {
		var promise;
		var classes; 

		var getData = function(id, key, defaultValue) {
			try {
				return classes[id][key];
			} catch(e){
				return defaultValue;
			}
		};

		var getLabel = function(id){ return getData(id, 'l', null); };
		var getUrl = function(id) { return "#/classview?id=Q" + id; };
		var getAllInstanceCount = function(id){ return getData(id, 'ai', 0); };

		var getNonemptySubclasses = function(id) {
			var ret = [];
			var subClasses = getData(id,'sb', []);
			for ( var i in subClasses ) {
				var label = getLabel(subClasses[i]);
				if ( label === null ) label = "Q" + subClasses[i];
				ret.push( {label: label, url: getUrl(subClasses[i]), icount: getAllInstanceCount(subClasses[i])} );
			}
			ret.sort(function(a, b) {
				return a.icount < b.icount ? 1 : (a.icount > b.icount ? -1 : 0);
			});
			return ret;
		};

		if (!promise){
			promise = $http.get("data/classes.json").then(function(response){
				classes = response.data;
				return {
					classesHeader: [["ID", "col-xs-2"], ["Label", "col-xs-6"], ["Instances", "col-xs-2"], ["Subclasses", "col-xs-2"]],
					getClasses: function(){ return classes; },
					hasEntity: function(id){ return (id in classes); },
					getLabel: getLabel,
					getLabelOrId: function(id){ return getData(id, 'l', 'Q' + id); },
					getDirectInstanceCount: function(id){ return getData(id, 'i', 0); },
					getDirectSubclassCount: function(id){ return getData(id, 's', 0); },
					getAllInstanceCount: getAllInstanceCount,
					getAllSubclassCount: function(id){ return getData(id, 'as', 0); },
					getRelatedProperties: function(id){ return getData(id, 'r', {}); },
					getSuperClasses: function(id){ return getData(id, 'sc', []); },
					getUrl: getUrl,
					getNonemptySubclasses: getNonemptySubclasses
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
