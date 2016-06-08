//////// Module Definition ////////////
define([
	'query/sparqly.module',
], function() {
///////////////////////////////////////



angular.module('sparqly')
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


return {};}); // module definition end