(function() {
	//classBrowser.controller('QueryController', function($scope, Arguments, Classes, Properties, jsonData) {
	qry = angular.module('queryInterface', ['angucomplete-alt']);

	qry.controller('QueryController', ['$scope','Classes', 'sparql', 'wikidataapi', function($scope, Classes, sparql, wikidataapi) {

		sparqewl = sparql;

		$scope.selectedClass = false;
		$scope.sparqlQuery = null;
		$scope.classIndex = [];
		$scope.results = null;

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
				return (a.ai > b.ai) ? -1 : ( (a.ai === b.ai) ? 0 : 1);
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
				console.log(data);
				var entityIds = [], i = data.results.bindings.length;
				while(i--) {
					entityIds.push(
						data.results.bindings[i].qid = data.results.bindings[i].instance.value.split('/entity/')[1]
					);
				}
				$scope.results = data.results.bindings;
				wikidataapi.getEntityTerms(entityIds).then(function(data) {
					console.log(data);
					for(var qid in data){
						if(data.hasOwnProperty(qid)){

						}
					}
					var i = $scope.results.length, e;
					while(i--) {
						e = $scope.results[i];
						if(data[e.qid] !== undefined) {
							e.label = data[e.qid].label;
							e.description = data[e.qid].description;
						}
					}

				});
			});
			
		};

	}]);
})();
