requirejs.config({
	baseUrl: './app',
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
		"ui-boostrap-tpls": "../lib/ui-bootstrap-tpls-1.3.2",
		"openLayers": "../lib/openlayers/OpenLayers",
        "angular-loading-bar": "../lib/loading-bar.min"
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
		'ngComplete': ['angular'],
        'angular-loading-bar': ['ngAnimate']
	}
});


// Load everything, start the app
requirejs([ 'sqid.module', 'angular-loading-bar'], function() {
	jQuery(function() {
		angular.bootstrap( document, ['sqid', 'angular-loading-bar'], { strictDi: true } );
	});
});
