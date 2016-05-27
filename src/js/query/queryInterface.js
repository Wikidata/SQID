//////// Module Definition ////////////
define([
	// 'app/app', // pulls angular, ngroute and utilties
	// 'app/classes',
	// 'app/properties',
	// 'angular',
	// 'ngRoute',			TODO
	// 'util/util'
	// // ....
], function() {
///////////////////////////////////////

(function() {

angular.module('queryInterface', [])
	.factory('queryInterfaceState', function() { // persist state of page

		return function getFreshStateInstance() {
			return  {
				getFreshStateInstance: getFreshStateInstance, 

				classData: {}, // classData from Classes service
				classIndex: [], // list of class indices for iteration
				
				selectedClass: undefined,
				searchOrderBy: 'ai', // (see /src/data/format.md for available options)
				offspring: 'i',

				selectedProperties: {
					current: undefined,
					stack: [],
					add: function(p) {
						this.stack.push(p);
						this.current = this.stack[this.stack.length - 1];
					},
					remove: function(i) {
						this.stack.splice(i,1);
					}
				},

				queryParms: {
					big: false,
					heavy: false,
					limitResults: true,
					THRESHOLD_BIG: 10000,
					THRESHOLD_HEAVY: 100000,
					RESULT_VAR: 'entity'
				},

				sparqlQuery: '', // sparql query as a string
				queryError: '', // error message string returned from query.wikidata.org if something went wrong
				//queryShowSuccess: false, // success message toggle for complete queries

				// pagination: undefined // persist pagination (unnecessary statement for the sake of verbosity)
			};
		}();
	})

	.controller('QueryController', ['$scope', '$routeParams', 'spinner', 'Classes', 'Properties', 'i18n', 'sparql', 'wikidataapi', 'queryInterfaceState', 
	function($scope, $routeParams, spinner, Classes, Properties, i18n, sparql, wikidataapi, qisService) {

		var qis; // query interface state (usually points to qisService)
		$scope.resultListMode = $routeParams.run !== undefined; // for instantly showing results of a predefined sparql query

		if(!$scope.resultListMode) { qis = qisService; } // just point to the persisted state object
		else { qis = qisService.getFreshStateInstance(); } // minimalist interface, dont mess with persisted state
		
		$scope.qui = qis;
		$scope.pagination = {
			autoBoot: true,
			onPageChange: processEntities,
			init: function(pgnt) {
				if(qis.pagination === undefined) { qis.pagination = jQuery.extend({}, pgnt); }
				return qis.pagination;
		}	};


		//sparqewl = sparql; // expose as global in dev console TODO remove in production
		//globallz = qis;
		//rP = $routeParams;
		//scoop = $scope;



		/////////////////////////////
		/// class selection input //
		///////////////////////////
		$scope.classSelectModelOptions = {
			debounce: { default: 500, blur: 250 },
			getterSetter: true
		};

		// getter/setter handler for the input field
		var classSelectInputVal = qis.selectedClass;
		$scope.classSelectHandler = function(selected) {
			if(arguments.length) {
				classSelectInputVal = selected;
				if(selected !== null && typeof selected === 'object' && qis.classData[selected.qid.substr(1)] !== undefined ) { 
					qis.selectedClass = selected;
					$scope.buildSparql();
				}
			}
			else { return classSelectInputVal; }
		};

		var propAddInputVal = qis.selectedProperties.current;
		$scope.propertyAddHandler = function(selected) {
			//console.log(selected);
			if(arguments.length) {
				propAddInputVal = selected;
				if(selected !== null && typeof selected === 'object' && qis.propertyData[selected.id] !== undefined ) { 
					qis.selectedProperties.add(selected);
					$scope.buildSparql();
					propAddInputVal = undefined;
				}
			}
			else { return propAddInputVal; }
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
					rProps[i].url = i18n.getEntityUrl('P' + rProps[i].id);
				}
				return rProps;
			});

			
		}

		function estimateResponseSize() {
			var size = qis.selectedClass[qis.offspring];
			qis.queryParms.big = size > qis.queryParms.THRESHOLD_BIG;
			qis.queryParms.heavy = size > qis.queryParms.THRESHOLD_HEAVY;
		}

		// Translate form state into sparql
		$scope.buildSparql = function() {
			if(!qis.selectedClass) { qis.sparqlQuery = null; } else {

				estimateResponseSize();
				
				var obj = "wd:" + qis.selectedClass.qid,
					ins = "?" + qis.queryParms.RESULT_VAR,
					tab = "    ";

				var DISTINCT = '';
				switch(qis.offspring) {
					case 'ai': case 'as': DISTINCT = 'DISTINCT ';
				}

				var header = sparql.getStandardPrefixes() +
					"PREFIX ps: <http://www.wikidata.org/prop/statement/>\n" +
					"PREFIX p: <http://www.wikidata.org/prop/>\n\n" +

					"SELECT " + DISTINCT + ins + " \n" +
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
				var i = qis.selectedProperties.stack.length;
				while(i--) {
					body += "\n" +
						tab + ins + " p:P" + qis.selectedProperties.stack[i].id + " ?any" + i + "thing .";
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

			qis.queryError = null;
			var submit = $('#qry-submit-sparql');
			submit.prop('disabled', true);
			var spin = spinner(submit.parent().get(0));
			var resumeUI = function() {
				console.log('SPARQL http request took ' + (Date.now() - benchm) + 'ms.');
				submit.prop('disabled', false);
				spin.stop();
			};
			var showSuccess = function() {
				qis.showQuerySuccess = true;
				setTimeout(function() { qis.showQuerySuccess = false; }, 2000); // show it for at least 2 seconds
				// actually the observer only seems to react when some other action in the ui is taken
			};
			sparql.getQueryRequest(qis.sparqlQuery).then(function(data) { // success
				//console.log(data);
				qis.pagination.setIndex(data.results.bindings);
				qis.pagination.setPage(1);
				showSuccess();
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
					eid = entities[i][qis.queryParms.RESULT_VAR].value.split('/entity/')[1];
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

		// immediately fire the request when in resultListMode
		if($scope.resultListMode) { 
			qis.sparqlQuery = $routeParams.run;
			setTimeout(function() {	$scope.runSparql(); }, 0); // timeout of 0 prevents some weird bug to happen
		}

	}]); // controller
})(); // module
