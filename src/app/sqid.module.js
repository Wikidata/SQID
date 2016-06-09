'use strict'; // indicate that code is executed in strict mode

define([ // sqid application wrapper module
	'layout/layout.directives',
	
	// config blocks must register before bootstrap
	'core/core.config',
	'i18n/i18n.config',
	'meta/meta.config',
	'browse/browse.config',
	'view/view.config',
	'query/sparqly.config'
], function() {

$("[data-toggle=popover]").popover({html:true}); // <-- is this in use?


angular.module('sqid',[						// the application wrapper module

	'data', 'i18n', 'util', 'layout',				// shared modules
	
	'core', 'meta', 'browse', 'view', 'sparqly'		// feature / content modules
]); 

return {};}); // module definition end