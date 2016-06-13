//////// Module Definition ////////////
define([
	'view/view.module',
	'view/view.service',
	'view/view.controller'
], function() {
///////////////////////////////////////

angular.module('view').config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/view', {templateUrl: 'app/view/view.html'});
}]);;

return {};}); // module definition end