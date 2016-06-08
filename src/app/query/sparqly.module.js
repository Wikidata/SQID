//////// Module Definition ////////////
define([
	'angular',
	'ngRoute',
	'util/util.module',
	'data/data.module',
	'i18n/i18n.module',
], function() {
///////////////////////////////////////


angular.module('sparqly', [
	'ngRoute', 
	'data', 'util', 'i18n'
]);

return {};}); // module definition end