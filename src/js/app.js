'use strict'; // indicate that code is executed in strict mode

$("[data-toggle=popover]").popover({html:true});

var classBrowser = angular.module('classBrowserApp', ['ngAnimate', 'ngRoute', 'utilities', 'ui.bootstrap', 'pascalprecht.translate', 'angucomplete-alt', 'queryInterface'])

	.config(function($routeProvider) {
		$routeProvider
			.when('/', {templateUrl: 'views/start.html'})
			.when('/browse', { templateUrl: 'views/browseData.html' })
			.when('/datatypes', { templateUrl: 'views/datatypes.html' })
			.when('/about', { templateUrl: 'views/about.html' })
			.when('/status', { templateUrl: 'views/status.html' })
			.when('/view', { templateUrl: 'views/view.html' })
			.when('/query', { templateUrl: 'views/queryview.html'})
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
				STAT_LINK: 'details',
				POWERED_BY: 'Powered by <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata Toolkit</a> &amp; <a href="https://query.wikidata.org/">Wikidata SPARQL Query</a>',
			},
			TABLE_HEADER: {
				LABEL: 'Label (ID)',
				DATATYPE: 'Datatype',
				USES_IN_STMTS: 'Uses in statements',
				USES_IN_QUALS: 'Uses in qualifiers',
				USES_IN_REFS: 'Uses in references',
				INSTATNCES: 'Instances',
				SUBCLASSES: 'Subclasses'
			},
			FILTER_MENUE: {
				LABEL_PLACEHOLDER: 'Filter labels',
				PROPERTY_PLACEHOLDER: 'Select property',
				CLASS_PLACEHOLDER: 'Select Class',
				FILTER_PROPERTY: 'Has Property',
				FILTER_SUPERCLASS: 'Has superclass',
				FILTER_DATATYPE: 'Select datatype',
				FILTER_REL_QUAL: 'Related qualifier properties',
				FILTER_USE_STMTS: 'Uses in statements',
				FILTER_USE_QUALS: 'Uses in qualifiers',
				FILTER_USE_REFS: 'Uses in references',
				FILTER_DIRECT_CLASS: 'Class (only direct)',
				FILTER_DIRECT_INS: 'Number of direct instances',
				FILTER_DIRECT_SUBCL: 'Number of direct subclasses',
				RESET_FILTERS: 'Reset Filters',
				PERMALINK: 'Link with filter states'	
			},
			ENTITIES: 'Entities',
			ENTITIES_COUNT: 'Total number of entities',
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
				WEBSITE: 'Official website',
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
				STAT_LINK: 'Details',
				POWERED_BY: 'Powered by <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata Toolkit</a> &amp; <a href="https://query.wikidata.org/">Wikidata SPARQL Query</a>',
			},
			TABLE_HEADER: {
				LABEL: 'Bezeichner (ID)',
				DATATYPE: 'Datentyp',
				USES_IN_STMTS: 'Verwendung für Aussagen',
				USES_IN_QUALS: 'Verwendung für Qualifikatoren',
				USES_IN_REFS: 'Verwendung in Referenzen',
				INSTATNCES: 'Instanzen',
				SUBCLASSES: 'Unterklassen'
			},
			FILTER_MENUE: {
				LABEL_PLACEHOLDER: 'Filter nach Bezeichnern',
				PROPERTY_PLACEHOLDER: 'Eigenschaft auswählen',
				CLASS_PLACEHOLDER: 'Klasse auswählen',
				FILTER_PROPERTY: 'Hat Eigenschaft',
				FILTER_SUPERCLASS: 'Hat Oberklasse',
				FILTER_DATATYPE: 'Datentyp auswählen',
				FILTER_REL_QUAL: 'Verwandte Qualifikatoren',
				FILTER_USE_STMTS: 'Verwendung für Aussagen',
				FILTER_USE_QUALS: 'Verwendung für Qualifikatoren',
				FILTER_USE_REFS: 'Verwendung in Referenzen',
				FILTER_DIRECT_CLASS: 'Klasse (nur direkte Klassenbeziehung)',
				FILTER_DIRECT_INS: 'Anzahl direkter Instanzen',
				FILTER_DIRECT_SUBCL: 'Anzahl direkter Unterklassen',
				RESET_FILTERS: 'Filter zurücksetzen',
				PERMALINK: 'Permanentlink (inkl. Filter Positionen)'	
			},
			ENTITIES: 'Entitäten',
			ENTITIES_COUNT: 'Gesamtzahl an Entitäten',
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
			INSTANCE_OF_PHRASE: '{{entity}} ist eine Instanz von {{classes}}',
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
				WEBSITE: 'Offizielle Website',
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
		var nbMessages = {
			NAV: {
				PROPERTIES: 'Egenskaper',
				CLASSES: 'Klasser',
				START: 'Start',
				ABOUT: 'Om',
			},
			FOOTER: {
				STAT_DATE: 'Statistikk basert på datadump fra {{date}}',
				STAT_LINK: 'detaljer',
				POWERED_BY: 'Drevet av <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata Toolkit</a> &amp; <a href="https://query.wikidata.org/">Wikidata SPARQL Query</a>',
			},
			PROPTYPE : 'Type',
			FURTHER_RESULTS: '&hellip; flere resultater',
			STATEMENTS: {
				PREFERRED_HINT: 'Dette er et foretrukket utsagn',
				DEPRECATED_HINT: 'Dette er et utdatert utsagn',
				NO_VALUE: 'ingen verdi',
				SOME_VALUE: 'uspesifisert verdi',
				MORE_STATEMENTS: 'vis {{number}} flere utsagn',
				LESS_STATEMENTS: 'skjul {{number}} utsagn'
			},
			TYPICAL_PROPS : {
				TYPICAL_PROPS : 'Typiske egenskaper',
				HINT_PROP : 'Andre egenskaper som ofte er brukt av elementer med denne egenskapen',
				HINT_CLASS : 'Andre egenskaper som ofte er brukt av direkte og indirekte forekomster av denne klassen',
				NONE : 'ingen',
			},
			INSTANCE_OF_PHRASE: '{{entity}} er en/et {{classes}}',
			NO_INSTANCE_OF_PHRASE: '{{entity}} er ikke en forekomst av noen annen klasse',
			SUBCLASS_OF_PHRASE: 'enhver(t) {{entity}} er også en/et {{classes}}',
			NO_SUBCLASS_OF_PHRASE: '{{entity}} er ikke en underklasse av noen annen klasse',
			SUBPROPERTY_OF_PHRASE: 'enhver {{entity}} er også en/et {{properties}}',
			NO_SUBPROPERTY_OF_PHRASE: '{{entity}} er ikke en underegenskap av noen annen egenskap',
			SEC_CLASSIFICATION : {
				SEC_CLASSIFICATION : 'Klassifikasjon',
				DIRECT_SUBCLASSES: 'Direkte underklasser',
				NO_DIRECT_SUBCLASSES: 'ingen',
				LOADING_DIRECT_SUBCLASSES: 'Henter direkte underklasser &hellip;',
				DIRECT_SUBCLASSES_INSTANCE: 'Med forekomster',
				INSTANCE_SUBCLASSES_HINT: 'Direkte underklasser som har forekomster, sammen med antallet direkte og indirekte forekomster',
				DIRECT_SUBCLASSES_SUBCLASS: 'Med underklasser',
				SUBCLASS_SUBCLASSES_HINT: 'Direkte underklasser som har underklasser, sammen med antallet direkte og indirekte underklasser',
				DIRECT_SUBCLASSES_ALL: 'Alle',
				DIRECT_SUPERCLASSES: 'Direkte overklasser',
				NO_DIRECT_SUPERCLASSES: 'ingen',
				ALL_SUBCLASSES: 'Alle underklasser',
				ALL_SUBCLASSES_HINT: 'Antall unike direkte og indirekte underklasser',
			},
			SEC_INSTANCES : {
				SEC_INSTANCES : 'Forekomster',
				DIRECT_INSTANCES : 'Direkte forekomster',
				ALL_INSTANCES : 'Alle forekomster',
				ALL_INSTANCES_HINT : 'Totalt antall unike forekomster av denne klassen og dens {{subclassCount}} direkte og indirekte underklasser',
				NO_DIRECT_INSTANCES: 'Ingen direkte forekomster ble funnet. Kanskje dataene nylig har blitt endret. Vi henter snart oppdaterte data.',
				LOADING_DIRECT_INSTANCES: 'Henter direkte forekomster &hellip;',
			},
			SEC_HUMAN_RELATIONS: 'Menneskelige relasjoner',
			SEC_IDENTIFIERS: 'Identifikatorer',
			SEC_LINKS : {
				SEC_LINKS : 'Lenker',
				WIKIDATA : 'Wikidata-side',
				WEBSITE: 'Offisielt nettsted',
				REASONATOR : 'Reasonator',
			},
			SEC_PROP_USE : {
				SEC_PROP_USE : 'Egenskapsbruk',
				ENTITIES: 'Entiteter',
				ENTITIES_HINT: 'Entiteter med utsagn for denne egenskapen',
				NO_ENTITIES: 'Ingen entiteter ble funnet. Kanskje dataene nylig har blitt endret. Vi henter snart oppdaterte data.',
				LOADING_ENTITIES: 'Henter entiteter &hellip;',
				VALUES: 'Verdier',
				VALUES_HINT: 'Verdier brukt i utsagn med denne egenskapen',
				STATEMENTS: 'Utsagn',
				STATEMENTS_PER_ENTITY: '({{number}} per entitet)',
				STATEMENTS_HINT: 'Antall utsagn for denne egenskapen',
				QUALIFIERS: 'Kvalifikatorer',
				QUALIFIERS_HINT: 'Andre egenskaper som er brukt som kvalifikatorer for denne egenskapen, sammen med antall brukstilfeller',
				QUALIFIER_USES: 'Brukt som kvalifikator',
				REFERENCE_USES: 'Brukt i referanser',
			},
			SEC_STATEMENTS : 'Utsagn',
			SEC_MEDIA : 'Media',
			SEC_WIKIMEDIA_PAGES : 'Wikimedia-kategorier og -portaler',
			NOSUCHENTITY_HEADLINE: 'Beklager, fant ikke noen entitet med ID "{{id}}".',
			NOSUCHENTITY_BODY: 'Kanskje den har blitt slettet. Kanskje den aldri eksisterte. Kanskje vi aldri får vite hvorfor.',
		};

		$translateProvider
			.translations('en', enMessages )
			.translations('de', deMessages )
			.translations('nb', nbMessages )
			.fallbackLanguage('en')
			.preferredLanguage('en')
// 			.useSanitizeValueStrategy('escape') // using this makes it impossible to use HTML (links, tooltips, etc.) in variable replacements
			;
	}])

	.factory('Arguments', function($http, $route, util){
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
						+ (status.propertiesFilter.references[1] != 10000000	 ? "&referencesend=" + status.propertiesFilter.references[1] : "")
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
	})

	.factory('Properties', function($http, $route, util, Arguments){
		var promise;
		var properties;
		var idArray;

		var sortedIdArrays = {
			label: [],
			datatype: [],
			statements: [],
			references: []
		};
		var sorting = {
			category: "statements",
			direction: -1
		};

		Arguments.refreshArgs();
		var status = Arguments.getStatus();
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

		var getSortedIdArray = function(){
			var array = sortedIdArrays[sorting.category];
			if (sorting.direction == 1){
				return array;
			}else{
				return util.reverseDeepCopy(array);
			}
		}

		var getSortCriteria = function(){
			return [[status.sortCriteria.properties.label, "l", "label"], 
				[status.sortCriteria.properties.datatype, "d", "datatype"], 
				[status.sortCriteria.properties.statements, "s", "statements"], 
				[status.sortCriteria.properties.qualifiers, "q", "qualifiers"],
				[status.sortCriteria.properties.references, "e", "references"]];
		}

		var updateSorting = function(sortCriteria){
			for (var i=0; i < sortCriteria.length; i++){
				if (sortCriteria[i][0] != "fa fa-sort"){
					sorting.category = sortCriteria[i][2];
					sorting.direction = sortCriteria[i][0] == "fa fa-sort-asc" ? 1 : -1;
				}
			}
		}

		if (!promise) {
			promise = $http.get("data/properties.json").then(function(response){
				properties = response.data;
				idArray = util.createIdArray(properties);
				var sortCriteria = getSortCriteria();

				var sortIdArray = function(comparator, category){
					sortedIdArrays[category] = util.cloneObject(idArray);
					sortedIdArrays[category].sort(comparator(properties));
				};

				for (var i=0; i < sortCriteria.length; i++){
					sortIdArray(util.getSortComparator(sortCriteria[i][1], 1), sortCriteria[i][2]);
				}
				updateSorting(sortCriteria);

				return {
					propertiesHeader: [["TABLE_HEADER.LABEL", "col-xs-5", sortCriteria[0][0], function(status, value){status.sortCriteria.properties.label = value}], 
						["TABLE_HEADER.DATATYPE", "col-xs-1", sortCriteria[1][0], function(status, value){status.sortCriteria.properties.datatype = value}], 
						["TABLE_HEADER.USES_IN_STMTS", "col-xs-2", sortCriteria[2][0], function(status, value){status.sortCriteria.properties.statements = value}], 
						["TABLE_HEADER.USES_IN_QUALS", "col-xs-2", sortCriteria[3][0], function(status, value){status.sortCriteria.properties.qualifiers = value}], 
						["TABLE_HEADER.USES_IN_REFS", "col-xs-2", sortCriteria[4][0], function(status, value){status.sortCriteria.properties.references = value}]],
					getProperties: function(){ return properties; },
					getIdArray: getSortedIdArray,
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
					sortProperties: function() { updateSorting(getSortCriteria()); }
				}
			});
		}
		return promise;
	})

	.factory('Classes', function($http, $route, util, Arguments) {
		var promise;
		var classes;
		var idArray;

		var sortedIdArrays = {
			label: [],
			instances: [],
			subclasses: []
		};
		var sorting = {
			category: "instances",
			direction: -1
		};

		Arguments.refreshArgs();
		var status = Arguments.getStatus();
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

		var getSortedIdArray = function(){
			var array = sortedIdArrays[sorting.category];
			if (sorting.direction == 1){
				return array;
			}else{
				return util.reverseDeepCopy(array);
			}
		}

		var getSortCriteria = function(){
			return [[status.sortCriteria.classes.label, "l", "label"], 
				[status.sortCriteria.classes.instances, "i", "instances"], 
				[status.sortCriteria.classes.subclasses, "s", "subclasses"]];
		}

		var updateSorting = function(sortCriteria){
			for (var i=0; i < sortCriteria.length; i++){
				if (sortCriteria[i][0] != "fa fa-sort"){
					sorting.category = sortCriteria[i][2];
					sorting.direction = sortCriteria[i][0] == "fa fa-sort-asc" ? 1 : -1;
				}
			}
		}

		if (!promise){
			promise = $http.get("data/classes.json").then(function(response){
				classes = response.data;
				idArray = util.createIdArray(classes);
				var sortCriteria = getSortCriteria();

				var sortIdArray = function(comparator, category){
					sortedIdArrays[category] = util.cloneObject(idArray);
					sortedIdArrays[category].sort(comparator(classes));
				};

				for (var i=0; i < sortCriteria.length; i++){
					sortIdArray(util.getSortComparator(sortCriteria[i][1], 1), sortCriteria[i][2]);
				}
				updateSorting(sortCriteria);

				return {
					classesHeader: [["TABLE_HEADER.LABEL", "col-xs-9", sortCriteria[0][0], function(status, value){status.sortCriteria.classes.label = value}],
						["TABLE_HEADER.INSTATNCES", "col-xs-1", sortCriteria[1][0], function(status, value){status.sortCriteria.classes.instances = value}], 
						["TABLE_HEADER.SUBCLASSES", "col-xs-1", sortCriteria[2][0], function(status, value){status.sortCriteria.classes.subclasses = value}]],
					getClasses: function(){ return classes; },
					getIdArray: getSortedIdArray,
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
					sortClasses: function(){ updateSorting(getSortCriteria()); }
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
					},
					getDumpDate:  function(){
						var dateStamp = statistics['dumpDate'];
						var month = parseInt(dateStamp.substring(4,6)) - 1;
						return new Date(dateStamp.substring(0,4), month, dateStamp.substring(6,8));
					},
					getPropertyUpdateTime: function() {
						return new Date(statistics['propertyUpdate']);
					},
					getClassUpdateTime: function() {
						return new Date(statistics['classUpdate']);
					},
					getEntityCount: function() {
						return statistics['entityCount'];
					},
					getSiteLinkCount: function() {
						return statistics['siteLinkCount'];
					},
					getItemStatistics: function() {
						return statistics['itemStatistics'];
					},
					getPropertyStatistics: function() {
						return statistics['propertyStatistics'];
					},
					getSites: function() {
						return statistics['sites'];
					},
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
