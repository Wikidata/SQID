//////// Module Definition ////////////
define([
	'ngRoute',
	'meta/meta.module',
	'meta/statistics.service',
	'meta/statistics.controller'
], function() {
///////////////////////////////////////

angular.module('meta').config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/status', { templateUrl: 'app/meta/statistics.html' });
}]);

return {}; }); // module definition end