define([ // module definition dependencies
	'core/core.module',
	'data/data.module', 
	'util/util',
	//'ngTranslate', // is (has to be?) loaded explicitly in main.js
	'ngCookies',				//
	'ngTranslate-core',			// cannot for the life of me sort out the 
	'ngTranslate-loader',		// dependency in a way that the bundle will
	'ngTranslate-storage-cook',	// execute in the right order when optimized
	'ngTranslate-storage-loc',	// unless loading in this order explicitly
], function() {

// require([
	
// ], function() { console.log('ngTranslate loaded'); 

	angular.module('i18n', ['core', 'utilities', 'pascalprecht.translate']);
	console.log('i18n module defined');
	require([
		'i18n/translate.config',
		'i18n/i18n.service'
	], function() { console.log('rest of i18n loaded'); } );
// });

return {};}); // module definition end