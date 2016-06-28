//////// Module Definition ////////////
define([
	'util/util.module'
], function() {
///////////////////////////////////////

angular.module('util')

/////////////////////////////////////////////////////
/////     widget for selecting number of entities //	
//// 								    per page //		*  customize proposed options like
/// use like								    //	    * $scope.pagination.tableSizeOpts = [15,25,50,100];
// <table-size-selector></table-size-selector> //
////////////////////////////////////////////////
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

}])

//////////////////////////////////////////////////////////
//// 	  displays active index range of current page  //
/// use like										  //
// <pagination-index-range></pagination-index-range> //
// ///////////////////////////////////////////////////
.directive('paginationIndexRange', [function(){
	return {
		controller: ['$scope', function($scope) {
		 	var pgnt = $scope.$parent.pagination;
		 	$scope.getFrom = function() { return '<span class="info-badge">' + pgnt.fromItem; }
		 	$scope.getTo = function() { return pgnt.toItem + '</span>';	}
		 	$scope.getTotal = function() { return '<span class="info-badge">' + pgnt.numItems + '</span>'; 	}

		}],
		template: '<div class="pagination-nav-caption" ' + 
				'translate="PAGINATION.ACTIVE_INDEX_CAPTION_TEXT" ' +
				'translate-values=\'{ to: getTo(), from: getFrom(), total: getTotal() }\' ' + 
				'translate-compile> ' +
			'</div>',
		restrict: 'E'
	};
}]);


return {}; }); // module definition end