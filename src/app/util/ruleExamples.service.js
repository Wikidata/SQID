//////// Module Definition ////////////
define([
'util/util.module',
'util/wikidataapi.service',
'util/util.service',
'util/sparql.service',
'i18n/i18n.service'
], function() {
///////////////////////////////////////

angular.module('util').factory('ruleExamples', [
'wikidataapi', 'util', 'i18n', 'sparql', '$q', '$http', 
function(wikidataapi, util, i18n, sparql, $q, $http) {

//TODO add rule with >1 qualifiers per pvalue
var JSONRules = [

                
/** 
 * TEST: ENTITY IS PROPERTY
 * 
 * x inverseOf y -> y inverseOf x
 */

{ body: { atoms : [
		{ 
			type: "relational-atom",
			entity: {value:"x", type:"variable"},
			property: "P1696",//inverseOf
			pvalue: {value:"y", type:"variable"},
			set: {
				type:"set-expression",
				value:[]
			}
		}]
}, head: { atom : 
	{
		type:"relational-atom",
		entity: {value:"y", type:"variable"},
		property:"P1696",
		pvalue: {value:"x", type:"variable"},
		set: {
			type:"set-expression",
			value:[]	
		}
	}}
},   
	
/** 
 * TEST: SOME RULE DIFFERENT FROM SPOUSE...
 * 
 * x partOf y -> y hasPart x
 */
{ body: { atoms : [
           		{ 
           			type: "relational-atom",
           			entity: {value:"x", type:"variable"},
           			property: "P361",//partOf
           			pvalue: {value:"y", type:"variable"},
           			set: {
           				type:"set-expression",
           				value:[]
           			}
           		}]
}, head: { atom : 
   	{
   		type:"relational-atom",
	entity: {value:"y", type:"variable"},
	property:"P527",//hasPart
	pvalue: {value:"x", type:"variable"},
	set: {
		type:"set-expression",
		value:[]	
	}
}}
},   
	
/** 
 * TEST: QUALIFIER-ATTRIBUTE IS VARIABLE
 * 
 * x spouse y [att=start] -> y spouse x [att=start]
 */
{ body: { atoms : [
		{
			type: "relational-atom",
			entity: {value:"x", type:"variable"},
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {
				type:"set-expression",
				value:[{
						attribute:{value:"att", type:"variable"},
					    qvalue:{value:"start", type:"variable"}
						}]
				 }
		}]
}, head: { atom : 
	{
		type:"relational-atom",
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {
			type:"set-expression",
			value:[{
				attribute:{value:"att", type:"variable"},
			    qvalue:{value:"start", type:"variable"}
				}]
		}
	}}
},

/** 
 * TEST: SET ATOM IN BODY
 * 
 * start=?start in ?S, ?x spouse ?y: ?S -> ?y spouse ?x: ?S
 */
{ body: { atoms : [
		{
			type: "set-atom",
			variable:"S",
			
				attribute:{value:"P580", type:"property"},
			    qvalue:{value:"start", type:"variable"} 
		},{
			type: "relational-atom",
			entity: {value:"x", type:"variable"},
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"set-variable" }
		}]
}, head: { atom : 
	{
		type:"relational-atom",
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {value:"S", type:"set-variable" }
	}}
},

/** 
 * TEST: CLOSED SPECIFIER
 * 
 *  ?S=[start=?start], ?x spouse ?y: ?S -> ?y spouse ?x: ?S
 */
{body: { atoms : [
		{
			type: "closed-specifier",
			variable:"S",
			value: [{
				attribute:{value:"P580", type:"property"},
				qvalue:{value:"start", type:"variable"}
			}]				
		},{
			type: "relational-atom",
			entity: {value:"x", type:"variable"},
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"set-variable" }
		}]
}, head: { atom : 
	{
		type:"relational-atom",
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {value:"S", type:"set-variable" }
	}}
},

/** 
 * TEST: OPEN SPECIFIER IN BODY
 * 
 *  ?S=[...], ?x spouse ?y: ?S -> ?y spouse ?x: ?S
 */
{
body: { atoms : [
		{
			type: "open-specifier",
			variable:"S",
			value: []				
		},{
			type: "relational-atom",
			entity: {value:"x", type:"variable"},
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"set-variable" }
		}]
}, head: { atom : 
	{
		type:"relational-atom",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {value:"S", type:"set-variable" }
	}}
},


/** 
 * TEST: FUNCTION
 * 
 *  ?x spouse ?y: ?S, ?x hasRelative ?gf: ?T -> ?y spouse ?x: 
 *  
 *  FUNCTIONS (here only one, makes not really sense, especially the relational atom is arbitrary)
 *  [[?S=[start=?start,...], end=?end in ?S, typeOfKinship=Grandfather in ?T, ?x  hasRelative ?gf1] :
 *  INSERT [start=?start,end=?end] 
 *  ]
 */
{ body: { atoms : [
		{
			type: "relational-atom",
			entity: {value:"x", type:"variable"},//Q57487)
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"set-variable" }
		},
//		//Just to test, makes no sense
//		{
//			type: "relational-atom",
//			entity: {value:"x", type:"variable"},
//			property:"P1038",
//			pvalue: {value:"gf", type:"variable"},
//			set: {
//				type:"set-variable" ,
//				value:"T"}
//		}
		]
}, head: { atom : 
	{
		type:"relational-atom",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {
			type:"function-term",
			value :[//only 1 function:
////			          {
////			        	  conditions:[
////							{
////							type: "open-specifier",
////							variable:"S",
////							value: [{	
////								attribute:{value:"P580", type:"property"},
////								qvalue:{value:"start", type:"variable"}}
////							  ]				
////							},
//////				        	    //START TIME
//////								{
//////									type: "set-atom",
//////									variable:"S",
//////									
//////										attribute:{value:"P580", type:"property"},
//////									    qvalue:{value:"start", type:"variable"}
//////								},
////							//END TIME
////							{
////								type: "set-atom",
////								variable:"S",
////								
////								attribute:{value:"P582", type:"property"},
////							    qvalue:{value:"end", type:"variable"}
////							},
//////							//TEST GROUND SET ATOM typeOfKinship=Grandfather
////							{
////								type: "set-atom",
////								variable:"T",
////								
////								attribute:{value:"P1039", type:"property"},
////								qvalue:{value:"Q9238344", type:"item"}						
////							},
////							{
////								type: "relational-atom",
////								entity: {value:"x", type:"variable"},
////								property:"P1038",
////								pvalue: {value:"gf1", type:"variable"},
////								set: {
////									type:"set-expression" ,
////									value:[]}
////							}
////							], 
////						  insert:[
////							{
////								attribute:{value:"P580", type:"property"},
////								qvalue:{value:"start", type:"variable"}
////							}
////							,
////							{
////								attribute:{value:"P582", type:"property"},
////								qvalue:{value:"end", type:"variable"}
////							}
////							]
////			          },
			          //function 1
			          {
			        	  conditions:[
							{
								type: "set-atom",
								variable:"S",
								
								attribute:{value:"P580", type:"property"},
							    qvalue:{value:"start", type:"variable"}
							}], 
						  insert:[
							{
								attribute:{value:"P580", type:"property"},
								qvalue:{value:"start", type:"variable"}
							}
							]
			          },
			          //function 2
			          {
			        	  conditions:[
							{
								type: "set-atom",
								variable:"S",
								
								attribute:{value:"P582", type:"property"},
							    qvalue:{value:"end", type:"variable"}
							}], 
						  insert:[
							{
								attribute:{value:"P582", type:"property"},
								qvalue:{value:"end", type:"variable"}
							}
							]
			          },
			        //function 3
			          {
			        	  conditions:[
							{
								type: "set-atom",
								variable:"S",
								
								attribute:{value:"P2842", type:"property"},
							    qvalue:{value:"place", type:"variable"}
							}], 
						  insert:[
							{
								attribute:{value:"P2842", type:"property"},
								qvalue:{value:"place", type:"variable"}
							}
							]
			          },
			        //function 4
			          {
			        	  conditions:[
							{
								type: "set-atom",
								variable:"S",
								
								attribute:{value:"P1534", type:"property"},
							    qvalue:{value:"endCause", type:"variable"}
							}], 
						  insert:[
							{
								attribute:{value:"P1534", type:"property"},
								qvalue:{value:"endCause", type:"variable"}
							}
							]
			          }
			          ]
		}//set
	}
}
},

/** 
 * TEST: FUNCTION 2
 * 
 *  positionheld
 *  
 */
{ body: { atoms : [
		{
			type: "relational-atom",
			entity: {value:"x", type:"variable"},
			property: "P39",//positionheld
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"set-variable" }
		},
		{
			type: "relational-atom",
			entity: {value:"y", type:"variable"},
			property:"P279",//subclassof
			pvalue: {value:"Q48352", type:"item"},//head of state (Q48352)
			set: {
				type:"set-variable" ,
				value:"T"}
		}
		]
}, head: { atom : 
	{
		type:"relational-atom",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P1308",//officeholder
		pvalue: {value:"x", type:"variable"},
		set: {
			type:"function-term",
			value :[
			          //function 1
			          {
			        	  conditions:[
							{
								type: "set-atom",
								variable:"S",
								
								attribute:{value:"P580", type:"property"},
							    qvalue:{value:"start", type:"variable"}
							}], 
						  insert:[
							{
								attribute:{value:"P580", type:"property"},
								qvalue:{value:"start", type:"variable"}
							}
							]
			          },
			          //function 2
			          {
			        	  conditions:[
							{
								type: "set-atom",
								variable:"S",
								
								attribute:{value:"P582", type:"property"},
							    qvalue:{value:"end", type:"variable"}
							}], 
						  insert:[
							{
								attribute:{value:"P582", type:"property"},
								qvalue:{value:"end", type:"variable"}
							}
							]
			          },
			          ]
		}//set
	}//head atom
}//head
},

/** 
 * TEST: SEVERAL RELATIONAL ATOMS IN BODY
 * 
 *  ?gf gender Male, ?gf hasChild ?f, ?f hasChild ?s -> ?s hasRelative ?gf [typeOfKinship=Grandfather] 
 */
{ body: {
	atoms : [
		{
			type: "relational-atom",
		entity: {value:"gf", type:"variable"},
		property: "P21",
		pvalue: {value:"Q6581097", type:"item"},
		set: {}
	},
	{
		type: "relational-atom",
		entity: {value:"gf", type:"variable"},
		property: "P40",
		pvalue: {value:"f", type:"variable"},
		set: {}
	},{
		type: "relational-atom",
		entity: {value:"f", type:"variable"},
		property: "P40",
		pvalue: {value:"s", type:"variable"},
			set: {}
		}]
}, head: { atom: 
	{
		entity: {value:"s", type:"variable"},
	property:"P1038",
	pvalue: {value:"gf", type:"variable"},
	set: {
		type:"set-expression" ,
		value:[{
		attribute:{value:"P1039", type:"property"},
	    qvalue:{value:"Q9238344", type:"item"}} ]
		}		
	}}
}
	];
		

var getRules = function() {	
	return [//JSONRules[0],JSONRules[1],JSONRules[2],JSONRules[3],JSONRules[4],JSONRules[5],
	        JSONRules[6],JSONRules[7]];
//	        JSONRules[7]]; //JSONRules;	
//	[
//////	 		other than p26
////	        JSONRules[0],
////	        JSONRules[1],
//////	        attr var
////	        JSONRules[2],
//	        JSONRules[3],
//////	        specs
////	        JSONRules[4],
////	        JSONRules[5],
//////	        funct
//////	        JSONRules[6],
////	        JSONRules[7], 
//	];
};

return {
		getRules: getRules
	};
}]);

return {}; }); // module definition end