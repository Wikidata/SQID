//////// Module Definition ////////////
define([
	'angular',
	'ngAnimate', 
	'ngRoute',
	'jquery-ui',
	'ui-boostrap-tpls',
	'meta/meta.module',
	'entitySearch/entitySearch.module'
], function() {
///////////////////////////////////////

angular.module('layout', [
	'ngAnimate', 'ngRoute', 'ui.bootstrap', 'pascalprecht.translate',
	'meta'
]);

return {}; }); // module definition end
