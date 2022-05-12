//////// Module Definition ////////////
define([
	'browse/browse.module',
	'ngRoute',
	'util/util.service',
	'i18n/i18n.service',
], function() {
///////////////////////////////////////

angular.module('browse').factory('arguments', ['$http', '$route', 'util', 'i18n', function($http, $route, util, i18n){
	  var filterLimits = {
		  'instances': 10E7,
		  'subclasses': 5E7,
		  'statements': 10E9,
		  'qualifiers': 50E7,
		  'references': 20E7,
	  };

	  var args = {};
	  var statusStartValues = {
		entityType: "classes",
		activePage: 1,
		lang: i18n.getLanguage(),
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
		  instances: [0, filterLimits['instances']],
		  subclasses: [0, filterLimits['subclasses']]
		},
		propertiesFilter: {
		  label: "",
		  relatedProperty: "",
		  relatedQualifier: "",
		  usedForClass: "",
		  directInstanceOf: {id: 1, name: "Any property class", qId: 0},
		  statements: [0, filterLimits['statements']],
		  qualifiers: [0, filterLimits['qualifiers']],
		  references: [0, filterLimits['references']],
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

	  var serializePropertyClass = function(c){
		return c.id + ":" + c.name + ":" + c.qId;
	  }

	  var deserializePropertyClass = function(classString){
		if (!classString){
		  return classString;
		}
		var splits = classString.split(":");
		return {id: splits[0], name: splits[1], qId: splits[2]};
	  }

	  var status = util.cloneObject(statusStartValues);
	  return {
		getFilterLimits: function() {
		  return filterLimits;
		},
		refreshArgs: function(){
		  args = {
			type: ($route.current.params.type) ? ($route.current.params.type) : status.entityType,
			activePage: ($route.current.params.activepage) ? parseInt(($route.current.params.activepage)) : status.activePage,
			lang : ($route.current.params.lang) ? ($route.current.params.lang) : i18n.getLanguage(),
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
			  usedForClass: ($route.current.params.usedforclassfilter) ? ($route.current.params.usedforclassfilter) : status.propertiesFilter.usedForClass,
			  directInstanceOf: ($route.current.params.dInstancefilter) ? deserializePropertyClass($route.current.params.dInstancefilter) : status.propertiesFilter.directInstanceOf,
			  statements: [ ($route.current.params.statementsbegin) ? ($route.current.params.statementsbegin) : status.propertiesFilter.statements[0], ($route.current.params.statementsend) ? ($route.current.params.statementsend) : status.propertiesFilter.statements[1]],
			  qualifiers: [ ($route.current.params.qualifiersbegin) ? ($route.current.params.qualifiersbegin) : status.propertiesFilter.qualifiers[0], ($route.current.params.qualifiersend) ? ($route.current.params.qualifiersend) : status.propertiesFilter.qualifiers[1]],
			  references: [ ($route.current.params.referencesbegin) ? ($route.current.params.referencesbegin) : status.propertiesFilter.references[0], ($route.current.params.referencesend) ? ($route.current.params.referencesend) : status.propertiesFilter.references[1]],
			  datatypes: ($route.current.params.datatypes) ? deserializeDatatype($route.current.params.datatypes) : status.propertiesFilter.datatypes
			}
		  }
		  status.entityType = args.type;
		  status.activePage = args.activePage;
		  status.lang = args.lang;
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
			+ "&type=" + status.entityType
			+ "&lang=" + status.lang;
		  if (status.entityType == "classes"){
			result += (status.classesFilter.label ? "&classlabelfilter=" + status.classesFilter.label : "")
			  + (status.classesFilter.relatedProperty ? "&rpcfilter=" + status.classesFilter.relatedProperty : "")
			  + (status.classesFilter.superclass ? "&supercfilter=" + status.classesFilter.superclass : "")
			  + (status.classesFilter.instances[0] != 0 ? "&instancesbegin=" + status.classesFilter.instances[0] : "")
			  + (status.classesFilter.instances[1] != filterLimits['instances'] ? "&instancesend=" + status.classesFilter.instances[1] : "")
			  + (status.classesFilter.subclasses[0] != 0 ? "&subclassesbegin=" + status.classesFilter.subclasses[0] : "")
			  + (status.classesFilter.subclasses[1] != filterLimits['subclasses'] ? "&subclassesend=" + status.classesFilter.subclasses[1] : "")
			  + (status.sortCriteria.classes.label != "fa fa-sort" ? "&sortclasslabel=" + status.sortCriteria.classes.label : "")
			  + (status.sortCriteria.classes.instances != "fa fa-sort-desc" ? "&sortclassinstances=" + status.sortCriteria.classes.instances : "")
			  + (status.sortCriteria.classes.subclasses != "fa fa-sort" ? "&sortclasssubclasses=" + status.sortCriteria.classes.subclasses : "")

		  }else{
			result += (status.propertiesFilter.label ? "&propertylabelfilter=" + status.propertiesFilter.label : "")
			  + (status.propertiesFilter.relatedProperty ? "&rppfilter=" + status.propertiesFilter.relatedProperty : "")
			  + (status.propertiesFilter.relatedQualifier ? "&rqualifierfilter=" + status.propertiesFilter.relatedQualifier : "")
			  + (status.propertiesFilter.usedForClass ? "&usedforclassfilter=" + status.propertiesFilter.usedForClass : "")
			  + (status.propertiesFilter.directInstanceOf.id != 1 ? "&dInstancefilter=" + serializePropertyClass(status.propertiesFilter.directInstanceOf) : "")
			  + (status.propertiesFilter.statements[0] != 0 ? "&statementsbegin=" + status.propertiesFilter.statements[0] : "")
			  + (status.propertiesFilter.statements[1] != filterLimits['statements'] ? "&statementsend=" + status.propertiesFilter.statements[1] : "")
			  + (status.propertiesFilter.qualifiers[0] != 0 ? "&qualifiersbegin=" + status.propertiesFilter.qualifiers[0] : "")
			  + (status.propertiesFilter.qualifiers[1] != filterLimits['qualifiers'] ? "&qualifiersend=" + status.propertiesFilter.qualifiers[1] : "")
			  + (status.propertiesFilter.references[0] != 0 ? "&referencesbegin=" + status.propertiesFilter.references[0] : "")
			  + (status.propertiesFilter.references[1] != filterLimits['references']  ? "&referencesend=" + status.propertiesFilter.references[1] : "")
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
  }]);



return {}; }); // module definition end
