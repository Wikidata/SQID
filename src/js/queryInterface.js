(function() {

angular.module('queryInterface', ['angucomplete-alt'])
	.factory('queryInterfaceState', function() { // persist state of page

		return {
			classData: {}, // classData from Classes service
			classIndex: [], // list of class indices for iteration
			
			selectedClass: undefined,
			searchOrderBy: 'ai', // (see /src/data/format.md for available options)
			offspring: 'i',

			queryParms: {
				big: false,
				heavy: false,
				limitResults: true,
				THRESHOLD_BIG: 10000,
				THRESHOLD_HEAVY: 100000
			},
			// responseRange: {0: 10000, 1:100000, 2: Infinity},
			// limitResults: false,
			sparqlQuery: '', // sparql query as a string
			queryError: '', // error message string returned from query.wikidata.org if something went wrong

			pagination: undefined // persist pagination (unnecessary statement for the sake of verbosity)
		};
	})

	.controller('QueryController', ['$scope', 'spinner', 'Classes', 'Properties', 'i18n', 'sparql', 'wikidataapi', 'queryInterfaceState', 
	function($scope, spinner, Classes, Properties, i18n, sparql, wikidataapi, qis) {

		sparqewl = sparql; // expose as global in dev console TODO remove in production
		globallz = qis;

		$scope.qui = qis; // just point to the persisted state object
		$scope.pagination = {
			autoBoot: true,
			onPageChange: processEntities,
			init: function(pgnt) {
				if(qis.pagination === undefined) { qis.pagination = jQuery.extend({}, pgnt); }
				return qis.pagination;
		}	};


		/////////////////////////////
		/// class selection input //
		///////////////////////////
		$scope.classSelectModelOptions = {
			debounce: { default: 500, blur: 250 },
			getterSetter: true
		};

		// getter/setter handler for the input field
		$scope.classSelectInputValue = qis.selectedClass;
		$scope.classSelectHandler = function(selected) {
			if(arguments.length) {
				$scope.classSelectInputValue = selected;
				if(selected !== null && typeof selected === 'object' && qis.classData[selected.qid.substr(1)] !== undefined ) { 
					qis.selectedClass = selected;
					$scope.buildSparql();
				}
			}
			else { return $scope.classSelectInputValue; }
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
			qis.classIndex = [];
			for(var p in qis.classData) {
				if(qis.classData.hasOwnProperty(p)) {
					qis.classIndex.push(p);
				}
			}
		});

		Properties.then(function(data) {
			qis.propertyData = data.getProperties();
		});

		$scope.propertySearch = function(str) {
			if(str === undefined) { str = ''; }
			var rProps = [],
				keys = Object.keys(qis.selectedClass.r),
				i = keys.length, p;
			str = str.toString().toLowerCase();
			while(i--) {
				if( (p = qis.propertyData[keys[i]]) && ( 
					(p.l !== undefined && p.l.toLowerCase().indexOf(str) > -1) ||
					(("p" + keys[i]).indexOf(str) > -1)								
			  	)){
					rProps.push({id: keys[i], score: qis.selectedClass.r[keys[i]]});
				}
			}

			rProps.sort(function(a,b) { // sort by relatedness score descending
				return (a.score > b.score) ? -1 : ( (a.score === b.score) ? 0 : 1);
			});

			rProps = rProps.slice(0,9);

			// ? localizing after searching in english labels? (related to issue #43)
			var fetchThose = []; i = rProps.length;
			while(i--) { fetchThose.push('P' + rProps[i].id); } 
			return i18n.waitForPropertyLabels(fetchThose).then(function() {
				i = rProps.length;
				while(i--) {
					rProps[i].label = i18n.getPropertyLabel('P' + rProps[i].id);
					rProps[i].title = rProps[i].label + ' (P' + rProps[i].id + ')';
				}
				return rProps;
			});

			
		}

		$scope.estimateResponseSize = function() {
			var size = qis.selectedClass[qis.offspring];
			qis.queryParms.big = size > qis.queryParms.THRESHOLD_BIG;
			qis.queryParms.heavy = size > qis.queryParms.THRESHOLD_HEAVY;
		}

		// Translate form state into sparql
		$scope.buildSparql = function() {
			if(!qis.selectedClass) { qis.sparqlQuery = null; } else {

				$scope.estimateResponseSize();
				
				var obj = "wd:" + qis.selectedClass.qid,
					ins = "?instance",
					tab = "    ";

				var header = sparql.getStandardPrefixes() +
					"SELECT " + (qis.offspring === 'ai' ? 'DISTINCT ' : '') + ins + " \n" +
					"WHERE {\n" + tab;

				var body;
				switch(qis.offspring) {
					case 'i': 	body = ins + " wdt:P31 " + obj + " ."; 
								break;
					case 'ai': 	body = ins + " wdt:P31/wdt:P279* " + obj + " ."; 
								break;
					case 's': 	body = ins + " wdt:P279 " + obj + " .";
								break;
					case 'as': 	body = ins + " wdt:P279* " + obj + " ."; 
								break;
				}

				var footer = "\n" +
					"}";

				if(qis.queryParms.big && qis.queryParms.limitResults) {
					footer += "\n LIMIT " + qis.queryParms.THRESHOLD_BIG;
				}

				qis.sparqlQuery = header + body + footer;
			}
		};


		$scope.runSparql = function() {
			//console.log('sending sparql request');
			var benchm = Date.now();

			var submit = $('#qry-submit-sparql');
			submit.prop('disabled', true);
			var spin = spinner(submit.parent().get(0));
			var resumeUI = function() {
				console.log('SPARQL http request took ' + (Date.now() - benchm) + 'ms.');
				submit.prop('disabled', false);
				spin.stop();
			};
			sparql.getQueryRequest(qis.sparqlQuery).then(function(data) { // success
				//console.log('received response to sparql request');
				qis.pagination.setIndex(data.results.bindings);
				qis.pagination.setPage(1);
				resumeUI();
			}, function(response) { // error
				console.log(response);
				if(response === '') { response = '(Empty response)'; }
				qis.queryError = response;
				resumeUI();
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
