//////// Module Definition ////////////
define([
	'util/util.module'
], function() {
///////////////////////////////////////

angular.module('util').directive('tableSizeSelector', function() {
	return {
		templateUrl: 'app/util/pagination.tableSizeSelector.tpl.html',
		restrict: 'E'
	};
});


return {}; }); // module definition end