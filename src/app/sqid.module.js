'use strict'; // indicate that code is executed in strict mode

define([ // module definition dependencies
	'ngAnimate', 
	'ngRoute',
	'ngCookies',
	//'ngTranslate', // is (has to be?) loaded explicitly in main.js
	//'ngComplete',
	// 'util/util',
	'ui-boostrap-tpls', // implicit bootstrap
	'i18n/i18n.module',
	//'core/core.module',
	// 'query/query'
	// 'i18n/i18n.service',
	'browse/browse.module',
	'browse/arguments.service',
	'browse/table.controller',
	// 'ngCookies',				//
	// 'ngTranslate-core',			// cannot for the life of me sort out the 
	// 'ngTranslate-loader',		// dependency in a way that the bundle will
	// 'ngTranslate-storage-cook',	// execute in the right order when optimized
	// 'ngTranslate-storage-loc',	// unless loading in this order explicitly

	// config blocks must register before bootstrap
	'core/core.config',
	'i18n/translate.config',
	'layout/layout.module',
	'layout/layout.directives',
	'meta/meta.config'

], function() {

$("[data-toggle=popover]").popover({html:true});

var classBrowser = angular.module('sqid',[
	// 'ngCookies', //'ngAnimate', 'ngRoute', 'ngCookies',  'ui.bootstrap', 'pascalprecht.translate', 'angucomplete-alt', 
	'core', 'data', 'i18n', 'util',//,'queryInterface'
	'browse', 'layout'
]); //.controller('Foo', ['$translate', function(i18n) {
// 	console.log(i18n);
// 	angular.transalat = i18n;
// } ]);
// require(['i18n/translate.config']);

// angular.module('core').config(['$routeProvider', function($routeProvider) {
// 		$routeProvider
			
// 			.when('/browse', { templateUrl: 'views/browseData.html' });
// 			// .when('/datatypes', { templateUrl: 'views/datatypes.html' })
// 			//.when('/about', { templateUrl: 'app/core/about.html' })
// 			// .when('/status', { templateUrl: 'views/status.html' })
// 			// .when('/view', { templateUrl: 'views/view.html' })
// 			// .when('/query', { templateUrl: 'views/queryview.html'})
// 			//.otherwise({redirectTo: '/'});
// 	}]);

return {};}); // module definition end