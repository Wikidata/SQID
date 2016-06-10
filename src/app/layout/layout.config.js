//////// Module Definition ////////////
define([
	'layout.module',
	'layout.controller',
	'layout.directives'
], function() {
///////////////////////////////////////

angular.module('layout').config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.otherwise({redirectTo: '/'});
}]);

return {}; }); // module definition end