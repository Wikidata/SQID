//////// Module Definition ////////////
define([
	'search/search.module',
	'util/util.service',
	'i18n/i18n.service',
	'i18n/translate.config'
], function() {
///////////////////////////////////////

angular.module('search').factory('wikidataSearch', [
'$translate', 'i18n', 'util',
function($translate, i18n, util){

	return {};

}]);

return {}; }); // module definition end
