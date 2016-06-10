//////// Module Definition ////////////
define([
	'browse/browse.module',
	'browse/arguments.service',
	'browse/table.controller'
], function() {
///////////////////////////////////////

angular.module('browse').config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/browse', {templateUrl: 'app/browse/browse.html'});
}]);


return {}; }); // module definition end