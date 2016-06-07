//////// Module Definition ////////////
define([
	'core/core.module',
	'i18n/i18n.service',
	'util/util.module',
	'util/pagination.controller',
	'data/data.module'
], function() {
///////////////////////////////////////

angular.module('browse', [
	'ngRoute', 
	'data', 'util', 'i18n'
]);


return {}; }); // module definition end