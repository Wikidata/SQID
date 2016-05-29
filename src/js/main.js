requirejs.config({
	baseUrl: './js',
	"paths": {

		"jquery": "../lib/jquery",
		"jquery-ui": "../lib/jquery-ui",
		"bootstrap": '../lib/bootstrap-3.3.6-dist/js/bootstrap',
		
		"spin": "../lib/spin",

		"angular": "../lib/angular",
		"ngAnimate": "../lib/angular-animate",
		"ngRoute": "../lib/angular-route",
		"ngCookies": "../lib/angular-cookies",
		"ngTranslate-core": "../lib/angular-translate",
		"ngTranslate-loader": "../lib/angular-translate-loader-static-files",
		"ngTranslate-storage-cook": "../lib/angular-translate-storage-cookie",
		"ngTranslate-storage-loc": "../lib/angular-translate-storage-local",
		"ngComplete": "../lib/angucomplete-alt",
		"ui-boostrap-tpls": "../lib/ui-bootstrap-tpls-1.3.2"
	},
	shim: {
		'jquery-ui': ['jquery'],
		'bootstrap': ['jquery'],
		'ui-boostrap-tpls' : ['bootstrap', 'angular'],

		'angular': {
			exports: 'angular',
			deps: ['jquery']
		},
		'ngAnimate': ['angular'],
		'ngRoute': ['angular'],
		'ngCookies': ['angular'],
		'ngTranslate-core': ['angular'],
		'ngTranslate-loader': ['ngTranslate-core'],
		'ngTranslate-storage-cook': ['ngTranslate-core', 'ngCookies'],
		'ngTranslate-storage-loc': ['ngTranslate-storage-cook'],
		'ngComplete': ['angular']
	}
});


// Load everything, start the app 
requirejs([
	'ngCookies',				//
	'ngTranslate-core',			// cannot for the life of me sort out the 
	'ngTranslate-loader',		// dependency in a way that the bundle will
	'ngTranslate-storage-cook',	// execute in the right order when optimized
	'ngTranslate-storage-loc',	// unless loading in this order explicitly

	'jquery-ui',
	'app/browse',		// everything else
	'app/view', 		// is implicitly
	'app/translate',	// pulled via
	'util/directives',	// dependencies
	'query/query'
	
], function() {
	jQuery(function() {
		//console.log('haz all filez, ready, acshionz!');
		angular.bootstrap( document, ['classBrowserApp'], { strictDi: true } );
	});
});