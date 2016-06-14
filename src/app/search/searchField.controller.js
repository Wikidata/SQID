//////// Module Definition ////////////
define([
	'search/search.module',
	'search/wikidataSearch.service',
	'util/util.service',
	'i18n/i18n.service',
	'i18n/translate.config'
], function() {
///////////////////////////////////////

angular.module('search').controller('searchField', [
'$scope', '$translate', 'wikidataSearch', 'i18n', 'util',
function($scope, $translate, i18n, wikidataSearch, util){
	$scope.localSearch = function(){

	}
	$scope.searchEntity = function(){
		console.log("CALL search");
	}
  }]);

return {}; }); // module definition end
