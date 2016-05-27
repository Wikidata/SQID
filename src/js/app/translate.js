//////// Module Definition ////////////
define([
  'app/app', // pulls angular, ngroute and utilties
], function() {
///////////////////////////////////////

angular.module('classBrowserApp').config(['$translateProvider', function ($translateProvider) {

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
}]);


return {}; // module
});		  // definition end