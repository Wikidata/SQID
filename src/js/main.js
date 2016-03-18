requirejs.config({
	"paths": {
		"lib": "../lib",

		"bootstrap": '../lib/bootstrap-3.3.6-dist/js/bootstrap',

		"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
		"jquery-ui": "//code.jquery.com/ui/1.11.4/jquery-ui",

		"angular": "//ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular",
		"ngAnimate": "//ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-animate",
		"ngRoute": "//ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-route"
	},
	shim: {
		'jquery-ui': ['jquery'],
		'bootstrap': ['jquery'],
		'angular': {
			exports: 'angular'
		},
		'ngAnimate': ['angular'],
		'ngRoute': ['angular'],

		'util': ['angular'],
		'paginationController': ['util'],

		'app': {
			deps: ['jquery-ui', 'bootstrap', 'ngAnimate', 'ngRoute', 'util']
		},

		'tableController': ['app'],
		'viewController': ['app']
	}
});


// Load the main app module to start the app
requirejs(['app', 'tableController', 'viewController'], function() {
	jQuery(function() {
		console.log('haz all filez, ready, actionz!');
		angular.bootstrap( document, ['classBrowserApp'] );
	});
});