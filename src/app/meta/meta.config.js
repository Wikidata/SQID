//////// Module Definition ////////////
define([
	'meta/meta.module',
	'meta/statistics.service',
	'meta/statistics.controller'
], function() {
///////////////////////////////////////

angular.module('meta').config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'app/meta/start.html'})
		.when('/about', { templateUrl: 'app/meta/about.html' })
		.when('/status', { templateUrl: 'app/meta/statistics.html' });
}]);

return {}; }); // module definition end