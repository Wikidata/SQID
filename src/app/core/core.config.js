'use strict'; // indicate that code is executed in strict mode

define([ // module definition dependencies
	'core/core.module', 
	'ngRoute'
], function() {


angular.module('core').config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'app/core/start.html'})
		.when('/about', { templateUrl: 'app/core/about.html' })
		.otherwise({redirectTo: '/'});
}]);

return {};}); // module definition end