//////// Module Definition ////////////
define([
	'angular',
	'ngRoute',
	'util/util.module',
	'i18n/i18n.module',
	'data/data.module'
], function() {
///////////////////////////////////////

angular.module('view', [
	'ngRoute',
	'util', 'i18n', 'data'
]);

return {};}); // module definition end