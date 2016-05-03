requirejs.config({
	"paths": {
		"lib": "../lib",

		"bootstrap": '../lib/bootstrap-3.3.6-dist/js/bootstrap',
		"ui-boostrap-tpls": "../lib/ui-bootstrap-tpls-1.2.5.min",

		"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
		"jquery-ui": "//code.jquery.com/ui/1.11.4/jquery-ui",

		"angular": "//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular",
		"ngAnimate": "//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-animate",
		"ngRoute": "//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-route",
		"ngTranslate": "../lib/angular-translate.min",
		"ngComplete": "../lib/angucomplete-alt.min"
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
		'ngComplete': ['angular'],

		'util': ['angular'],
		'paginationController': ['util'],

		'app': {
			deps: ['jquery-ui', 'ui-boostrap-tpls', 'bootstrap', 'ngAnimate', 'ngRoute', 'util', 'ngTranslate', 'ngComplete']
		},

		'tableController': ['app'],
		'viewController': ['app'],
		'statController': ['app']
	}
});


// Load the main app module to start the app
requirejs(['app', 'tableController', 'viewController', 'statController', 'paginationController'], function() {
	jQuery(function() {
		console.log('haz all filez, ready, actionz!');
		angular.bootstrap( document, ['classBrowserApp'] );
	});
});