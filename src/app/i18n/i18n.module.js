define([ // module definition dependencies
	// 'core/core.module',
	'data/data.module', 
	// 'util/util',

	'ngCookies',				//
	'ngTranslate-core',			// cannot for the life of me sort out the 
	'ngTranslate-loader',		// dependency in a way that the bundle will
	'ngTranslate-storage-cook',	// execute in the right order when optimized
	'ngTranslate-storage-loc',	// unless loading in this order explicitly
], function() {


angular.module('i18n', [
	'ngCookies', 'pascalprecht.translate',
	'util'
]);// require([
// 	'i18n/translate.config',
// 	'i18n/i18n.service'
// ]);
	

return {};}); // module definition end