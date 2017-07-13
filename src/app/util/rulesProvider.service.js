//////// Module Definition ////////////
define([
'util/util.module',
'util/wikidataapi.service',
'util/util.service',
'util/sparql.service',
'i18n/i18n.service',
'util/ruleParser.service'
], function() {
///////////////////////////////////////

angular.module('util').factory('rulesProvider', [
    'wikidataapi', 'util', 'i18n', 'sparql', '$q', '$http', 'ruleParser',
    function(wikidataapi, util, i18n, sparql, $q, $http, ruleParser) {

        var rules = [
            '(?x.P1696 = ?y)@?S -> (?y.P1696 = ?x)@F(?S)',
            '(?x.P1696 = ?y)@?S -> (?y.P1696 = ?x)@?S', // x inverseOf y -> y inverseOf x
            '(?x.P361 = ?y)@?S -> (?y.P527 = ?x)@?S', // x partOf y -> y hasPart x
            '?S:(?att = ?start), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@{?att = ?start}', // x spouse y [att:start] -> y spouse x[att:start]
            '(?x.P26 = ?y)@(P580 = ?start), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
            '?S:(P580 = ?start), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S', // start = ?start in ?S, ?x spouse ?y: ?S -> ?y spouse ?x: ?S
            '?S:[P580 = ?start], (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S', // ?S = [start = ?start], ?x spouse ?y: ?S -> ?y spouse ?x: ?S
            '?S:(), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S', // ?S = [...], ?x spouse ?y: ?S -> ?y spouse ?x: ?S
            '(?gf.P21 = Q6581097)@?X, (?gf.P40 = ?f)@?Y, (?f.P40 = ?s)@?Z -> (?s.P1038 = ?gf)@[P1039 = Q9238344]'
        ];

//TODO add rule with >1 qualifiers per pvalue
// var JSONRules = [
// /**
//  * TEST: FUNCTION
//  *
//  *  ?x spouse ?y: ?S, ?x hasRelative ?gf: ?T -> ?y spouse ?x:
//  *
//  *  FUNCTIONS (here only one, makes not really sense, especially the relational atom is arbitrary)
//  *  [[?S=[start=?start,...], end=?end in ?S, typeOfKinship=Grandfather in ?T, ?x  hasRelative ?gf1] :
//  *  INSERT [start=?start,end=?end]
//  *  ]
//  */
// { body: { atoms : [
// 		{
// 			type: "relational-atom",
// 			entity: {value:"x", type:"variable"},//Q57487)
// 			property: "P26",
// 			pvalue: {value:"y", type:"variable"},
// 			set: {value:"S", type:"set-variable" }
// 		},
// //		//Just to test, makes no sense
// //		{
// //			type: "relational-atom",
// //			entity: {value:"x", type:"variable"},
// //			property:"P1038",
// //			pvalue: {value:"gf", type:"variable"},
// //			set: {
// //				type:"set-variable" ,
// //				value:"T"}
// //		}
// 		]
// }, head: { atom :
// 	{
// 		type:"relational-atom",//not necessary
// 		entity: {value:"y", type:"variable"},
// 		property:"P26",
// 		pvalue: {value:"x", type:"variable"},
// 		set: {
// 			type:"function-term",
// 			value :[//only 1 function:
// ////			          {
// ////			        	  conditions:[
// ////							{
// ////							type: "open-specifier",
// ////							variable:"S",
// ////							value: [{
// ////								attribute:{value:"P580", type:"property"},
// ////								qvalue:{value:"start", type:"variable"}}
// ////							  ]
// ////							},
// //////				        	    //START TIME
// //////								{
// //////									type: "set-atom",
// //////									variable:"S",
// //////
// //////										attribute:{value:"P580", type:"property"},
// //////									    qvalue:{value:"start", type:"variable"}
// //////								},
// ////							//END TIME
// ////							{
// ////								type: "set-atom",
// ////								variable:"S",
// ////
// ////								attribute:{value:"P582", type:"property"},
// ////							    qvalue:{value:"end", type:"variable"}
// ////							},
// //////							//TEST GROUND SET ATOM typeOfKinship=Grandfather
// ////							{
// ////								type: "set-atom",
// ////								variable:"T",
// ////
// ////								attribute:{value:"P1039", type:"property"},
// ////								qvalue:{value:"Q9238344", type:"item"}
// ////							},
// ////							{
// ////								type: "relational-atom",
// ////								entity: {value:"x", type:"variable"},
// ////								property:"P1038",
// ////								pvalue: {value:"gf1", type:"variable"},
// ////								set: {
// ////									type:"set-expression" ,
// ////									value:[]}
// ////							}
// ////							],
// ////						  insert:[
// ////							{
// ////								attribute:{value:"P580", type:"property"},
// ////								qvalue:{value:"start", type:"variable"}
// ////							}
// ////							,
// ////							{
// ////								attribute:{value:"P582", type:"property"},
// ////								qvalue:{value:"end", type:"variable"}
// ////							}
// ////							]
// ////			          },
// 			          //function 1
// 			          {
// 			        	  conditions:[
// 							{
// 								type: "set-atom",
// 								variable:"S",

// 								attribute:{value:"P580", type:"property"},
// 							    qvalue:{value:"start", type:"variable"}
// 							}],
// 						  insert:[
// 							{
// 								attribute:{value:"P580", type:"property"},
// 								qvalue:{value:"start", type:"variable"}
// 							}
// 							]
// 			          },
// 			          //function 2
// 			          {
// 			        	  conditions:[
// 							{
// 								type: "set-atom",
// 								variable:"S",

// 								attribute:{value:"P582", type:"property"},
// 							    qvalue:{value:"end", type:"variable"}
// 							}],
// 						  insert:[
// 							{
// 								attribute:{value:"P582", type:"property"},
// 								qvalue:{value:"end", type:"variable"}
// 							}
// 							]
// 			          },
// 			        //function 3
// 			          {
// 			        	  conditions:[
// 							{
// 								type: "set-atom",
// 								variable:"S",

// 								attribute:{value:"P2842", type:"property"},
// 							    qvalue:{value:"place", type:"variable"}
// 							}],
// 						  insert:[
// 							{
// 								attribute:{value:"P2842", type:"property"},
// 								qvalue:{value:"place", type:"variable"}
// 							}
// 							]
// 			          },
// 			        //function 4
// 			          {
// 			        	  conditions:[
// 							{
// 								type: "set-atom",
// 								variable:"S",

// 								attribute:{value:"P1534", type:"property"},
// 							    qvalue:{value:"endCause", type:"variable"}
// 							}],
// 						  insert:[
// 							{
// 								attribute:{value:"P1534", type:"property"},
// 								qvalue:{value:"endCause", type:"variable"}
// 							}
// 							]
// 			          }
// 			          ]
// 		}//set
// 	}
// }
// },

// /**
//  * TEST: FUNCTION 2
//  *
//  *  positionheld
//  *
//  */
// { body: { atoms : [
// 		{
// 			type: "relational-atom",
// 			entity: {value:"x", type:"variable"},
// 			property: "P39",//positionheld
// 			pvalue: {value:"y", type:"variable"},
// 			set: {value:"S", type:"set-variable" }
// 		},
// 		{
// 			type: "relational-atom",
// 			entity: {value:"y", type:"variable"},
// 			property:"P279",//subclassof
// 			pvalue: {value:"Q48352", type:"item"},//head of state (Q48352)
// 			set: {
// 				type:"set-variable" ,
// 				value:"T"}
// 		}
// 		]
// }, head: { atom :
// 	{
// 		type:"relational-atom",//not necessary
// 		entity: {value:"y", type:"variable"},
// 		property:"P1308",//officeholder
// 		pvalue: {value:"x", type:"variable"},
// 		set: {
// 			type:"function-term",
// 			value :[
// 			          //function 1
// 			          {
// 			        	  conditions:[
// 							{
// 								type: "set-atom",
// 								variable:"S",

// 								attribute:{value:"P580", type:"property"},
// 							    qvalue:{value:"start", type:"variable"}
// 							}],
// 						  insert:[
// 							{
// 								attribute:{value:"P580", type:"property"},
// 								qvalue:{value:"start", type:"variable"}
// 							}
// 							]
// 			          },
// 			          //function 2
// 			          {
// 			        	  conditions:[
// 							{
// 								type: "set-atom",
// 								variable:"S",

// 								attribute:{value:"P582", type:"property"},
// 							    qvalue:{value:"end", type:"variable"}
// 							}],
// 						  insert:[
// 							{
// 								attribute:{value:"P582", type:"property"},
// 								qvalue:{value:"end", type:"variable"}
// 							}
// 							]
// 			          },
// 			          ]
// 		}//set
// 	}//head atom
// }//head
// },
	// ];

        var getRules = function() {
            return rules.map(function(rule) {
                return ruleParser.parse(rule);
            });
        };

return {
		getRules: getRules
	};
}]);

return {}; }); // module definition end
