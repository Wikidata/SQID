define([ // module definition dependencies
	'data/data.module', 
	'util/util.module',

	'ngRoute',
	'ngCookies',
	'ngTranslate-core',
	'ngTranslate-loader',
	'ngTranslate-storage-cook',
	'ngTranslate-storage-loc'
], function() {


angular.module('i18n', [
	'ngRoute', 'ngCookies', 'pascalprecht.translate',
	'util', 'data'
]);	

return {};}); // module definition end