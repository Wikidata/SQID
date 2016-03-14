(function() {
	//classBrowser.controller('QueryController', function($scope, Arguments, Classes, Properties, jsonData) {
	qry = angular.module('queryInterface', ['angucomplete-alt']);

	qry.controller('QueryController', ['$scope','Classes', 'util', 'sparql', 'wikidataapi', function($scope, Classes, util, sparql, wikidataapi) {

		sparqewl = sparql;

		$scope.selectedClass = false;
		$scope.sparqlQuery = null;
		$scope.classIndex = [];

		var searchOrderBy = 'ai';
		//$scope.results = null;

		$scope.selectedClassHandler = function(selected) {
			if(selected) { $scope.selectedClass = selected; }
			else { $scope.selectedClass = false; }
			
			$scope.buildSparql();
		};

		// searching classes in lokal data by id or labels (case insensitive) 
		$scope.classSearch = function(str) {
			var i = $scope.classIndex.length, matches = [], 
				classId, classLabel, newMatch;
			str = str.toString().toLowerCase();
			while(i--) {
				classId = $scope.classIndex[i];
				classLabel = $scope.classData[classId].l;
				if( (classLabel !== undefined && classLabel !== null && classLabel.toLowerCase().indexOf(str) > -1) 
				||( ('q'+classId).indexOf(str) > -1) ) {
					newmatch = $scope.classData[$scope.classIndex[i]];
					newmatch.qid = 'Q' + $scope.classIndex[i];
					newmatch.title = newmatch.l + ' [' + newmatch.qid + ']';
					matches.push(newmatch);
				}
			}
			matches.sort(function(a,b) { // sort by number of all instances descending
				return (a[searchOrderBy] > b[searchOrderBy]) ? -1 : ( (a[searchOrderBy] === b[searchOrderBy]) ? 0 : 1);
			});
			return matches.slice(0,9);
		};

		// build classIndex array when we have the class data
		Classes.then(function(data){
			//console.log('classes loaded');
			$scope.classData = data.getClasses();
			for(var p in $scope.classData) {
				if($scope.classData.hasOwnProperty(p)) {
					$scope.classIndex.push(p);
				}
			}
			 
		});

		// Translate form state into sparql
		$scope.buildSparql = function() {
			if(!$scope.selectedClass) { $scope.sparqlQuery = null; } else {
				$scope.sparqlQuery = sparql.getStandardPrefixes() +
				"SELECT ?instance \n" +
				"WHERE {\n" +
				"	?instance wdt:P31 wd:" + $scope.selectedClass.originalObject.qid + " .\n" +
				"}";
			}
		};

		$scope.runSparql = function() {
			sparql.getQueryRequest($scope.sparqlQuery).then(function(data) {
				//console.log(data);
				var results = data.results.bindings;

				var processEntities = function(entities) {
					// grab Q/P ids from the full entity uri
					var entityIds = [], i = entities.length, eid;
					while(i--) {
						if(entities[i].qid === undefined) { // no need to process more than once
							eid = entities[i].instance.value.split('/entity/')[1];
							entities[i].qid = eid;
							entities[i].url = util.getEntityUrl(eid);
							entityIds.push(eid);
						}
					}
					// pull labels and descriptions
					if(entityIds.length > 0) {
						wikidataapi.getEntityTerms(entityIds).then(function(data) {
							//console.log(data);
							var i = entities.length, entity;
							while(i--) {
								entity = entities[i];
								if(data[entity.qid] !== undefined) {
									entity.label = data[entity.qid].label;
									entity.description = data[entity.qid].description;
								}
							}
						});
					}
				};

				$scope.pagination.onPageChange = processEntities;
				$scope.pagination.setIndex(results);
				
			});
			
		};

	}]);
})();
