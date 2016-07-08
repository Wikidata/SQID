/** 
	Pagination Controller quick usage documentation
	-----------------------------------------------

	the controller exposes the pagination object to its own and the parent $scope.

	Setting (and updating) the data for pagination:
	>	$scope.pagination.setIndex(hasToBeAnArray);

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
	
	example of init hook - persisting a pagination (in parent controller, before pagination controller load(!):)
	>	$scope.pagination.init = function(pagination) {
	>		if(firstRun) {
	>			someService.persistentPagi = jQuery.extend({}, pagination);
	>		}
	>	return someService.persistentPagi; // (MUST return reference to a pagination object)
	>}


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

//////// Module Definition ////////////
define([
	'util/util.module', // pulls in angular
	'util/pagination.directives'
], function() {
///////////////////////////////////////

angular.module('util').controller('PaginationController', ['$scope', function($scope) {
	//init pagination config from parent or default
	if($scope.pagination === undefined) { $scope.pagination = {}; }
	var pgnt = {
		tableSize: $scope.pagination.tableSize || 15, // number of rows per page
		tableSizeMin: $scope.pagination.tableSizeMin || 3, // minimum allowed number of rows per page
		tableSizeMax: $scope.pagination.tableSizeMax || 2000, // maximum allowed number of rows per page
		tableSizeOpts: $scope.pagination.tableSizeOpts || [15,25,50,100], // selectable tableSize options
		pageSelectorSize: $scope.pagination.pageSelectorSize || 8, // number of clickable numeric page links
		index: $scope.pagination.index || [], // an array of things to paginate
		activePage: $scope.pagination.activePage || 1, // the currently active/visible page
		onPageChange: $scope.pagination.onPageChange || undefined, // callback function that runs on every page change
		autoBoot: $scope.pagination.autoBoot || false // automatically create the pagination model when the controller is loaded (start manually with setIndex(indexArray))
	};

	// custom init hook
	if(typeof $scope.pagination.init === "function") { pgnt = $scope.pagination.init(pgnt); }

	$scope.pagination = pgnt; // expose to own and
	$scope.$parent.pagination = pgnt; // parent scope

	$scope.tableSizeSelect = pgnt.tableSize;


	// init navigation state and behavior
	pgnt.numPages = 0;

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
		this.toItem = Math.min(this.activePage * this.tableSize, this.numItems);
		pgnt.activeIndex = pgnt.index.slice( this.fromItem - 1, this.toItem); // (slice is excluding the end of range index)

		if(typeof callback === "function") { callback.call(pgnt, pgnt.activeIndex); }
	};

	pgnt.setTableSize = function(k) {
		if(k === undefined) { k = parseInt($scope.tableSizeSelect); }
		k = Math.min(this.tableSizeMax, Math.max(this.tableSizeMin, k) );
		
		// adapt the page number so we still see (roughly) the same items at the start of the page
		this.activePage = Math.floor((this.fromItem - 1) / k) + 1;
		
		$scope.tableSizeSelect = k;
		this.tableSize = k;
		this.setPage();

	}

	// init on init
	if(pgnt.autoBoot) { pgnt.setIndex(pgnt.index); }
}]);


return {}; }); // module definition end