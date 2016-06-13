//////// Module Definition ////////////
define([
	'layout/layout.module',
	'layout/layout.controller',
	'layout/layout.directives'
], function() {
///////////////////////////////////////

angular.module('layout').config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.otherwise({redirectTo: '/'});
}]);

return {}; }); // module definition end