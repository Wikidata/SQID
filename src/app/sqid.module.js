'use strict'; // indicate that code is executed in strict mode

define([ // module definition dependencies
	'ngAnimate', 
	'ngRoute',
	'ngCookies',
	//'ngTranslate', // is (has to be?) loaded explicitly in main.js
	//'ngComplete',
	'util/util',
	'ui-boostrap-tpls', // implicit bootstrap
	'i18n/i18n.module',
	'core/core.module',
	// 'query/query'
], function() {

$("[data-toggle=popover]").popover({html:true});

var classBrowser = angular.module('sqid',[
	//'ngAnimate', 'ngRoute', 'ngCookies',  'ui.bootstrap', 'pascalprecht.translate', 'angucomplete-alt', 
	'core', 'i18n', //'utilities','queryInterface'
])


return {};}); // module definition end