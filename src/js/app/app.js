'use strict'; // indicate that code is executed in strict mode

define([ // module definition dependencies
	'ngAnimate', 
	'ngRoute',
	'ngTranslate',
	'ngComplete',
	'util/util',
	'ui-boostrap-tpls', // implicit bootstrap
], function() {

$("[data-toggle=popover]").popover({html:true});

var classBrowser = angular.module('classBrowserApp', ['ngAnimate', 'ngRoute', 'utilities', 'ui.bootstrap', 'pascalprecht.translate', 'angucomplete-alt', 'queryInterface'])

	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {templateUrl: 'views/start.html'})
			.when('/browse', { templateUrl: 'views/browseData.html' })
			.when('/datatypes', { templateUrl: 'views/datatypes.html' })
			.when('/about', { templateUrl: 'views/about.html' })
			.when('/status', { templateUrl: 'views/status.html' })
			.when('/view', { templateUrl: 'views/view.html' })
			.when('/query', { templateUrl: 'views/queryview.html'})
			.otherwise({redirectTo: '/'});
	}])

	.factory('Arguments', ['$http', '$route', 'util', function($http, $route, util){
	    var args = {}; 
	    var statusStartValues = {
	      entityType: "classes",
	      activePage: 1,
	      sortCriteria: {
	        classes: {
	          label: "fa fa-sort",
	          instances: "fa fa-sort-desc",
	          subclasses: "fa fa-sort"
	        },
	        properties: {
	          label: "fa fa-sort",
	          datatype: "fa fa-sort",
	          statements: "fa fa-sort-desc",
	          qualifiers: "fa fa-sort",
	          references: "fa fa-sort"
	        }
	      },
	      classesFilter: {
	        label: "",
	        relatedProperty: "",
	        superclass: "",
	        instances: [0, 4000000],
	        subclasses: [0, 2000000]
	      },
	      propertiesFilter: {
	        label: "",
	        relatedProperty: "",
	        relatedQualifier: "",
	        directInstanceOf: "",
	        statements: [0, 20000000],
	        qualifiers: [0, 10000000],
	        references: [0, 10000000],
	        datatypes: {id: 1, name: "Any property type"}

	      }
	    };

	    var serializeDatatype = function(type){
	      return type.id + ":" + type.name;
	    }

	    var deserializeDatatype = function(typeString){
	      if (!typeString){
	        return typeString;
	      }
	      var splits = typeString.split(":");
	      return {id: splits[0], name: splits[1]};
	    }

	    var status = util.cloneObject(statusStartValues);
	    return {
	      refreshArgs: function(){
	        args = {
	          type: ($route.current.params.type) ? ($route.current.params.type) : status.entityType,
	          activePage: ($route.current.params.activepage) ? parseInt(($route.current.params.activepage)) : status.activePage,
	          sortCriteria: {
	            classes: {
	              label: ($route.current.params.sortclasslabel) ? ($route.current.params.sortclasslabel) : status.sortCriteria.classes.label,
	              instances: ($route.current.params.sortclassinstances) ? ($route.current.params.sortclassinstances) : status.sortCriteria.classes.instances,
	              subclasses: ($route.current.params.sortclasssubclasses) ? ($route.current.params.sortclasssubclasses) : status.sortCriteria.classes.subclasses
	            },
	            properties: {
	              label: ($route.current.params.sortpropertylabel) ? ($route.current.params.sortpropertylabel) : status.sortCriteria.properties.label,
	              datatype: ($route.current.params.sortpropertydatatype) ? ($route.current.params.sortpropertydatatype) : status.sortCriteria.properties.datatype,
	              statements: ($route.current.params.sortpropertystatements) ? ($route.current.params.sortpropertystatements) : status.sortCriteria.properties.statements,
	              qualifiers: ($route.current.params.sortpropertyqualifiers) ? ($route.current.params.sortpropertyqualifiers) : status.sortCriteria.properties.qualifiers,
	              references: ($route.current.params.sortpropertyreferences) ? ($route.current.params.sortpropertyreferences) : status.sortCriteria.properties.references
	            }
	          },
	          classesFilter: {
	            label:  ($route.current.params.classlabelfilter) ? ($route.current.params.classlabelfilter) : status.classesFilter.label,
	            relatedProperty: ($route.current.params.rpcfilter) ? ($route.current.params.rpcfilter) : status.classesFilter.relatedProperty,
	            superclass: ($route.current.params.supercfilter) ? ($route.current.params.supercfilter) : status.classesFilter.superclass,
	            instances: [ ($route.current.params.instancesbegin) ? ($route.current.params.instancesbegin) : status.classesFilter.instances[0], ($route.current.params.instancesend) ? ($route.current.params.instancesend) : status.classesFilter.instances[1]],
	            subclasses: [ ($route.current.params.subclassesbegin) ? ($route.current.params.subclassesbegin) : status.classesFilter.subclasses[0], ($route.current.params.subclassesend) ? ($route.current.params.subclassesend) : status.classesFilter.subclasses[1]],
	          },
	          propertiesFilter: {
	            label: ($route.current.params.propertylabelfilter) ? ($route.current.params.propertylabelfilter) : status.propertiesFilter.label,
	            relatedProperty: ($route.current.params.rppfilter) ? ($route.current.params.rppfilter) : status.propertiesFilter.relatedProperty,
	            relatedQualifier: ($route.current.params.rqualifierfilter) ? ($route.current.params.rqualifierfilter) : status.propertiesFilter.relatedQualifier,
	            directInstanceOf: ($route.current.params.dInstancefilter) ? ($route.current.params.dInstancefilter) : status.propertiesFilter.directInstanceOf,
	            statements: [ ($route.current.params.statementsbegin) ? ($route.current.params.statementsbegin) : status.propertiesFilter.statements[0], ($route.current.params.statementsend) ? ($route.current.params.statementsend) : status.propertiesFilter.statements[1]],
	            qualifiers: [ ($route.current.params.qualifiersbegin) ? ($route.current.params.qualifiersbegin) : status.propertiesFilter.qualifiers[0], ($route.current.params.qualifiersend) ? ($route.current.params.qualifiersend) : status.propertiesFilter.qualifiers[1]],
	            references: [ ($route.current.params.referencesbegin) ? ($route.current.params.referencesbegin) : status.propertiesFilter.references[0], ($route.current.params.referencesend) ? ($route.current.params.referencesend) : status.propertiesFilter.references[1]],
	            datatypes: ($route.current.params.datatypes) ? deserializeDatatype($route.current.params.datatypes) : status.propertiesFilter.datatypes
	          }
	        }
	        status.entityType = args.type;
	        status.activePage = args.activePage;
	        status.sortCriteria = args.sortCriteria;
	        status.classesFilter = args.classesFilter;
	        status.propertiesFilter = args.propertiesFilter;
	      },
	      getArgs: function(){
	        return args;
	      },
	      getStatus: function(){
	        return status;
	      },
	      getStatusStartValues:function(){
	        return util.cloneObject(statusStartValues);
	      },
	      getUrl: function(){
	        var result =  location.origin + location.pathname + "#/browse" 
	          + "?activepage=" + status.activePage
	          + "&type=" + status.entityType;
	        if (status.entityType == "classes"){
	          result += (status.classesFilter.label ? "&classlabelfilter=" + status.classesFilter.label : "")
	            + (status.classesFilter.relatedProperty ? "&rpcfilter=" + status.classesFilter.relatedProperty : "")
	            + (status.classesFilter.superclass ? "&supercfilter=" + status.classesFilter.superclass : "")
	            + (status.classesFilter.instances[0] != 0 ? "&instancesbegin=" + status.classesFilter.instances[0] : "")
	            + (status.classesFilter.instances[1] != 4000000 ? "&instancesend=" + status.classesFilter.instances[1] : "")
	            + (status.classesFilter.subclasses[0] != 0 ? "&subclassesbegin=" + status.classesFilter.subclasses[0] : "")
	            + (status.classesFilter.subclasses[1] != 2000000 ? "&subclassesend=" + status.classesFilter.subclasses[1] : "")
	            + (status.sortCriteria.classes.label != "fa fa-sort" ? "&sortclasslabel=" + status.sortCriteria.classes.label : "")
	            + (status.sortCriteria.classes.instances != "fa fa-sort-desc" ? "&sortclassinstances=" + status.sortCriteria.classes.instances : "")
	            + (status.sortCriteria.classes.subclasses != "fa fa-sort" ? "&sortclasssubclasses=" + status.sortCriteria.classes.subclasses : "")
	          
	        }else{
	          result += (status.propertiesFilter.label ? "&propertylabelfilter=" + status.propertiesFilter.label : "") 
	            + (status.propertiesFilter.relatedProperty ? "&rppfilter=" + status.propertiesFilter.relatedProperty : "")
	            + (status.propertiesFilter.relatedQualifier ? "&rqualifierfilter=" + status.propertiesFilter.relatedQualifier : "")
	            + (status.propertiesFilter.directInstanceOf ? "&dInstancefilter=" + status.propertiesFilter.directInstanceOf : "")
	            + (status.propertiesFilter.statements[0] != 0 ? "&statementsbegin=" + status.propertiesFilter.statements[0] : "")
	            + (status.propertiesFilter.statements[1] != 20000000 ? "&statementsend=" + status.propertiesFilter.statements[1] : "")
	            + (status.propertiesFilter.qualifiers[0] != 0 ? "&qualifiersbegin=" + status.propertiesFilter.qualifiers[0] : "")
	            + (status.propertiesFilter.qualifiers[1] != 10000000 ? "&qualifiersend=" + status.propertiesFilter.qualifiers[1] : "")
	            + (status.propertiesFilter.references[0] != 0 ? "&referencesbegin=" + status.propertiesFilter.references[0] : "")
	            + (status.propertiesFilter.references[1] != 10000000   ? "&referencesend=" + status.propertiesFilter.references[1] : "")
	            + (status.propertiesFilter.datatypes.id != 1 ? "&datatypes=" + serializeDatatype(status.propertiesFilter.datatypes) : "")
	            + (status.sortCriteria.properties.label != "fa fa-sort" ? "&sortpropertylabel=" + status.sortCriteria.properties.label : "")
	            + (status.sortCriteria.properties.datatype != "fa fa-sort" ? "&sortpropertydatatype=" + status.sortCriteria.properties.datatype : "")
	            + (status.sortCriteria.properties.statements != "fa fa-sort-desc" ? "&sortpropertystatements=" + status.sortCriteria.properties.statements : "")
	            + (status.sortCriteria.properties.qualifiers != "fa fa-sort" ? "&sortpropertyqualifiers=" + status.sortCriteria.properties.qualifiers : "")
	            + (status.sortCriteria.properties.references != "fa fa-sort" ? "&sortpropertyreferences=" + status.sortCriteria.properties.references : "");
	        }
	        return result;
	      }
	    }
	}])

	.filter('to_trusted', ['$sce', function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}])

	.directive('ngSlider', function(){
	    var SCALE_FACTOR = 1.005;
	    var MULTIPLIER = 1000000;
	    var scale = function(val){
	      if (val > 0) {
	      	return Math.round((Math.log(val) / Math.log(SCALE_FACTOR))*MULTIPLIER);
	      }
	      else {
	        return 0;
	      }
	    }
	    
	    var antiScale = function(val){
	      if (val > 0) {
	        return Math.round(Math.pow(SCALE_FACTOR, (val / MULTIPLIER)));
	      }else{
	        return 0;
	      }
	    }
	    function link(scope, element, attrs){
	      scope.$watchGroup(['startval', 'endval'], function(){
	        element.slider({
	          range: true,
	          min: scale(parseInt(scope.begin)),
	          max: scale(parseInt(scope.end)),
	          values: [ scale(scope.startval), scale(scope.endval) ],
	          slide: function( event, ui ) {
	            scope.$parent.slider[parseInt(scope.index)].startVal = antiScale(ui.values[0]);
	            scope.$parent.slider[parseInt(scope.index)].endVal = Math.min(antiScale(ui.values[1]), scope.end);
	            scope.$parent.updateStatus();
	            scope.$apply();
	          }
	        });
	      });
	    }
	    
	    return {
	      scope:{
	        begin: '=begin',
	        end: '=end',
	        index: '=index',
	        startval: '=startval',
	        endval: '=endval'
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

	return {}; // module
}); 		  // definition end