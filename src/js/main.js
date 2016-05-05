requirejs.config({
	"paths": {
		//"lib": "../lib",

		//"bootstrap": '../lib/bootstrap-3.3.6-dist/js/bootstrap',
		"bootstrap": '//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min',
		"ui-boostrap-tpls": "../lib/ui-bootstrap-tpls-1.2.5.min",

		"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
		"jquery-ui": "//code.jquery.com/ui/1.11.4/jquery-ui",

		"spin": "//fgnass.github.io/spin.js/spin.min",

		"angular": "//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular",
		"ngAnimate": "//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-animate",
		"ngRoute": "//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-route",
		//"ngTranslate": "../lib/angular-translate.min",
		"ngTranslate": "//cdnjs.cloudflare.com/ajax/libs/angular-translate/2.10.0/angular-translate.min",

		// https://cdnjs.cloudflare.com/ajax/libs/angular-translate/2.10.0/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js
		
		//"ngComplete": "../lib/angucomplete-alt.min",
		"ngComplete": "//cdn.jsdelivr.net/angucomplete-alt/2.4.1/angucomplete-alt.min"
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

		'util': ['angular', 'spin'],
		'paginationController': ['util'],
		'queryInterface': ['angular'],

		'app': {
			deps: ['jquery-ui', 'ui-boostrap-tpls', 'bootstrap', 'spin', 'ngAnimate', 'ngRoute', 'ngTranslate', 'ngComplete',
					'util', 'paginationController', 'queryInterface']
		},

		'tableController': ['app'],
		'viewController': ['app'],
		'statController': ['app']
	}
});


// Load the main app module to start the app
requirejs(['app', 'tableController', 'viewController', 'statController'], function() {
	jQuery(function() {
		console.log('haz all filez, ready, actionz!');
		angular.bootstrap( document, ['classBrowserApp'], { strictDi: true } );
	});
});