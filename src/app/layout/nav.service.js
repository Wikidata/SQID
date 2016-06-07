//////// Module Definition ////////////
define([
	'angular',
	'ngRoute'
], function() {
///////////////////////////////////////

/**
 * service for registering pages in the navigation 
 * pages are objects of format 
 * {
 * 		"label": "TRANSLATE.ID",
 *		"href": "#/page?parm=any"
 * }
 */
angular.module('layout').factory('nav', [function() {

	return {
		links: [],
		registerPage: function(page) {
			links.push(page);
		}
	}

}]);



return {}; }); // module definition end