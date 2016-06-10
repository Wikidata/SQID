//////// Module Definition ////////////
define([
	'util/util.module',
], function() {
///////////////////////////////////////

angular.module('util').filter('to_trusted', ['$sce', function($sce){
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

return {}; }); // module definition end