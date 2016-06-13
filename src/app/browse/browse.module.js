//////// Module Definition ////////////
define([
	'angular',
	'ngRoute',
	'ngComplete',
	'i18n/i18n.service',
	'util/util.module',
	'data/data.module'
], function() {
///////////////////////////////////////

angular.module('browse', [
	'ngRoute', 'angucomplete-alt',
	'data', 'util', 'i18n'
]);

return {}; }); // module definition end