(function() {

angular.module('queryInterface', ['angucomplete-alt'])
	.factory('queryInterfaceState', function() { // persist state of page

		return {
			classData: {}, // classData from Classes service
			classIndex: [], // list of class indices for iteration
			
			selectedClass: false,
			searchOrderBy: 'ai', // (see /src/data/format.md for available options)
			offspring: 'i',

			sparqlQuery: '', // sparql query as a string
			queryError: '', // error message string returned from query.wikidata.org if something went wrong

			pagination: undefined // persist pagination (unnecessary statement for the sake of verbosity)
		};
	})

	.controller('QueryController', ['$scope','Classes', 'i18n', 'sparql', 'wikidataapi', 'queryInterfaceState',  function($scope, Classes, i18n, sparql, wikidataapi, qis) {

		sparqewl = sparql; // expose as global in dev console TODO remove in production

		$scope.qui = qis; // just point to the persisted state object
		$scope.pagination = {
			autoBoot: true,
			onPageChange: processEntities,
			init: function(pgnt) {
				if(qis.pagination === undefined) { qis.pagination = jQuery.extend({}, pgnt); }
				return qis.pagination;
		}	};


		$scope.selectedClassHandler = function(selected) {
			if(selected) { qis.selectedClass = selected; }
			else { qis.selectedClass = false; }
			
			$scope.buildSparql();
		};

		// searching classes in lokal data by id or labels (case insensitive) 
		$scope.classSearch = function(str) {
			var i = qis.classIndex.length, matches = [], 
				classId, classLabel, newMatch;
			str = str.toString().toLowerCase();
			while(i--) {
				classId = qis.classIndex[i];
				classLabel = qis.classData[classId].l;
				if( (classLabel !== undefined && classLabel !== null && classLabel.toLowerCase().indexOf(str) > -1) 
				||( ('q'+classId).indexOf(str) > -1) ) {
					newmatch = qis.classData[qis.classIndex[i]];
					newmatch.qid = 'Q' + qis.classIndex[i];
					newmatch.title = newmatch.l + ' [' + newmatch.qid + ']';
					matches.push(newmatch);
				}
			}
			matches.sort(function(a,b) { // sort by number of all instances descending
				return (a[qis.searchOrderBy] > b[qis.searchOrderBy]) ? -1 : ( (a[qis.searchOrderBy] === b[qis.searchOrderBy]) ? 0 : 1);
			});
			return matches.slice(0,9);
		};

		// build classIndex array when we have the class data
		Classes.then(function(data){
			//console.log('classes loaded');
			qis.classData = data.getClasses();
			for(var p in qis.classData) {
				if(qis.classData.hasOwnProperty(p)) {
					qis.classIndex.push(p);
				}
			}
			 
		});

		// Translate form state into sparql
		$scope.buildSparql = function() {
			if(!qis.selectedClass) { qis.sparqlQuery = null; } else {
				
				var obj = "wd:" + qis.selectedClass.originalObject.qid,
					ins = "?instance",
					tab = "    ";

				var header = sparql.getStandardPrefixes() +
					"SELECT " + ins + " \n" +
					"WHERE {\n" + tab;

				var body;
				switch(qis.offspring) {
					case 'i': 	body = ins + " wdt:P31 " + obj + " ."; 
								break;
					case 'ai': 	body = "?class wdt:P279* " + obj + " .\n" +
									tab + ins + " wdt:P31 ?class ."; 
								break;
					case 's': 	body = ins + " wdt:P279 " + obj + " .";
								break;
					case 'as': 	body = ins + " wdt:P279* " + obj + " ."; 
								break;
				}

				var footer = "\n" +
					"}";


				qis.sparqlQuery = header + body + footer;
			}
		};


		$scope.runSparql = function() {
			sparql.getQueryRequest(qis.sparqlQuery).then(function(data) { // success
				qis.pagination.setIndex(data.results.bindings);
			}, function(response) { // error
				console.log(response);
				qis.queryError = response;
			});
			
		};

		// process entities on the current page
		function processEntities (entities) {
			// grab Q/P ids from the full entity uri
			var entityIds = [], i = entities.length, eid;
			while(i--) {
				if(entities[i].qid === undefined) { // no need to process more than once
					eid = entities[i].instance.value.split('/entity/')[1];
					entities[i].qid = eid;
					entities[i].url = i18n.getEntityUrl(eid);
					entityIds.push(eid);
				}
			}
			// pull labels and descriptions
			if(entityIds.length > 0) {
				wikidataapi.getEntityTerms(entityIds, i18n.getLanguage()).then(function(data) {
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
		}
	}]); // controller
})(); // module
