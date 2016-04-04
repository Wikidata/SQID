'use strict'; // indicate that code is executed in strict mode

$("[data-toggle=popover]").popover({html:true});

var classBrowser = angular.module('classBrowserApp', ['ngAnimate', 'ngRoute', 'utilities', 'ui.bootstrap', 'pascalprecht.translate', 'angucomplete-alt'])

	.config(function($routeProvider) {
		$routeProvider
			.when('/', {templateUrl: 'views/start.html'})
			.when('/browse', { templateUrl: 'views/browseData.html' })
			.when('/datatypes', { templateUrl: 'views/datatypes.html' })
			.when('/about', { templateUrl: 'views/about.html' })
			.when('/view', { templateUrl: 'views/view.html' })
			.otherwise({redirectTo: '/'});
	})

	.config(['$translateProvider', function ($translateProvider) {

		var enMessages = {
			NAV: {
				PROPERTIES: 'Properties',
				CLASSES: 'Classes',
				START: 'Start',
				ABOUT: 'About',
			},
			FOOTER: {
				STAT_DATE: 'Statistics based on data dump {{date}}',
				POWERED_BY: 'Powered by <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata Toolkit</a> &amp; <a href="https://query.wikidata.org/">Wikidata SPARQL Query</a>',
			},
			PROPTYPE : 'Type',
			FURTHER_RESULTS: '&hellip; further results',
			STATEMENTS: {
				PREFERRED_HINT: 'This is a preferred statement',
				DEPRECATED_HINT: 'This is a deprecated statement',
				NO_VALUE: 'no value',
				SOME_VALUE: 'unspecified value',
				MORE_STATEMENTS: 'show {{number}} more statements',
				LESS_STATEMENTS: 'hide {{number}} statements'
			},
			TYPICAL_PROPS : {
				TYPICAL_PROPS : 'Typical Properties',
				HINT_PROP : 'Other properties typically used by entities using this property',
				HINT_CLASS : 'Other properties typically used by direct and indirect instances of this class',
				NONE : 'none',
			},
			INSTANCE_OF_PHRASE: '{{entity}} is a(n) {{classes}}',
			NO_INSTANCE_OF_PHRASE: '{{entity}} is not an instance of any other class',
			SUBCLASS_OF_PHRASE: 'every {{entity}} is also a(n) {{classes}}',
			NO_SUBCLASS_OF_PHRASE: '{{entity}} is not a subclass of any other class',
			SUBPROPERTY_OF_PHRASE: 'every {{entity}} is also a(n) {{properties}}',
			NO_SUBPROPERTY_OF_PHRASE: '{{entity}} is not a subproperty of any other property',
		 	SEC_CLASSIFICATION : {
				SEC_CLASSIFICATION : 'Classification',
				DIRECT_SUBCLASSES: 'Direct subclasses',
				NO_DIRECT_SUBCLASSES: 'none',
				LOADING_DIRECT_SUBCLASSES: 'Loading direct subclasses &hellip;',
				DIRECT_SUBCLASSES_INSTANCE: 'With instances',
				INSTANCE_SUBCLASSES_HINT: 'Direct subclasses that have instances, together with the number of their direct and indirect instances',
				DIRECT_SUBCLASSES_SUBCLASS: 'With subclasses',
				SUBCLASS_SUBCLASSES_HINT: 'Direct subclasses that have subclasses, together with the number of their direct and indirect subclasses',
				DIRECT_SUBCLASSES_ALL: 'All',
				DIRECT_SUPERCLASSES: 'Direct superclasses',
				NO_DIRECT_SUPERCLASSES: 'none',
				ALL_SUBCLASSES: 'All subclasses',
				ALL_SUBCLASSES_HINT: 'Number of unique direct and indirect subclasses',
			},
			SEC_INSTANCES : {
				SEC_INSTANCES : 'Instances',
				DIRECT_INSTANCES : 'Direct instances',
				ALL_INSTANCES : 'All instances',
				ALL_INSTANCES_HINT : 'Total number of unique instances of this class and its {{subclassCount}} direct and indirect subclasses',
				NO_DIRECT_INSTANCES: 'No direct instances found. Maybe the data changed recently. Our records will be updated soon.',
				LOADING_DIRECT_INSTANCES: 'Loading direct instances &hellip;',
			},
			SEC_HUMAN_RELATIONS: 'Human relationships',
			SEC_IDENTIFIERS: 'Identifiers',
			SEC_LINKS : {
				SEC_LINKS : 'Links',
				WIKIDATA : 'Wikidata page',
				REASONATOR : 'Reasonator',
			},
			SEC_PROP_USE : {
				SEC_PROP_USE : 'Property Usage',
				ENTITIES: 'Entities',
				ENTITIES_HINT: 'Entities with some statement for this property',
				NO_ENTITIES: 'No entities found. Maybe the data changed recently. Our records will be updated soon.',
				LOADING_ENTITIES: 'Loading entities &hellip;',
				VALUES: 'Values',
				VALUES_HINT: 'Values used in some statement with this property',
				STATEMENTS: 'Statements',
				STATEMENTS_PER_ENTITY: '({{number}} per entity)',
				STATEMENTS_HINT: 'Number of statements for this property',
				QUALIFIERS: 'Qualifiers',
				QUALIFIERS_HINT: 'Other properties that are used as qualifiers for this property, together with the number of uses',
				QUALIFIER_USES: 'Uses as qualifier',
				REFERENCE_USES: 'Uses in references',
			},
			SEC_STATEMENTS : 'Statements',
			SEC_MEDIA : 'Media',
			SEC_WIKIMEDIA_PAGES : 'Wikimedia Categories and Portals',
			NOSUCHENTITY_HEADLINE: 'Sorry, I could not find any entity with ID "{{id}}".',
			NOSUCHENTITY_BODY: 'Maybe it was deleted. Maybe it never existed. Maybe we\'ll never know.',
		};
		var deMessages = {
			NAV: {
				PROPERTIES: 'Eigenschaften',
				CLASSES: 'Klassen',
				START: 'Start',
				ABOUT: 'Über SQID',
			},
			FOOTER: {
				STAT_DATE: 'Statistiken Stand {{date}}',
				POWERED_BY: 'Powered by <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata Toolkit</a> &amp; <a href="https://query.wikidata.org/">Wikidata SPARQL Query</a>',
			},
			PROPTYPE : 'Typ',
		 	STATEMENTS: {
				PREFERRED_HINT: 'Dies ist eine bevorzugte Aussage',
				DEPRECATED_HINT: 'Dies ist eine überholte Aussage',
				NO_VALUE: 'kein Wert',
				SOME_VALUE: 'unspezifizierter Wert',
				MORE_STATEMENTS: 'weitere {{number}} Aussagen anzeigen',
				LESS_STATEMENTS: '{{number}} Aussagen ausblenden'
			},
			TYPICAL_PROPS : {
				TYPICAL_PROPS : 'Typische Eigenschaften',
				HINT_PROP : 'Andere Eigenschaften, die oftmals von Entitäten verwendet werden, die diese Eigenschaft verwenden',
				HINT_CLASS : 'Andere Eigenschaften, die oftmals von direkten oder indirekten Instanzen dieser Klasse verwendet werden',
				NONE: 'keine'
			},
			INSTANCE_OF_PHRASE: '{{entity}} ist ein(e) {{classes}}',
			NO_INSTANCE_OF_PHRASE: '{{entity}} ist keine Instanz einer Klasse',
			SUBCLASS_OF_PHRASE: 'jede Instanz von {{entity}} ist auch {{classes}}',
			NO_SUBCLASS_OF_PHRASE: '{{entity}} hat keinerlei Oberklassen',
			SUBPROPERTY_OF_PHRASE: 'Werte für {{entity}} gelten auch für {{properties}}',
			NO_SUBPROPERTY_OF_PHRASE: '{{entity}} ist keine Untereigenschaft einer anderen Eigenschaft',
			SEC_CLASSIFICATION : {
				SEC_CLASSIFICATION : 'Klassifikation',
				DIRECT_SUBCLASSES: 'Direkte Unterklassen',
				NO_DIRECT_SUBCLASSES: 'keine',
				LOADING_DIRECT_SUBCLASSES: 'Direkte Unterklassen werden geladen &hellip;',
				DIRECT_SUBCLASSES_INSTANCE: 'Mit Instanzen',
				INSTANCE_SUBCLASSES_HINT: 'Direkte Unterklassen, die eigene Instanzen haben, mit der Gesamtzahl ihrer direkten und indirekten Instanzen',
				DIRECT_SUBCLASSES_SUBCLASS: 'Mit Unterklassen',
				SUBCLASS_SUBCLASSES_HINT: 'Direkte Unterklassen, die eigene Unterklassen haben, mit der Gesamtzahl ihrer direkten und indirekten Unterklassen',
				DIRECT_SUBCLASSES_ALL: 'Alle',
				DIRECT_SUPERCLASSES: 'Direkte Oberklassen',
				NO_DIRECT_SUPERCLASSES: 'keine',
				ALL_SUBCLASSES: 'Alle Unterklassen',
				ALL_SUBCLASSES_HINT: 'Gesamtzahl der direkten und indirekten Unterklassen',
			},
			SEC_INSTANCES : {
				SEC_INSTANCES : 'Instanzen',
				DIRECT_INSTANCES : 'Direkte Instanzen',
				ALL_INSTANCES : 'Alle Instanzen',
				ALL_INSTANCES_HINT : 'Gesamtzahl der Instanzen dieser Klasse und ihrer {{subclassCount}} direkten und indirekten Unterklassen',
				NO_DIRECT_INSTANCES: 'Keine direkten Instanzen gefunden. Eventuell haben sich die Daten vor kurzem geändert. Unsere Statistiken sollten in Kürze aktualisiert werden.',
				LOADING_DIRECT_INSTANCES: 'Direkte Instanzen werden geladen &hellip;',
			},
			SEC_HUMAN_RELATIONS: 'Beziehungen',
			SEC_IDENTIFIERS: 'Bezeichner',
			SEC_LINKS : {
				SEC_LINKS : 'Links',
				WIKIDATA : 'Wikidata',
				REASONATOR : 'Reasonator',
			},
			SEC_PROP_USE : {
				SEC_PROP_USE : 'Verwendung der Eigenschaft',
				ENTITIES: 'Entitäten',
				ENTITIES_HINT: 'Entitäten mit mindestens einer Aussage für diese Eigenschaft',
				NO_ENTITIES: 'Keine Entitäten mit dieser Eigentschaft gefunden. Eventuell haben sich die Daten vor kurzem geändert. Unsere Statistiken sollten in Kürze aktualisiert werden.',
				LOADING_ENTITIES: 'Entitäten werden geladen &hellip;',
				VALUES: 'Werte',
				VALUES_HINT: 'Werte, die in einer Aussage dieser Eigenschaft verwendet werden',
				STATEMENTS: 'Aussagen',
				STATEMENTS_PER_ENTITY: '({{number}} pro Entität)',
				STATEMENTS_HINT: 'Gesamtzahl der Aussagen mit dieser Eigenschaft',
				QUALIFIERS: 'Qualifikatoren',
				QUALIFIERS_HINT: 'Andere Eigenschaften, die als Qualifikator für Aussagen mit dieser Eigenschaft verwendet werden und die Zahl ihrer Verwendungen',
				QUALIFIER_USES: 'Verwendung als Qualifikator',
				REFERENCE_USES: 'Verwendung in Referenzen',
			},
			SEC_STATEMENTS : 'Aussagen',
			SEC_MEDIA : 'Medien',
			SEC_WIKIMEDIA_PAGES : 'Wikimedia-Kategorien und -Portale',
			NOSUCHENTITY_HEADLINE: 'Leider konnte ich kein Objekt mit ID "{{id}}" finden.',
			NOSUCHENTITY_BODY: 'Vielleicht wurde es gelöscht. Vielleicht hat es niemals existiert. Vielleicht werden wir es nie herausfinden.',
		};
		
		$translateProvider
			.translations('en', enMessages )
			.translations('de', deMessages )
			.fallbackLanguage('en')
			.preferredLanguage('en')
// 			.useSanitizeValueStrategy('escape') // using this makes it impossible to use HTML (links, tooltips, etc.) in variable replacements
			;
	}])

	.factory('Arguments', function($http, $route, jsonData, util){
		var args = {}; 
		var statusStartValues = {
			entityType: "classes",
			activePage: 1,
			classesFilter: {
				label: "",
				relatedProperty: "",
				instances: [0, 4000000],
				subclasses: [0, 200000]
			},
			propertiesFilter: {
				label: "",
				statements: [0, 20000000],
				qualifiers: [0, 100000],
				references: [0, 100000],
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
					classesFilter: {
						label:  ($route.current.params.classlabelfilter) ? ($route.current.params.classlabelfilter) : status.classesFilter.label,
						relatedProperty: ($route.current.params.relatedpropertyfilter) ? ($route.current.params.relatedpropertyfilter) : status.classesFilter.relatedProperty,
						instances: [ ($route.current.params.instancesbegin) ? ($route.current.params.instancesbegin) : status.classesFilter.instances[0], ($route.current.params.instancesend) ? ($route.current.params.instancesend) : status.classesFilter.instances[1]],
						subclasses: [ ($route.current.params.instancesbegin) ? ($route.current.params.instancesbegin) : status.classesFilter.instances[0], ($route.current.params.subclassesend) ? ($route.current.params.subclassesend) : status.classesFilter.subclasses[1]],
					  },
					propertiesFilter: {
						label: ($route.current.params.propertylabelfilter) ? ($route.current.params.propertylabelfilter) : status.propertiesFilter.label,
						statements: [ ($route.current.params.statementsbegin) ? ($route.current.params.statementsbegin) : status.propertiesFilter.statements[0], ($route.current.params.statementsend) ? ($route.current.params.statementsend) : status.propertiesFilter.statements[1]],
						qualifiers: [ ($route.current.params.qualifiersbegin) ? ($route.current.params.qualifiersbegin) : status.propertiesFilter.qualifiers[0], ($route.current.params.qualifiersend) ? ($route.current.params.qualifiersend) : status.propertiesFilter.qualifiers[1]],
						references: [ ($route.current.params.referencesbegin) ? ($route.current.params.referencesbegin) : status.propertiesFilter.references[0], ($route.current.params.referencesend) ? ($route.current.params.referencesend) : status.propertiesFilter.references[1]],
						datatypes: ($route.current.params.datatypes) ? deserializeDatatype($route.current.params.datatypes) : status.propertiesFilter.datatypes
					  }

				}
				status.activePage = args.activePage;
				status.entityType = args.type;
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
				return location.origin + location.pathname + "#/browse" 
					+ "?activepage=" + status.activePage
					+ "&type=" + status.entityType
					+ "&classlabelfilter=" + status.classesFilter.label
					+ "&relatedpropertyfilter=" + status.classesFilter.relatedProperty
					+ "&propertylabelfilter=" + status.propertiesFilter.label 
					+ "&instancesbegin=" + status.classesFilter.instances[0]
					+ "&instancesend=" + status.classesFilter.instances[1]
					+ "&subclassesbegin=" + status.classesFilter.subclasses[0]
					+ "&subclassesend=" + status.classesFilter.subclasses[1]
					+ "&statementsbegin=" + status.propertiesFilter.statements[0]
					+ "&statementsend=" + status.propertiesFilter.statements[1]
					+ "&qualifiersbegin=" + status.propertiesFilter.qualifiers[0]
					+ "&qualifiersend=" + status.propertiesFilter.qualifiers[1]
					+ "&referencesbegin=" + status.propertiesFilter.references[0]
					+ "&referencesend=" + status.propertiesFilter.references[1]
					+ "&datatypes=" + serializeDatatype(status.propertiesFilter.datatypes);
			}
		}
	})

	.factory('Properties', function($http, $route, jsonData, util){
		var promise;
		var properties;
		var idArray;

		var getData = function(id, key, defaultValue) {
			try {
				var result = properties[id][key];
				if (typeof result !== 'undefined' && result !== null) {
					return result;
				}
			} catch(e){
				// fall through
			}
			return defaultValue;
		}

		var getLabel = function(id) { return getData(id, 'l', null); };
		var getLabelOrId = function(id) { return getData(id, 'l', 'P' + id); };
		var getUrl = function(id) { return "#/view?id=P" + id; };

		var getQualifiers = function(id){ return getData(id, 'qs', {}); };

		var getStatementCount = function(id){ return getData(id, 's', 0); };

		var sortProperties = function(comparator){idArray.sort(comparator(properties));};

		if (!promise) {
			promise = $http.get("data/properties.json").then(function(response){
				properties = response.data;
				idArray = util.createIdArray(properties);
				sortProperties(util.getSortComparator(jsonData.JSON_USES_IN_STATEMENTS, -1));
				return {
					propertiesHeader: [["Label (ID)", "col-xs-5", "fa fa-sort", jsonData.JSON_LABEL], 
						["Datatype", "col-xs-1", "fa fa-sort", jsonData.JSON_DATATYPE], 
						["Uses in statements", "col-xs-2", "fa fa-sort-desc", jsonData.JSON_USES_IN_STATEMENTS], 
						["Uses in qualifiers", "col-xs-2", "fa fa-sort", jsonData.JSON_USES_IN_QUALIFIERS], 
						["Uses in references", "col-xs-2", "fa fa-sort", jsonData.JSON_USES_IN_REFERENCES]],
					getProperties: function(){ return properties; },
					getIdArray: function() {return idArray; },
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
					getMainUsageCount: getStatementCount,
					getUrl: getUrl,
					getUrlPattern: function(id){ return getData(id, 'u', null); },
					getClasses: function(id){ return getData(id, 'pc', []); },
					sortProperties: sortProperties
				}
			});
		}
		return promise;
	})

	.factory('Classes', function($http, $route, jsonData, util) {
		var promise;
		var classes;
		var idArray; 

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

		var sortClasses = function(comparator){ idArray.sort(comparator(classes)); };

		if (!promise){
			promise = $http.get("data/classes.json").then(function(response){
				classes = response.data;
				idArray = util.createIdArray(classes);
				sortClasses(util.getSortComparator(jsonData.JSON_INSTANCES, -1));
				return {
					classesHeader: [["Label (ID)", "col-xs-9", "fa fa-sort", jsonData.JSON_LABEL],
						["Instances", "col-xs-1", "fa fa-sort-desc", jsonData.JSON_INSTANCES], 
						["Subclasses", "col-xs-1", "fa fa-sort", jsonData.JSON_SUBCLASSES]],
					getClasses: function(){ return classes; },
					getIdArray: function(){ return idArray; },
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
					getNonemptySubclasses: function(id){ return getData(id, 'sb', []); },
					sortClasses: sortClasses
				}
			});
		}
		return promise;
	})
	
	.factory('statistics', function($http, $route) {
		var promise;
		var statistics; 

		if (!promise){
			promise = $http.get("data/statistics.json").then(function(response){
				statistics = response.data;
				return {
					getDumpDateStamp: function(){ return statistics['dumpDate']; },
					getDumpDateString: function(){
						var dateStamp = statistics['dumpDate'];
						return dateStamp.substring(0,4) + '-' + dateStamp.substring(4,6) + '-' + dateStamp.substring(6,8);
					}
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
	      	return Math.ceil(Math.log(val) / Math.log(SCALE_FACTOR));
	      }
	      else {
	        return 0;
	      }
	    }
	    
	    var antiScale = function(val){
	      if (val > 0) {
	       	if ((Math.pow(SCALE_FACTOR, val) > 1) && (Math.pow(SCALE_FACTOR, val) < 1.5)){
	       		return 1;
	       	}
	        return Math.ceil(Math.pow(SCALE_FACTOR, val));
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
	        index: '=index', // TODO and startVal and endVal
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
