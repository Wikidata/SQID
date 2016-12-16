//////// Module Definition ////////////
define([
	'angular',
	'ngAnimate', 
	'ngRoute',
	'jquery-ui',
	'ui-boostrap-tpls',
	'i18n/i18n.module',
	'util/util.module',
	'meta/meta.module',
	'entitySearch/entitySearch.module',
	'oauth/oauth.module'
], function() {
///////////////////////////////////////

angular.module('layout', [
	'ngAnimate', 'ngRoute', 'ui.bootstrap', 'pascalprecht.translate',
	'i18n',	'util', 'entitySearch', 'oauth', 'meta'
]);

return {}; }); // module definition end
