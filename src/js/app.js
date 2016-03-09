'use strict'; // indicate that code is executed in strict mode

var classBrowser = angular.module('classBrowserApp', ['ngAnimate', 'ngRoute', 'utilities','queryInterface'])

	.config(function($routeProvider) {
		$routeProvider
			.when('/', {templateUrl: 'views/start.html'})
			.when('/browse', { templateUrl: 'views/browseData.html' })
			.when('/datatypes', { templateUrl: 'views/datatypes.html' })
			.when('/about', { templateUrl: 'views/about.html' })
			.when('/view', { templateUrl: 'views/view.html' })
			.when('/query', { templateUrl: 'views/queryview.html'})
			.otherwise({redirectTo: '/'});
	})

	.factory('Arguments', function($http, $route, jsonData){
		var args = {}; 
		var status ={
			entityType: "classes",
			from: 0,
			to:jsonData.TABLE_SIZE,
			classesFilter: {
				label: "",
				instances: [0, 4000000],
				subclasses: [0, 200000]
			},
			propertiesFilter: {
				label: "",
				statements: [0, 20000000],
				qualifiers: [0, 100000],
				references: [0, 100000]
			}
		}
		return {
			refreshArgs: function(){
				args = {
					from: ($route.current.params.from) ? parseInt(($route.current.params.from)) : status.from,
					to: ($route.current.params.to) ? parseInt(($route.current.params.to)) : status.to,
					type: ($route.current.params.type) ? ($route.current.params.type) : status.entityType
				}
				status.from = args.from;
				status.to = args.to;
				status.entityType = args.type;
			},
			getArgs: function(){
				return args;
			},
			getStatus: function(){
				return status;
			}
		}
	})

	.factory('Properties', function($http, $route){
		var promise;
		var properties;
    
		var getData = function(id, key, defaultValue) {
			try {
				var result = properties[id][key];
				if (typeof result !== 'undefined' && result !== null) {
					return result;
				}
			} catch(e){
				return defaultValue;
			}
		}

		var getLabel = function(id) { return getData(id, 'l', null); }
		var getLabelOrId = function(id) { return getData(id, 'l', 'P' + id); }
		var getUrl = function(id) { return "#/view?id=P" + id; }

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
					var resultObj = {label : getLabelOrId(propId) , link: getUrl(propId)};
					ret.push(resultObj);
				}
			} catch (e){}

			return ret;
		}
		
		var getQualifiers = function(id){ return getData(id, 'qs', {}); }
		
		var getFormattedQualifiers = function(id) {
			var ret = [];
			angular.forEach(getQualifiers(id), function(usageCount, qualifierId) {
				ret.push({label : getLabelOrId(qualifierId) , url: getUrl(qualifierId), count: usageCount});
			});
			ret.sort(function(a, b) {
					var a = a.count;
					var b = b.count;
					return a < b ? 1 : (a > b ? -1 : 0);
			});
			return ret;
		}
		
		var getStatementCount = function(id){ return getData(id, 's', 0); }

		if (!promise) {
			promise = $http.get("data/properties.json").then(function(response){
				properties = response.data;
				return {
					propertiesHeader: [["ID", "col-xs-2"], ["Label", "col-xs-4"], ["Uses in statements", "col-xs-2"], ["Uses in qualifiers", "col-xs-2"], ["Uses in references", "col-xs-2"]],
					getProperties: function(){ return properties; },
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
					getFormattedQualifiers: getFormattedQualifiers,
					getMainUsageCount: getStatementCount,
					getUrl: getUrl,
					getUrlPattern: function(id){ return getData(id, 'u', null); },
					getClasses: function(id){ return getData(id, 'pc', []); },
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
				var result = classes[id][key];
				if (typeof result !== 'undefined' && result !== null) {
					return result;
				}
			} catch(e){
				// fall through
			}
			return defaultValue;
		};

		var getLabel = function(id){ return getData(id, 'l', null); };
		var getUrl = function(id) { return "#/view?id=Q" + id; };
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
					getMainUsageCount: getAllInstanceCount,
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

	.directive('ngSlider', function(){
	    var SCALE_FACTOR = 1.005;
	    var scale = function(val){
	      if (val > 0) {
	      return Math.round(Math.log(val) / Math.log(SCALE_FACTOR));
	      }
	      else {
	        return 0;
	      }
	    }
	    
	    var antiScale = function(val){
	       if (val > 0) {
	      return Math.round(Math.pow(SCALE_FACTOR, val));
	       }else{
	        return 0;
	       }
	    }
	    function link(scope, element, attrs){
	      element.slider({
	        range: true,
	        min: scale(parseInt(scope.begin)),
	        max: scale(parseInt(scope.end)),
	        values: [ scale(scope.$parent.slider[parseInt(scope.index)].startVal), scale(scope.$parent.slider[parseInt(scope.index)].endVal) ],
	        slide: function( event, ui ) {
	          scope.$parent.slider[parseInt(scope.index)].startVal = antiScale(ui.values[0]);
	          scope.$parent.slider[parseInt(scope.index)].endVal = antiScale(ui.values[1]);
	          scope.$parent.updateStatus();
	          scope.$apply();
	          //$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
	        }
	      });
	    }
	    
	    return {
	      scope:{
	        begin: '=begin',
	        end: '=end',
	        index: '=index'
	      },
	      link: link
	    };
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
	});
