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
		"ngTranslate": "../lib/angular-translate",
		// TODO - lazy loader for language definition files:
		// https://cdnjs.cloudflare.com/ajax/libs/angular-translate/2.10.0/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js
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
		'ngTranslate': ['angular'],
		'ngComplete': ['angular']
	}
});


// Load everything, start the app 
requirejs([
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