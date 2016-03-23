/** 
	Pagination Controller quick usage documentation
	-----------------------------------------------

	the controller exposes the pagination object to its own and the parent $scope.

	Setting (and updating) the data for pagination:
	>	pagination.setIndex(hasToBeAnArray);

	Customizing configuration:
		in parent scope assign
	>	$scope.pagination = { tableSize: 1, pageSelectorSize: 100, activePage: 5 }; 
		(all properties optional)

	Set page manually
	>	$scope.pagination.setPage(int);

	callback on page change
	>	$scope.pagination.onPageChange = functionHandle; (or anonymous function definition)
			in the callback function you will have the pagination object as this and the array of items on the current page as 
			first parameter (which is more for writing convenience since it's the same as this.activeIndex alias $pagination.activeIndex)
		useful if you want to do something in your parent controller whenever the page changes (e.g. lazy loading of live data for just the visible items)
	

	Template Example
 		<div ng-controller="PaginationController">
 			<table class="table table-condensed">
				<tbody>
					<tr ng-repeat="entity in pagination.activeIndex">
						<td>{{entity.someProperty}}</td>
						<td>{{entity.someOtherProperty}}</td>
					</tr>
				</tbody>
			</table>
			<div>Items {{pagination.fromItem}} - {{pagination.toItem}} of {{pagination.numItems}}</div>
			<nav>																							<!-- (different variants for ngClass:) -->
				<ul class="pagination">
					<li ng-class="{ disabled: pagination.nav.prevLiDisabled(), 'my-custom-class': true }">	<!-- map style syntax flavor -->
						<a href="" ng-click="pagination.nav.selectPrev()" aria-label="Previous">
							<span aria-hidden="true">&laquo;</span>
						</a>
					</li>
					<li ng-repeat="page in pagination.nav.pages" ng-class="pagination.nav.liClass(page)">	<!-- string style syntax flavor -->
						<a href="" ng-click="pagination.nav.selectPage(page)">{{page}}</a>
					</li>
					<li ng-class="[pagination.nav.nextLiClass(), 'my-custom-class']">						<!-- array style syntax flavor -->
						<a href="" ng-click="pagination.nav.selectNext()" aria-label="Next">
							<span aria-hidden="true">&raquo;</span>
						</a>
					</li>
				</ul>
			</nav>
		</div>
*/

angular.module('utilities').controller('PaginationController', ['$scope', 'jsonData', function($scope, jsonData) {
	
	//init pagination config from parent or default (specified in util.js/jsonData)
	if($scope.pagination === undefined) { $scope.pagination = {}; }
	var pgnt = {
		tableSize: $scope.pagination.tableSize || jsonData.TABLE_SIZE, // number of rows per page
		pageSelectorSize: $scope.pagination.pageSelectorSize || jsonData.PAGE_SELECTOR_SIZE, // number of explicit links left AND right from the active page
		index: $scope.pagination.index || [], // an array of things to paginate
		activePage: $scope.pagination.activePage || 1, // the currently active/visible page
		onPageChange: $scope.pagination.onPageChange || undefined // callback function that runs on every page change
	};
	$scope.pagination = pgnt; // expose to own and
	$scope.$parent.pagination = pgnt; // parent scope

	// init navigation state and behavior
	pgnt.numPages = 0;
	pgnt.nav = {
		// xYClass return classname strings, xY(Active|Disabled) return boolean
		prevLiClass: function() { return ( pgnt.activePage < 2 ? 'disabled' : ''); },
		prevLiDisabled: function() { return (pgnt.activePage < 2); },
		nextLiClass: function() { return ( pgnt.activePage >= pgnt.numPages ? 'disabled' : ''); },
		nextLiDisabled: function() { return (pgnt.activePage >= pgnt.numPages); },
		liClass: function(p) { return (p == pgnt.activePage ? 'active' : ''); },
		liActive: function(p) { return (p == pgnt.activePage); },

		pages:  [],
		selectPage: function(p) { pgnt.setPage(p); },
		selectPrev: function() { pgnt.setPage(pgnt.activePage - 1); },
		selectNext: function() { pgnt.setPage(pgnt.activePage + 1); }
	};

	
	// updates the model that controls the page numbers shown in the nav
	var updatePageSelectionModel = function() {
		var pss = pgnt.pageSelectorSize, pages = [], p;

		// loop over the pagelinks left of the active one
		for(var i = 0; i < pss; i++) { 
			p = pgnt.activePage - pss + i; 
			if(p > 0){ pages.push(p); }
		}
		// loop over the remaining, including the active one
		while(p < pgnt.numPages && pages.length < pss*2+1) { pages.push(++p); }
		
		pgnt.nav.pages = pages;
	};

	// sets new index data for pagination and updates the model
	pgnt.setIndex = function(index, callback) {
		this.index = index;
		this.numItems = index.length;
		this.numPages = 1 + Math.floor( (index.length-1) / this.tableSize );
		this.setPage(); 
		if(typeof callback === "function") { callback.call(pgnt); }
	};

	pgnt.setPage = function(p) {
		if(p === undefined) p = this.activePage;
		this.activePage = Math.max( 1, Math.min(p, pgnt.numPages)); // stay within [1; numPages]
		pgnt.update(pgnt.onPageChange);
	};

	// updates the model with the current state
	pgnt.update = function(callback) {
		this.fromItem = (pgnt.activePage-1) * pgnt.tableSize + 1;
		this.toItem = this.activePage * this.tableSize;
		pgnt.activeIndex = pgnt.index.slice( this.fromItem - 1, this.toItem); // (slice is excluding the end of range index)

		updatePageSelectionModel();

		if(typeof callback === "function") { callback.call(pgnt, pgnt.activeIndex); }
	};

	// init on init
	pgnt.setIndex(pgnt.index);
}]);


