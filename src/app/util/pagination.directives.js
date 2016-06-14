//////// Module Definition ////////////
define([
	'util/util.module'
], function() {
///////////////////////////////////////

angular.module('util')

/////////////////////////////////////////////////
///// widget for selecting number of entities //
//// 								per page //
/// use like								//
// <tableSizeSelector></tableSizeSelector> //
////////////////////////////////////////////
.directive('tableSizeSelector', function() {
	return {
		templateUrl: 'app/util/pagination.tableSizeSelector.tpl.html',
		restrict: 'E'
	};
})

///////////////////////////////////////////////////
//// 						pagination nav bar  //
/// use like								   //
// <nav pagination="$scope.pagination"></nav> //
///////////////////////////////////////////////
.directive('pagination', [function() {
	return {
		scope: {
			pgnt: '<pagination'
		},
		templateUrl: 'app/util/pagination.pageNav.tpl.html',
		restrict: 'A'
	};

}]);


return {}; }); // module definition end