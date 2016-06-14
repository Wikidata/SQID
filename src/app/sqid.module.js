'use strict'; // indicate that code is executed in strict mode

/////////////////////////////////////////////////////////////////////////
define([ // sqid application wrapper module

	// Note: The *.config files wrap up their respective modules 
	// and do initial setup work, so they are convenient
	// 'all components of that module'-dependencies

	'layout/layout.config',	// the body template, pulls in some application wide dependencies
	'i18n/i18n.config',		// localisation module
	'meta/meta.config',		// pages about pages, like start about and statistics
	'browse/browse.config',	// wikidata classes and properties browser
	'view/view.config',		// wikidata entity viewer
	'query/sparqly.config',	// sparql query generator interface
	'search/search.config' // search field

], function() {
/////////////////////////////////////////////////////////////////////////

$("[data-toggle=popover]").popover({html:true}); // <-- is this in use?


angular.module('sqid',[						// the application wrapper module

	'data', 'i18n', 'util', 'layout', 'search',	// shared modules
	
	'meta', 'browse', 'view', 'sparqly'		// feature / content modules
]); 

return {};}); // module definition end
