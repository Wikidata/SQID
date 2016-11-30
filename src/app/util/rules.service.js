//////// Module Definition ////////////
define([
	'util/util.module',
'util/wikidataapi.service',
'util/util.service',
'util/sparql.service',
'i18n/i18n.service'
], function() {
///////////////////////////////////////

angular.module('util').factory('rules', [
'wikidataapi', 'util', 'i18n', 'sparql', '$q', '$http', 
function(wikidataapi, util, i18n, sparql, $q, $http) {
	
	  
//TODO add rule with >1 qualifiers per pvalue
var JSONRules = [
	             
{
	body: { atoms : [
			{
				type: "relational-atom",
				entity: {value:"x", type:"variable"},//Q57487)
				property: "P361",//PartOf//"P1709",
				pvalue: {value:"y", type:"variable"},
				set: {
					type:"set-expression",
					value:[
//					       {
//						attribute:{value:"att", type:"variable"},
//					    qvalue:{value:"start", type:"variable"}} 
					       ]
					 }
			}]
	},
	head: { atom : 
		{
			type:"relational-atom",//not necessary
			entity: {value:"y", type:"variable"},
			property:"P527",//hasPart
			pvalue: {value:"x", type:"variable"},
			set: {
				type:"set-expression",
				value:[
//				       {
//					attribute:{value:"att", type:"variable"},
//				    qvalue:{value:"start", type:"variable"}} 
				       ]	
			}
		}
	}
	},
	
//TEST attribute is variable            
{
body: { atoms : [
		{
			type: "relational-atom",
			entity: {value:"x", type:"variable"},//Q57487)
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {
				type:"set-expression",
				value:[
				       {
					attribute:{value:"att", type:"variable"},
				    qvalue:{value:"start", type:"variable"}} 
				       ]
				 }
		}]
},
head: { atom : 
	{
		type:"relational-atom",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {
			type:"set-expression",
			value:[
			       {
				attribute:{value:"att", type:"variable"},
			    qvalue:{value:"start", type:"variable"}} 
			       ]	
		}
	}
}
},

	//
//{
//body: { atoms : [
//		{
//			type: "relational-atom",
//			entity: {value:"x", type:"variable"},//Q57487)
//			property: "P26",
//			pvalue: {value:"y", type:"variable"},
//			set: {
//				value:[{
//				attribute:{value:"P580", type:"property"},
//			    qvalue:{value:"start", type:"variable"}} ], type:"set-expression" }
//		}]
//},
//head: { atom : 
//	{
//		type:"relational-atom",//not necessary
//		entity: {value:"y", type:"variable"},
//		property:"P26",
//		pvalue: {value:"x", type:"variable"},
//		set: {
//			value:[{
//			attribute:{value:"P580", type:"property"},
//		    qvalue:{value:"start", type:"variable"}} ], type:"set-expression" }
//	}
//}
//},
//
//
	{
	body: { atoms : [
			{
				type: "set-atom",
				variable:"S",
				value:{
					attribute:{value:"P580", type:"property"},
				    qvalue:{value:"start", type:"variable"}} 
			},{
				type: "relational-atom",
				entity: {value:"x", type:"variable"},//Q57487)
				property: "P26",
				pvalue: {value:"y", type:"variable"},
				set: {value:"S", type:"set-variable" }
			}]
	},
	head: { atom : 
		{
			type:"relational-atom",//not necessary
			entity: {value:"y", type:"variable"},
			property:"P26",
			pvalue: {value:"x", type:"variable"},
			set: {value:"S", type:"set-variable" }
		}
	}
	},

	//
	{
	body: { atoms : [
			{
				type: "closed-specifier",
				variable:"S",
				value: [{//attribute:{value:"provar", type:"variable"},//
					attribute:{value:"P580", type:"property"},//attribute:{value:"attrvar", type:"variable"},//
					qvalue:{value:"start", type:"variable"}
				}]				
			},{
				type: "relational-atom",
				entity: {value:"x", type:"variable"},//Q57487)
				property: "P26",
				pvalue: {value:"y", type:"variable"},
				set: {value:"S", type:"set-variable" }
			}]
	},
	head: { atom : 
		{
			type:"relational-atom",//not necessary
			entity: {value:"y", type:"variable"},
			property:"P26",
			pvalue: {value:"x", type:"variable"},
			set: {value:"S", type:"set-variable" }
		}
	}
	},

	//
	{
	body: { atoms : [
			{
				type: "open-specifier",
				variable:"S",
				value: []				
			},{
				type: "relational-atom",
				entity: {value:"x", type:"variable"},//Q57487)
				property: "P26",
				pvalue: {value:"y", type:"variable"},
				set: {value:"S", type:"set-variable" }
			}]
	},
	head: { atom : 
		{
			type:"relational-atom",//not necessary
			entity: {value:"y", type:"variable"},
			property:"P26",
			pvalue: {value:"x", type:"variable"},
			set: {value:"S", type:"set-variable" }
		}
	}
	},


	//
	{
	body: { atoms : [
			{
				type: "relational-atom",
				entity: {value:"x", type:"variable"},//Q57487)
				property: "P26",
				pvalue: {value:"y", type:"variable"},
				set: {value:"S", type:"set-variable" }
			}]
	},
	head: { atom : 
		{
			type:"relational-atom",//not necessary
			entity: {value:"y", type:"variable"},
			property:"P26",
			pvalue: {value:"x", type:"variable"},
			set: {
				type:"function-term",
				value :[//only 1 action:
				          {
				        	  conditions:[
								{
									type: "set-atom",
									variable:"S",
									value:{
										attribute:{value:"P580", type:"property"},
									    qvalue:{value:"start", type:"variable"}} 
								}], 
							  insert:[
								{
								attribute:{value:"P580", type:"property"},
								qvalue:{value:"start", type:"variable"}
								}]
				          }]
			}//set
		}
	}
	},

//
{
body: {
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
},
head: { atom: 
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
	}
}
}
	];
		


var addIfNew = function(value, list) {
	if(list.indexOf(value)===-1) list.push(value);
};

//map contains a list per key
var put = function(map,key,value) {
	if(map[key] != null) map[key].push(value); //check for duplicates?
	map[key] = [value];
	return;
};

//merge first into second
var mergeMaps = function(map1,map2) {
	for (var key in map1) {
		  if (map1.hasOwnProperty(key)) {
			  if (map2.hasOwnProperty(key)) {
				  
				  map2[key]= map2[key].concat(map1[key]);
			  } else {
				  map2[key]= map1[key];
			  }
		  }
	}
};



//qualifier needs attribute and qvalue
//itementity is id or var
var addQualifierSPARQL = function(qualifier, stmtvar, sparql, itementity, itemid) { 
	
	var attrIsVar = (qualifier.attribute.type == "variable");
	var attr = attrIsVar ? "?"+qualifier.attribute.value
			: qualifier.attribute.value;

	var qvalueIsVar = (qualifier.qvalue.type == "variable") && !(qualifier.qvalue.value == itementity);
	var qvalue = !(qualifier.qvalue.type == "variable")  ? qualifier.qvalue.value : 
					qvalueIsVar ? "?"+qualifier.qvalue.value : itemid;
	
//	TODO maybe replace stmt attr value with other names. currently we have a problem if the variables in the rule have these names
	var s1;
	if(attrIsVar) {
		s1 =	" \n stmt attr value. \n\
				?dummyprop wikibase:qualifier attr";
		
		addIfNew(attr,sparql.selectvars);
		
	} else {
		s1 =	" \n stmt pq:attr value. \n";
	} 
	
	if(qvalueIsVar) addIfNew(qvalue,sparql.selectvars);

	sparql.where +=  s1
	.replace(/stmt/g, stmtvar)
	.replace(/attr/g, attr)
	.replace(/value/g, qvalueIsVar ? qvalue : "wd:"+qvalue);
	
};

//atom needs entity, property, and pvalue
//itementity is id or var, the term representing item in the rule
var addRelTripleSPARQL = function(atom, stmtvar, sparql, itementity, itemid, language) { 
	
	var entityIsVar = (atom.entity.type == "variable") && (atom.entity.value != itementity);
	var entity = (atom.entity.type != "variable") ? atom.entity.value : 
					entityIsVar ? "?"+atom.entity.value : itemid; 
	
	var pvalueIsVar = (atom.pvalue.type == "variable") && (atom.pvalue.value != itementity);
	var pvalue = (atom.pvalue.type != "variable") ? atom.pvalue.value : 
					pvalueIsVar ? "?"+atom.pvalue.value : itemid; 
	
	var lvar = stmtvar + "Label";
	
//	TODO maybe replace entity ... with other names. currently we have a problem if the variables in the rule have these names
	var s0 =	" \n\
	entity p:property stmt. \n\
	stmt ps:property value. \n\
	entity rdfs:label Label. "; //use a label to filter for language stmts

	
	if(entityIsVar) addIfNew(entity,sparql.selectvars);
	if(pvalueIsVar) addIfNew(pvalue,sparql.selectvars);
	addIfNew(stmtvar,sparql.selectvars);
	addIfNew(lvar,sparql.selectvars);

	sparql.where += s0
		.replace(/entity/g, entityIsVar ? entity : "wd:"+entity)
		.replace(/value/g, pvalueIsVar ? pvalue : "wd:"+pvalue)
		.replace(/property/g, atom.property)
		.replace(/stmt/g, stmtvar)
		.replace(/Label/g, lvar);
	
	sparql.filter += " FILTER (lang(" + lvar + ") = \""+ language +"\") .";
};



//	a relational atom, index for it, rule it occurs in, id of entity the inferred stmts are about
var getStatementVariable = function(atom, stmtIndex, rule, id) {
	
	var entityIsVar = (atom.entity.type == "variable") && (atom.entity.value != rule.head.atom.entity.value);
	var entity = (atom.entity.type != "variable") ? atom.entity.value : 
					entityIsVar ? "?"+atom.entity.value : id; 
	
	return (entityIsVar ? entity : "?"+entity) + "stmt" + stmtIndex;

};	


var addRelAtomSPARQL = function(atom, stmtIndex, rule, setVarMap, qvalueAtomMap, sparql, id, language) {
	
	var stmtVar = getStatementVariable(atom, stmtIndex, rule, id);
	
	addRelTripleSPARQL(atom,stmtVar,sparql,rule.head.atom.entity.value,id,language);
	
	var qualifiers = atom.set.type == "set-expression" ? atom.set.value : setVarMap[atom.set.value];
	
	angular.forEach(qualifiers, function(qualifier) {
		
		addQualifierSPARQL(qualifier,stmtVar,sparql,rule.head.atom.entity.value,id);		
		
		qvalueAtomMap[qualifier.qvalue.value] = stmtIndex;
	});	

}

//for all set variables, collect the qualifiers mentioned with it
var getSetQualifiers = function(atoms) {
	var sets = new Object();
	
	angular.forEach(atoms, function(atom) {
		if(atom.type == "set-atom") { 
			put(sets, atom.variable, atom.value);
			
		} else if(atom.type == "closed-specifier" || atom.type == "open-specifier") {
			angular.forEach(atom.value, function(qualifier) {
				put(sets, atom.variable, qualifier);
			});
		}
	});
	
	return sets;
};

//for all set variables, collect the info if an open specifier is part
var getSetOpenInfo = function(atoms) {
	var sets = new Object();
	
	angular.forEach(atoms, function(atom) {
		if(atom.type == "open-specifier") {
			sets[atom.variable] = true;
		}
	});
	
	return sets;
};


var getRelAtom = function(rule, index) {	
	
	var j = 0;
	for (var i = 0; i < rule.body.atoms.length; i++) {
		if(rule.body.atoms[i].type == "relational-atom"){
			if(index == j) return rule.body.atoms[i];
			j++;
		}
	}
//	why does this not work?
//	angular.forEach(rule.body.atoms, function(atom) {
//		if(atom.type == "relational-atom"){
//			if(index == i) return atom;
//			i++;
//		}
//	});
	
//	TODO this has not been tested yet:
	if(rule.head.atom.set.type == "function-term") {
		var actions = rule.head.atom.set.value;
		for (var i = 0; i < actions.length; i++) {
			for (var k = 0; k < actions[i].conditions.length; k++) {
				
				if(actions[i].conditions[k].type == "relational-atom"){
					if(index == j) return actions[i].conditions[k];
					j++;
				}
			}
		}
	}
	
	return null;
};

	
var getRules = function(id,language) {	
//	qvalueAtomMap: maps qualifiers to relational atom it is associated to (to ease property... finding later)
//	form: {rule: rule, qvalueatommap: qvalueAtomMap, sparql: query}
	var ruleData = [];
	
//	import rules from external source?
//		var promise= null;
//		if (!promise){
//			promise = $http.get("data/rules.json").then(function(response){
//				var JSONRules = response.rules;
	
	angular.forEach(JSONRules, function(rule) {
//		parameters to pass by reference
		var sparql = {
			selectvars: [],
			where: "",
			filter: ""
		}	
//		unique index for each relational atom in body and possibly function
		var stmtIndex = 0;

		var setVarMap = getSetQualifiers(rule.body.atoms);
		var setVarOpenInfo = getSetOpenInfo(rule.body.atoms);
		var qvalueAtomMap = new Object();//collect occurrence
		
		angular.forEach(rule.body.atoms, function(atom) {
			if(atom.type == "relational-atom"){
				
				addRelAtomSPARQL(atom, stmtIndex++, rule, setVarMap, qvalueAtomMap, sparql, id, language);
			}
		});
		
		
//		we (re)use the sparql.where to store the OPTIONAL, therefore save the real where
		var where = sparql.where;
		sparql.where =  "";	
		
		var optionals = "";
//		starts counting in parallel
		var stmtIndex2 = 0;
		
		if(rule.head.atom.set.type == "function-term") {
			
			angular.forEach(rule.head.atom.set.value, function(action) {

				var setVarMap2 = getSetQualifiers(action.conditions);
				mergeMaps(setVarMap2, setVarMap);
								
				angular.forEach(action.conditions, function(atom) {
//					we (can) assume that there are relational atoms in the body where the variable occurs in
					if(atom.type == "set-atom"){

						angular.forEach(rule.body.atoms, function(batom) {
							if(batom.type == "relational-atom"){ 
								
								if( batom.set.type == "set-variable" && batom.set.value == atom.variable){
									
									var stmtVar = getStatementVariable(batom, stmtIndex2, rule, id);
									addQualifierSPARQL(atom.value,stmtVar,sparql,rule.head.atom.entity.value,id);
									
//									we do not want to overwrite refs to (certain) body occurrences
									if(qvalueAtomMap[atom.value.qvalue.value] == null)
										qvalueAtomMap[atom.value.qvalue.value] = stmtIndex2;
								}
								
								stmtIndex2++;
							}
						});	
					}

					if(atom.type == "relational-atom"){

						addRelAtomSPARQL(atom, stmtIndex++, rule, setVarMap, qvalueAtomMap, sparql, id, language);
					}				
				});	
				optionals += " OPTIONAL {" + sparql.where + "} ";
			});		
		}
		
		//we assume each variable to occur only once!
		var select = "";
		angular.forEach(sparql.selectvars, function(v) {
			select +=  v + " ";
		});

		var query =	//sparql.getStandardPrefixes() 			currently too few 
			"PREFIX wd: <http://www.wikidata.org/entity/> \n" +
			"PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n" +
			"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
			"PREFIX ps: <http://www.wikidata.org/prop/statement/> \n" +
			"PREFIX pq: <http://www.wikidata.org/prop/qualifier/> \n" +
			"PREFIX wikibase: <http://wikiba.se/ontology#>" +
			
			"SELECT " + select + " WHERE { " + where + optionals + sparql.filter + " } LIMIT 10 ";
		
			
		ruleData.push({rule: rule, qvalueatommap: qvalueAtomMap, setvarmap: setVarMap, setvaropeninfo: setVarOpenInfo, sparql: query});
	
	});
	
	return ruleData;
};


var getQualifierSnaksForRule = function(itemId, qualifierset, open, rule, qvalueAtomMap, sparqlBindings, apiBindings) {
	var qualifiers = {};

	angular.forEach(qualifierset, function(qualifier) {
		
		var attrId = qualifier.attribute.type == "variable" ? 
				sparqlBindings[qualifier.attribute.value].value.substring("http://www.wikidata.org/prop/qualifier/".length) : qualifier.attribute.value;

		var snak = null;
		var isItem = qualifier.qvalue.type == "item";
		if (isItem) {
			snak = {
					snaktype: "value",
					property: attrId,
//						hash: "351acc5bd28610a98a591db9fc5ba31103a951b0",
					datatype: "wikibase-item",
					datavalue: {
						type: "wikibase-entityid",
						value: {
                            'entity-type': "item",
                            'numeric-id': qualifier.qvalue.value.substring(1),
                            id: qualifier.qvalue.value
                        }
					}
			}; 
		} else {
			var stmtIndex = qvalueAtomMap[qualifier.qvalue.value];
			
			var atom = getRelAtom(rule,stmtIndex);
			var entityId = atom.entity.type == "variable" ? 
					sparqlBindings[atom.entity.value].value.substring("http://www.wikidata.org/entity/".length) : atom.entity.value;				
			var pvalueId = atom.pvalue.type == "variable" ? 
					atom.pvalue.value == rule.head.atom.entity.value ? itemId :
						sparqlBindings[atom.pvalue.value].value.substring("http://www.wikidata.org/entity/".length) : atom.pvalue.value;
					
			var claimIndex;
			angular.forEach(apiBindings[entityId].claims[atom.property], function(claim, i) {
				if(claim.mainsnak.datavalue.value.id == pvalueId) {
					claimIndex = i;
				}
			});


			snak = apiBindings[entityId].claims[atom.property][claimIndex].qualifiers[attrId][0] ;//TODO fix the [0]
		}


		if (! (qualifier.attribute.value in qualifiers) ) {
			qualifiers[attrId] = [];
		}
		qualifiers[attrId].push(snak);
	
	});
	
	return qualifiers;
};

//assume atom of type "function-term"
//TODO implement
var getFunctionQualifiers = function(atom, sparqlBindings, apiBindings) { //itemId, ruleData, allSparqlBindings, apiBindings, statements, propertyIds, itemIds) { 
	//check which optionals retrieved non null data, add inserts of those 
	var qualifiers = [];
//	angular.forEach(atom.value, function(action) {
//		if(true) { // look for a variable and check if in sparqlbindings sparqlBindings[action.conditions[0]]) {
//			angular.forEach(action.insert, function(qualifier) {
//				qualifiers.push(qualifier);
//			});
//		}
//	});
	return qualifiers;
};

//var getSetVarQualifiers = function(setVar, ruleData, apiBindings) { //itemId, ruleData, allSparqlBindings, apiBindings, statements, propertyIds, itemIds) { 
//	//check which optionals retrieved non null data, add inserts of those 
//	var qualifiers =  ruleData.setvarmap[setVar];
//	
////	angular.forEach(atom.value, function(action) {
////		if(true) { // look for a variable and check if in sparqlbindings sparqlBindings[action.conditions[0]]) {
////			angular.forEach(action.insert, function(qualifier) {
////				qualifiers.push(qualifier);
////			});
////		}
////	});
//	return qualifiers;
//};

var addInferredFromQuery = function(itemId, ruleData, allSparqlBindings, apiBindings, statements, propertyIds, itemIds) { 
	
	var rule = ruleData.rule;

	angular.forEach(allSparqlBindings, function(sparqlBindings) {
		
		var property = rule.head.atom.property;
		var pvalue = rule.head.atom.pvalue.type == "variable" ? sparqlBindings[rule.head.atom.pvalue.value].value
				.substring("http://www.wikidata.org/entity/".length) : rule.head.atom.pvalue.value;
	
		if (! (property in statements) ) {
			statements[property] = [];
			propertyIds[property] = true;
		}

//TODO consider case that too many? 
//TODO we currently only consider statements the other case, not sure how to consider the first	
		var entityType;
//					if (pvalue.substring(0,1) == "P") {
//						entityType = "property";
//						propertyIds[pvalue] = true;
//					} else
		{
			entityType = "item";
			itemIds[pvalue] = true;
		}
		
		var qset = rule.head.atom.set.type == "set-expression" ? rule.head.atom.set.value : 
			rule.head.atom.set.type == "set-variable" ? ruleData.setvarmap[rule.head.atom.set.value] : //getSetVarQualifiers(rule.head.atom.set.value, ruleData, apiBindings) :
				rule.head.atom.set.type == "function-term" ? getFunctionQualifiers(rule.head.atom.set, sparqlBindings, apiBindings) : [];//latter should never be the case?

		var open = ruleData.setvaropeninfo[rule.head.atom.set.value] == true;
		

		var value = { "entity-type": entityType, "numeric-id": pvalue.substring(1)};
		
		var snak = {
			snaktype: "value",
			property: property,
			datatype: "wikibase-item",
			datavalue: {value: value, type: "wikibase-entityid"}
		}; 

//		TODO fix 
		var stmtId = 0;
		var stmt = { mainsnak: snak, rank: "normal", type: "statement", 
				id: stmtId, 
				qualifiers: getQualifierSnaksForRule(itemId, qset, open, rule, ruleData.qvalueatommap, sparqlBindings, apiBindings)
		}; 
		
		statements[property].push(stmt);
	});

}



var getStatementsInferred = function(id) {
	
	var language = i18n.getLanguage();
	
	var rules = getRules(id, language);
	var requests = [];
	
	angular.forEach(rules, function (rule) {
		requests.push(sparql.getQueryRequest(rule.sparql));
	});
	
	var statements = {};
	var propertyIds = {};
	var itemIds = {};
	
	return $q.all(requests).then( function(responses) {
		
//		collect the ids needed to request the qualifiers
		var resultEntities = [];
		angular.forEach(responses, function (response, i) {
			
			var entities = [];
			var properties = [];
		
			angular.forEach(rules[i].rule.body.atoms, function (atom) {
				
				if(atom.type == "relational-atom") { 
					if(atom.entity.type == "variable") {
						angular.forEach(response.results.bindings, function (result) {
							entities.push(result[atom.entity.value].value
									.substring("http://www.wikidata.org/entity/".length));	
						});
					} else {
						entities.push(atom.entity.value);
					};			
					
					properties.push(atom.property);
				}
			});	
			//TODO test the following if
			if(rules[i].rule.head.atom.set.type == "function-term") {
				angular.forEach(rules[i].rule.head.atom.set.value, function (action) {
					angular.forEach(action.conditions, function (atom) {
						if(atom.type == "relational-atom") { 
							if(atom.entity.type == "variable") {
								angular.forEach(response.results.bindings, function (result) {
									entities.push(result[atom.entity.value].value
											.substring("http://www.wikidata.org/entity/".length));	
								});
							} else {
								entities.push(atom.entity.value);
							};			
						
						properties.push(atom.property);
					}
					});

				});	
			}
			
			
			
			
			resultEntities.push({ entityids:entities, properties:properties });
		});
	
		return	wikidataapi.getEntityPropertyClaims(resultEntities,language).then(function(responses2){
			
			for (var i = 0; i < rules.length; i ++) {
				addInferredFromQuery(id, rules[i], responses[i].results.bindings, responses2[i].entities, 
						statements, propertyIds, itemIds );
			}
			
			return { statements:statements, propertyids: propertyIds,itemids:itemIds};
			
		});		
	});
};




//----------------------------------------------------------------------------------------------------------------
// ALL BELOW IS TEST CODE
//----------------------------------------------------------------------------------------------------------------


var addInferredFromQuery2 = function(itemId, ruleData, qvalueAtomMap, allSparqlBindings, apiBindings, statements, propertyIds, itemIds) { 
	var sparqlBindings = allSparqlBindings[0];
	
	var rule = ruleData.rule;
	
	var property = rule.head.atom.property;
	var pvalue = rule.head.atom.pvalue.type == "variable" ? sparqlBindings[rule.head.atom.pvalue.value].value
			.substring("http://www.wikidata.org/entity/".length) : rule.head.atom.pvalue.value;

	if (! (property in statements) ) {
		statements[property] = [];
		propertyIds[property] = true;
	}

// consider case that too many? 
// we currently only consider statements the other case, not sure how to consider the first	
	var entityType;
//				if (pvalue.substring(0,1) == "P") {
//					entityType = "property";
//					propertyIds[pvalue] = true;
//				} else
	{
		entityType = "item";
		itemIds[pvalue] = true;
	}

	var value = { "entity-type": entityType, "numeric-id": pvalue.substring(1)};
	
	var snak = {
		snaktype: "value",
		property: property,
		datatype: "wikibase-item",
		datavalue: {value: value, type: "wikibase-entityid"}
	}; 
	
//	 fix 
	var stmtId = 0;
//	the set may be a variable/action! so fix qualifiers, 
	var stmt = { mainsnak: snak, rank: "normal", type: "statement", 
			id: stmtId, 
			qualifiers: []//getQualifierSnaksForRule(rule.head.atom.set.value, rule, qvalueAtomMap, sparqlBindings, apiBindings)
	}; 
	return stmt;
	statements[property].push(stmt);
	
	
	angular.forEach(allSparqlBindings, function(sparqlBindings) {
		
		var property = rule.head.atom.property;
		var pvalue = rule.head.atom.pvalue.type == "variable" ? sparqlBindings[rule.head.atom.pvalue.value].value
				.substring("http://www.wikidata.org/entity/".length) : rule.head.atom.pvalue.value;
	
		if (! (property in statements) ) {
			statements[property] = [];
			propertyIds[property] = true;
		}

// consider case that too many? 
// we currently only consider statements the other case, not sure how to consider the first	
		var entityType;
//					if (pvalue.substring(0,1) == "P") {
//						entityType = "property";
//						propertyIds[pvalue] = true;
//					} else
		{
			entityType = "item";
			itemIds[pvalue] = true;
		}

		var value = { "entity-type": entityType, "numeric-id": pvalue.substring(1)};
		
		var snak = {
			snaktype: "value",
			property: property,
			datatype: "wikibase-item",
			datavalue: {value: value, type: "wikibase-entityid"}
		}; 
		
//		fix 
		var stmtId = 0;
//		 the set may be a variable/action! so fix qualifiers, 
		var stmt = { mainsnak: snak, rank: "normal", type: "statement", 
				id: stmtId, 
				qualifiers: []//getQualifierSnaksForRule(rule.head.atom.set.value, rule, qvalueAtomMap, sparqlBindings, apiBindings)
		}; 
		
		statements[property].push(stmt);
	});

}


//		{"mainsnak":{
	//	"snaktype":"value",
//			"property":"P1038",
//			"datavalue":{
//				"value":{"entity-type":"item","numeric-id":425612},
//				"type":"wikibase-entityid"},
//			"datatype":"wikibase-item"},
//		"type":"statement",
//		"qualifiers":{
//			"P1039":[{
//				"snaktype":"value",
//				"property":"P1039",
//				"hash":"b3aef1481fa4e9ea4e1e33e698a10e682c547361",
//				"datavalue":{"value":{"entity-type":"item","numeric-id":9238344},
//							"type":"wikibase-entityid"},
//				"datatype":"wikibase-item"}]
//			},"qualifiers-order":["P1039"],"id":"Q1339$a89859aa-4010-4d06-a3ac-aa7966be0cbe","rank":"normal"}
var getQualifierData22 = function(bindings, bindings2, set, qvalueAtomMap, rule) {
	var qualifiers = {};
	var qualifier = set[0];

	var attr = qualifier.attribute.type=="variable" ? bindings[qualifier.attribute.value] : qualifier.attribute.value;
var stmtIndex = qvalueAtomMap[qualifier.qvalue.value];
				
				var atom = rule.body.atoms[stmtIndex];
				var entityId = atom.entity.type == "variable" ? bindings[atom.entity.value] : atom.entity.value;
			return entityId ;
			var snak = bindings2[entityId].claims[atom.property][0].qualifiers[attr][0] ;//fix the [0]
			
			
			
//		
//		return set[0].attribute.type=="variable" ? bindings[set[0].attribute.value] : set[0].attribute.value;
	angular.forEach(set, function(qualifier) {
		
		
		
		var x = set[0].attribute.type=="variable" ? bindings[set[0].attribute.value] : set[0].attribute.value;
		return bindings;
		var stmtIndex = headqualifiers[x];
		
		var atom = rule.body.atoms[stmtIndex];//also head!
		
//			var entity = bindings[atom.entity.value];
		
//			var snak = bindings2.
//			
		var pqsnak = {
				snaktype: "value",
				property: qualifier.attribute.value,//bindings[qualifier.attribute].value,// might be no var
				datatype: "string",//x.type,//or type?
				datavalue: atom//{//value: bindings[qualifier.value].value, type: template.type}
			}; 

		if (! (qualifier.attribute.value in qualifiers) ) {
			qualifiers[qualifier.attribute.value] = [];
		}
			qualifiers[qualifier.attribute.value].push(pqsnak);
	
});

		
		return qualifiers;
	}
			


	
var getTest = function(id) {
	
	
	var language = i18n.getLanguage();
	
	var rules = getRules(id, language);
	var requests = [];
	
	angular.forEach(rules, function (rule) {
		requests.push(sparql.getQueryRequest(rule.sparql));
	});
	
	var statements = {};
//	 return below
	var propertyIds = {};
	var itemIds = {};
	
	return $q.all(requests).then( function(responses) {
		return rules[0];
//		collect the ids needed to request the qualifiers
		var resultEntities = []; //return responses;
		angular.forEach(responses, function (response, i) {
			
			var entities = [];
			var properties = [];
			
			angular.forEach(rules[i].rule.body.atoms, function (atom) {
				
				if(atom.type == "relational-atom") { 
					if(atom.entity.type == "variable") {	
						angular.forEach(response.results.bindings, function (result) {
							entities.push(result[atom.entity.value].value
									.substring("http://www.wikidata.org/entity/".length));	
						});
					} else {
						entities.push(atom.entity.value);
					};			
					
					properties.push(atom.property);
				}
			});	
//			 collect also those from the actions!
			
			resultEntities.push({ entityids:entities, properties:properties });
		});
		
		return	wikidataapi.getEntityPropertyClaims(resultEntities,language).then(function(responses2){
//			return responses[0].results.bindings;
			for (var i = 0; i < rules.length; i ++) {
				addInferredFromQuery(id, rules[i],//rules[i].qvalueatommap,
						responses[i].results.bindings,responses2[i].entities, 
						statements, propertyIds, itemIds );
			}
			
			return statements;
			
		});		
	});
};



return {
		getStatementsInferred: getStatementsInferred,
		getTest:getTest
	};
}]);

return {}; }); // module definition end