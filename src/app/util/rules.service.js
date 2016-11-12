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
	
	

	var JSONRules = [
	//
{
body: { atoms : [
		{
			type: "relational",
			entity: {value:"x", type:"variable"},//Q57487)
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {
				value:[{
				attribute:{value:"P580", type:"property"},
			    qvalue:{value:"start", type:"variable"}} ], type:"set" }
		}]
},
head: { atom : 
	{
		type:"relational",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {
			value:[{
			attribute:{value:"P580", type:"property"},
		    qvalue:{value:"start", type:"variable"}} ], type:"set" }
	}
}
},

//
//	{
//	body: { atoms : [
//			{
//				type: "set",
//				variable:"S",
//				attribute:{value:"P580", type:"property"},
//				qvalue:{value:"start", type:"variable"}
//			},{
//				type: "relational",
//				entity: {value:"x", type:"variable"},//Q57487)
//				property: "P26",
//				pvalue: {value:"y", type:"variable"},
//				set: {value:"S", type:"variable" }
//			}]
//	},
//	head: { atom : 
//		{
//			type:"relational",//not necessary
//			entity: {value:"y", type:"variable"},
//			property:"P26",
//			pvalue: {value:"x", type:"variable"},
//			set: {value:"S", type:"variable" }
//		}
//	}
//	},
//
//	//
//	{
//	body: { atoms : [
//			{
//				type: "specifier",
//				variable:"S",
//				value: [{
//					attribute:{value:"attrvar", type:"variable"},//attribute:{value:"P580", type:"property"},
//					qvalue:{value:"start", type:"variable"}
//				}]				
//			},{
//				type: "relational",
//				entity: {value:"x", type:"variable"},//Q57487)
//				property: "P26",
//				pvalue: {value:"y", type:"variable"},
//				set: {value:"S", type:"variable" }
//			}]
//	},
//	head: { atom : 
//		{
//			type:"relational",//not necessary
//			entity: {value:"y", type:"variable"},
//			property:"P26",
//			pvalue: {value:"x", type:"variable"},
//			set: {value:"S", type:"variable" }
//		}
//	}
//	},
//
//	//
//	{
//	body: { atoms : [
//			{
//				type: "relational",
//				entity: {value:"x", type:"variable"},//Q57487)
//				property: "P26",
//				pvalue: {value:"y", type:"variable"},
//				set: {value:"S", type:"variable" }
//			}]
//	},
//	head: { atom : 
//		{
//			type:"relational",//not necessary
//			entity: {value:"y", type:"variable"},
//			property:"P26",
//			pvalue: {value:"x", type:"variable"},
//			set: {type:"function",
//				actions :
//					[
//					 {conditions:[
//						{
//							type: "set",
//							variable:"S",
//							attribute:{value:"P580", type:"property"},
//							qvalue:{value:"start", type:"variable"}
//						}
//					  ], 
//					  insert:[
//	{
//	attribute:{value:"P580", type:"property"},
//	qvalue:{value:"start", type:"variable"}
//	}
//					          ]
//				}]
//			}
//		}
//	}
//	},
//
//
{
body: {
	atoms : [
		{
			type: "relational",
		entity: {value:"gf", type:"variable"},
		property: "P21",
		pvalue: {value:"Q6581097", type:"item"},
		set: {}
	},
	{
		type: "relational",
		entity: {value:"gf", type:"variable"},
		property: "P40",
		pvalue: {value:"f", type:"variable"},
		set: {}
	},{
		type: "relational",
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
		value:[{
		attribute:{value:"P1039", type:"property"},
	    qvalue:{value:"Q9238344", type:"item"}} ], type:"set" }
		
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
			  if (map2.hasOwnProperty(v)) {
				  
				  setVars2[v]= setVars2[v].concat(setVars[v]);
			  } else {
				  setVars2[v]= setVars[v];
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
	
	var qualifiers = atom.set.type == "set" ? atom.set.value : setVarMap[atom.set.value];
	
	angular.forEach(qualifiers, function(qualifier) {
		
		addQualifierSPARQL(qualifier,stmtVar,sparql,rule.head.atom.entity.value,id);		
		
		qvalueAtomMap[qualifier.qvalue.value] = stmtIndex;
	});	

}

//for all set variables, collect the qualifiers mentioned with it
var getSetQualifiers = function(atoms) {
	var sets = new Object();
	
	angular.forEach(atoms, function(atom) {
		if(atom.type == "set") { 
			put(sets, atom.variable, atom);
		} else if(atom.type == "specifier") {
			angular.forEach(atom.value, function(qualifier) {
				put(sets, atom.variable, qualifier);
			});
		}
	});
	
	return sets;
};

	
//TODO check: resolve qualifiers needed for head correct?
var getRules = function(id,language) {	
//	qvalueAtomMap: maps qualifiers to relational atom it is associated to (to ease property... finding later)
//	form: {rule: rule, qvalueatommap: qvalueAtomMap, sparql: query}
	var ruleData = [];
	
//	TODO import rules from external source
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
		var qvalueAtomMap = new Object();//collect occurrence
		
		angular.forEach(rule.body.atoms, function(atom) {
			if(atom.type == "relational"){
				
				addRelAtomSPARQL(atom, stmtIndex++, rule, setVarMap, qvalueAtomMap, sparql, id, language);
			}
		});
		
		
//		we (re)use the sparql.where to store the OPTIONAL, therefore save the real where
		var where = sparql.where;
		sparql.where =  "";	
		
		var optionals = "";
//		starts counting in parallel
		var stmtIndex2 = 0;
			
		if(rule.head.atom.set.type == 'function') {
			
			angular.forEach(rule.head.atom.set.actions, function(action) {

				var setVarMap2 = getSetQualifiers(action.conditions);
				mergeMaps(setVarMap, setVarMap2);
								
				angular.forEach(action.conditions, function(atom) {
//					we (can) assume that there are relational atoms in the body where the variable occurs in
					if(atom.type == "set"){

						angular.forEach(rule.body.atoms, function(batom) {
							if(batom.type == "relational"){ 
								
								if( batom.set.type == "variable" && batom.set.value == atom.variable){
									
									var stmtVar = getStatementVariable(batom, stmtIndex2, rule, id);
									addQualifierSPARQL(atom,stmtVar,sparql,rule.head.atom.entity.value,id);
									
//									we do not want to overwrite refs to (certain) body occurrences
									if(qvalueAtomMap[atom.qvalue.value] == null)
										qvalueAtomMap[atom.qvalue.value] = stmtIndex2;
								}
								
								stmtIndex2++;
							}
						});	
					}

					if(atom.type == "relational"){

						addRelAtomSPARQL(atom, stmtIndex++, rule, setVarMap2, qvalueAtomMap, sparql, id, language);
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
		
			
		ruleData.push({rule: rule, qvalueatommap: qvalueAtomMap, sparql: query});
	
	});
	
	return ruleData;
};


var getQualifierSnaksForRule = function(qualifierset, rule, qvalueAtomMap, sparqlBindings, apiBindings) {
	var qualifiers = {};

	angular.forEach(qualifierset, function(qualifier) {
		
		var attr = qualifier.attribute.type == 'variable' ? sparqlBindings[qualifier.attribute.value] : qualifier.attribute.value;

		var snak = null;
		var isItem = qualifier.qvalue.type == 'item';
		if (isItem) {
			snak = {
					snaktype: 'value',
					property: attr,
//						hash: "351acc5bd28610a98a591db9fc5ba31103a951b0",
					datatype: 'wikibase-item',
					datavalue: {
						type: 'wikibase-entityid',
						value: {
                            'entity-type': 'item',
                            'numeric-id': qualifier.qvalue.value.substring(1),
                            id: qualifier.qvalue.value
                        }
					}
			}; 
		} else {
			var stmtIndex = qvalueAtomMap[qualifier.qvalue.value];
			
			var atom = rule.body.atoms[stmtIndex];
			var entityId = atom.entity.type == 'variable' ? sparqlBindings[atom.entity.value].value
					.substring("http://www.wikidata.org/entity/".length) : atom.entity.value;
			
			snak = apiBindings[entityId].claims[atom.property][0].qualifiers[attr][0] ;//TODO fix the [0]s
		}


		if (! (qualifier.attribute.value in qualifiers) ) {
			qualifiers[attr] = [];
		}
		qualifiers[qualifier.attribute.value].push(snak);
	
	});
	
	return qualifiers;
}


var addInferredFromQuery = function(itemId, rule, qvalueAtomMap, allSparqlBindings, apiBindings, statements, propertyIds, itemIds) { 

	angular.forEach(allSparqlBindings, function(sparqlBindings) {
		
		var property = rule.head.atom.property;
		var pvalue = rule.head.atom.pvalue.type == 'variable' ? sparqlBindings[rule.head.atom.pvalue.value].value
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

		var value = { "entity-type": entityType, "numeric-id": pvalue.substring(1)};
		
		var snak = {
			snaktype: "value",
			property: property,
			datatype: "wikibase-item",
			datavalue: {value: value, type: "wikibase-entityid"}
		}; 
		
//		TODO fix 
		var stmtId = 0;
//		TODO the set may be a variable/action! so fix qualifiers, 
		var stmt = { mainsnak: snak, rank: "normal", type: "statement", 
				id: stmtId, 
				qualifiers: getQualifierSnaksForRule(rule.head.atom.set.value, rule, qvalueAtomMap, sparqlBindings, apiBindings)
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
//	TODO return below
	var propertyIds = {};
	var itemIds = {};
	
	return $q.all(requests).then( function(responses) {
		
//		collect the ids needed to request the qualifiers
		var resultEntities = [];
		angular.forEach(responses, function (response, i) {
			
			var entities = [];
			var properties = [];
		
			angular.forEach(rules[i].rule.body.atoms, function (atom) {
				
				if(atom.type == 'relational') { 
					if(atom.entity.type == 'variable') {
						entities.push(response.results.bindings[0][atom.entity.value].value
							.substring("http://www.wikidata.org/entity/".length));						
					} else {
						entities.push(atom.entity.value);
					};			
					
					properties.push(atom.property);
				}
			});	
//			TODO collect also those from the actions!
			
			resultEntities.push({ entityids:entities, properties:properties });
		});
	
		return	wikidataapi.getEntityPropertyClaims(resultEntities,language).then(function(responses2){
			
			for (var i = 0; i < rules.length; i ++) {
				addInferredFromQuery(id, rules[i].rule,rules[i].qvalueatommap,
						responses[i].results.bindings,responses2[i].entities, 
						statements, propertyIds, itemIds );
			}
			
			return statements;
			
		});		
	});
};







var addInferredFromQuery2 = function(itemId, rule, qvalueAtomMap, allSparqlBindings, apiBindings, statements, propertyIds, itemIds) { 
	var sparqlBindings = allSparqlBindings[0];
	
	var property = rule.head.atom.property;
	var pvalue = rule.head.atom.pvalue.type == 'variable' ? sparqlBindings[rule.head.atom.pvalue.value].value
			.substring("http://www.wikidata.org/entity/".length) : rule.head.atom.pvalue.value;

	if (! (property in statements) ) {
		statements[property] = [];
		propertyIds[property] = true;
	}

//TODO consider case that too many? 
//TODO we currently only consider statements the other case, not sure how to consider the first	
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
	
//	TODO fix 
	var stmtId = 0;
//	TODO the set may be a variable/action! so fix qualifiers, 
	var stmt = { mainsnak: snak, rank: "normal", type: "statement", 
			id: stmtId, 
			qualifiers: []//getQualifierSnaksForRule(rule.head.atom.set.value, rule, qvalueAtomMap, sparqlBindings, apiBindings)
	}; 
	return stmt;
	statements[property].push(stmt);
	
	
	angular.forEach(allSparqlBindings, function(sparqlBindings) {
		
		var property = rule.head.atom.property;
		var pvalue = rule.head.atom.pvalue.type == 'variable' ? sparqlBindings[rule.head.atom.pvalue.value].value
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

		var value = { "entity-type": entityType, "numeric-id": pvalue.substring(1)};
		
		var snak = {
			snaktype: "value",
			property: property,
			datatype: "wikibase-item",
			datavalue: {value: value, type: "wikibase-entityid"}
		}; 
		
//		TODO fix 
		var stmtId = 0;
//		TODO the set may be a variable/action! so fix qualifiers, 
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

	var attr = qualifier.attribute.type=='variable' ? bindings[qualifier.attribute.value] : qualifier.attribute.value;
var stmtIndex = qvalueAtomMap[qualifier.qvalue.value];
				
				var atom = rule.body.atoms[stmtIndex];
				var entityId = atom.entity.type == 'variable' ? bindings[atom.entity.value] : atom.entity.value;
			return entityId ;
			var snak = bindings2[entityId].claims[atom.property][0].qualifiers[attr][0] ;//TODO fix the [0]
			
			
			
//		
//		return set[0].attribute.type=='variable' ? bindings[set[0].attribute.value] : set[0].attribute.value;
	angular.forEach(set, function(qualifier) {
		
		
		
		var x = set[0].attribute.type=='variable' ? bindings[set[0].attribute.value] : set[0].attribute.value;
		return bindings;
		var stmtIndex = headqualifiers[x];
		
		var atom = rule.body.atoms[stmtIndex];//also head!
		
//			var entity = bindings[atom.entity.value];
		
//			var snak = bindings2.
//			
		var pqsnak = {
				snaktype: "value",
				property: qualifier.attribute.value,//bindings[qualifier.attribute].value,//TODO might be no var
				datatype: 'string',//x.type,//or type?
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
//	TODO return below
	var propertyIds = {};
	var itemIds = {};
	
	return $q.all(requests).then( function(responses) {

//		collect the ids needed to request the qualifiers
		var resultEntities = []; //return responses;
		angular.forEach(responses, function (response, i) {
			
			var entities = [];
			var properties = [];
			
			angular.forEach(rules[i].rule.body.atoms, function (atom) {
				
				if(atom.type == 'relational') { 
					if(atom.entity.type == 'variable') {
						entities.push(response.results.bindings[0][atom.entity.value].value
							.substring("http://www.wikidata.org/entity/".length));						
					} else {
						entities.push(atom.entity.value);
					};			
					
					properties.push(atom.property);
				}
			});	
//			TODO collect also those from the actions!
			
			resultEntities.push({ entityids:entities, properties:properties });
		});
		
		return	wikidataapi.getEntityPropertyClaims(resultEntities,language).then(function(responses2){
//			return responses[0].results.bindings;
			for (var i = 0; i < rules.length; i ++) {
				addInferredFromQuery(id, rules[i].rule,rules[i].qvalueatommap,
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