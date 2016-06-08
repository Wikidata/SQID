//////// Module Definition ////////////
define([
	'query/sparqly.module',
	'query/queryIS.service',
	'query/query.controller'
], function() {
///////////////////////////////////////

angular.module('sparqly').config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/query', {
		'templateUrl': 'app/query/query.html',
		'controller': 'QueryController'
	}); 
}]); 
return {};}); // module definition end