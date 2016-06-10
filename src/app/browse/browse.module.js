//////// Module Definition ////////////
define([
	'core/core.module',
	'i18n/i18n.service',
	'util/util.module',
	'data/data.module',
	'ngComplete'
], function() {
///////////////////////////////////////

angular.module('browse', [
	'ngRoute', 
	'data', 'util', 'i18n', 'angucomplete-alt'
]);


return {}; }); // module definition end