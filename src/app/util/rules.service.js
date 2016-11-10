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
{
body: { atoms : [
		{
			type: "set",
			variable:"S",
			attribute:{value:"P580", type:"property"},
			qvalue:{value:"start", type:"variable"}
		},{
			type: "relational",
			entity: {value:"x", type:"variable"},//Q57487)
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"variable" }
		}]
},
head: { atom : 
	{
		type:"relational",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {value:"S", type:"variable" }
	}
}
},

//
{
body: { atoms : [
		{
			type: "specifier",
			variable:"S",
			value: [{
				attribute:{value:"attrvar", type:"variable"},//attribute:{value:"P580", type:"property"},
				qvalue:{value:"start", type:"variable"}
			}]				
		},{
			type: "relational",
			entity: {value:"x", type:"variable"},//Q57487)
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"variable" }
		}]
},
head: { atom : 
	{
		type:"relational",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {value:"S", type:"variable" }
	}
}
},

//
{
body: { atoms : [
		{
			type: "relational",
			entity: {value:"x", type:"variable"},//Q57487)
			property: "P26",
			pvalue: {value:"y", type:"variable"},
			set: {value:"S", type:"variable" }
		}]
},
head: { atom : 
	{
		type:"relational",//not necessary
		entity: {value:"y", type:"variable"},
		property:"P26",
		pvalue: {value:"x", type:"variable"},
		set: {type:"function",
			actions :
				[
				 {conditions:[
					{
						type: "set",
						variable:"S",
						attribute:{value:"P580", type:"property"},
						qvalue:{value:"start", type:"variable"}
					}
				  ], 
				  insert:[
{
attribute:{value:"P580", type:"property"},
qvalue:{value:"start", type:"variable"}
}
				          ]
			}]
		}
	}
}
},

//
{
body: {
	atoms : [
		{
			type: "relational",
			entity: {value:"gf", type:"variable"},
			property: "P21",
			pvalue: {value:"Q6581097", type:"constant"},
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
		    qvalue:{value:"Q9238344", type:"constant"}} ], type:"set" }
		
	}
}
}
];
	
var getEntityDataInferred = function(id) {
	
	var language = i18n.getLanguage();
	var label = '';
	
	var rules = getRules(id, language);
	
	
	var requests = [];
	angular.forEach(rules, function (rule) {
		requests.push( sparql.getQueryRequest(rule.sparql) );
	});
	
	var statements = {};
	var propertyIds = {};
	var itemIds = {};

	return $q.all(requests).then( function(responses) {
		
		var resultEntities = [];
		
//		angular.forEach(responses, function (response,i) {
//			var entityIds = [];
//			var properties = [];
//
//			
//			angular.forEach(rules[i].atoms, function (atom) {
//				
//				if(atom.type=='relational') {
//					if(atom.value.entity.type=='variable') {
//						entityIds.push(response.results.bindings[0][atom.value.entity.value].value);						
//					} else {
//						entityIds.push(atom.value.entity.value);
//					};
//					
//					properties.push(atom.value.property);
//				}
//				
//
//			});		
//			resultEntities.push({entityids:entityIds,
//				properties:properties});
//		});
		
//			entityIds,properties//
		
//			wikidataapi.//getEntityPropertyClaims(resultEntities,language).//
//			getEntityTerms(['Q1339'],'en').
//			then(function(resp){

//				if(resp.entities.Q1339 == null);// return;
			
			for (var i = 0; i < rules.length; i ++) {
				addStatementsInfFromQuery2(rules[i].rule,responses[i].results.bindings,//resp.entities.Q1339, 
						statements, propertyIds, itemIds, id);//, id, propIds[i]);
			}
			
			return getEntityDataInfRecord(language, label, id, statements);// propertyIds, itemIds);
			
		});
//			return getEntityDataInfRecord(language, label, id, statements);
//		});
};


var put = function(map,key,value) {
	if(map[key] != null) map[key].push(value); //check for duplicates?
	map[key] = [value];
	return;
};

var mergeIntoSec = function(map1,map2) {
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

//atom needs entity, property, and pvalue
//unique index to build unique stmt var
//itementity is id or var; term representing item in the rule
var getRelAtomSPARQL = function(atom, stmtindex, itementity, itemid, language) { 

	var s0 =	" \n\
	entity p:property stmt. \n\
	stmt ps:property value. \n\
	entity rdfs:label Label. "; //use a label to filter for language stmts

	
	var entityIsVar = (atom.entity.type == "variable") && (atom.entity.value != itementity);
	var entity = (atom.entity.type != "variable") ? atom.entity.value : 
					entityIsVar ? "?"+atom.entity.value : itemid; 
	
	var pvalueIsVar = (atom.pvalue.type == "variable") && (atom.pvalue.value != itementity);
	var pvalue = (atom.pvalue.type != "variable") ? atom.pvalue.value : 
					pvalueIsVar ? "?"+atom.pvalue.value : itemid; 
	
	var svar = (entityIsVar ? entity : "?"+entity) + "stmt" + stmtindex;
	var lvar = svar + "Label";
	
	var select = [];
	
	if(entityIsVar) select.push(entity);
	if(pvalueIsVar) select.push(pvalue);
	select.push(svar);
	select.push(lvar);

	var where = s0
		.replace(/entity/g, entityIsVar ? entity : "wd:"+entity)
		.replace(/value/g, pvalueIsVar ? pvalue : "wd:"+pvalue)
		.replace(/property/g, atom.property)
		.replace(/stmt/g, svar)
		.replace(/Label/g, lvar);
	
	var filter = " FILTER (lang(" + lvar + ") = \""+ language +"\") .";

	return {selectvars:select, where:where, filter:filter, stmtvar:svar};	
};

//qualifier needs attribute and qvalue
//itementity is id or var
var getQualifierSPARQL = function(qualifier, stmtvar, itementity, itemid) { //TODO case if qualifier is var!
	
	var select = [];
	var where = "";
	
	var attrIsVar = (qualifier.attribute.type == "variable");
	var attr = attrIsVar ? "?"+qualifier.attribute.value//+"attribute" 
			: qualifier.attribute.value;

	var qvalueIsVar = (qualifier.qvalue.type == "variable") && !(qualifier.qvalue.value == itementity);
	var qvalue = !(qualifier.qvalue.type == "variable")  ? qualifier.qvalue.value : 
					qvalueIsVar ? "?"+qualifier.qvalue.value : itemid;
	
	var s1;
	if(attrIsVar) {
		s1 =	" \n stmt attr value. \n\
				?dummyprop wikibase:qualifier attr";
		
		select.push(attr);
		
	} else {
		s1 =	" \n stmt pq:attr value. \n";
	} 
	
	if(qvalueIsVar) select.push(qvalue);

	where +=  s1
	.replace(/stmt/g, stmtvar)
	.replace(/attr/g, attr)
	.replace(/value/g, qvalueIsVar ? qvalue : "wd:"+qvalue);

	
	return {selectvars:select, where:where};	
};

//for all set variables, collect the qualifiers mentioned with it
var getSetConstraints = function(atoms) {
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
//	var promise= null;
//	if (!promise){
//		promise = $http.get("data/rules.json").then(function(response){
//			var JSONRules2 = response.rules;

	var ruleData = [];
	angular.forEach(JSONRules, function(rule) {

		var sparql = {
			selectvars: [],
			select: "",
			where: "",
			filter: ""
		}	
		
		var stmtIndex = 0;

		var setVars = getSetConstraints(rule.body.atoms);
		var headQualifiers = new Object();//collect occurrence
		
		angular.forEach(rule.body.atoms, function(atom) {
			if(atom.type == "relational"){
				
				processRelAtom(atom, stmtIndex++, sparql, headQualifiers, setVars, rule, id, language);
			}
		});
		
		
		sparql2 = {
				selectvars: sparql.selectvars,
				select: sparql.select,
				where: "",
				filter: sparql.filter
		}	
		
		var stmtIndex2 = 0;
		var optionals = "";
		
		if(rule.head.atom.set.type == 'function') {
			
			angular.forEach(rule.head.atom.set.actions, function(action) {

				var setVars2 = getSetConstraints(action.conditions);
				mergeIntoSec(setVars,setVars2);
								
				angular.forEach(action.conditions, function(atom) {
//					we can assume that there are relational atoms in the body the variable occurs in
					if(atom.type == "set"){

						angular.forEach(rule.body.atoms, function(batom) {
							if(batom.type == "relational"){ 
								stmtIndex2++;
								if( batom.set.type == "variable" && batom.set.value == atom.variable){
									
									
									var entityIsVar = (batom.entity.type == "variable") && (batom.entity.value != rule.head.atom.entity.value);
									var entity = (batom.entity.type != "variable") ? batom.entity.value : 
													entityIsVar ? "?"+batom.entity.value : id; 

									
									var stmtVar = (entityIsVar ? entity : "?"+entity) + "stmt" + (stmtIndex2-1);
									
									
									
									var s = getQualifierSPARQL(atom,stmtVar,rule.head.atom.entity.value,id);
									
									angular.forEach(s.selectvars, function(v) {
										sparql2.select += (sparql2.selectvars.indexOf(v)===-1) ? v + " " : "";
										sparql2.selectvars.push(v);
									});
									
									sparql2.where += s.where;		
									
//									we do not want to overwrite refs to (certain) body occurrences
									if(headQualifiers[atom.qvalue.value] == null)
									headQualifiers[atom.qvalue.value] = stmtIndex2-1;
								}
							}
						});	
					}

					if(atom.type == "relational"){
						
						processRelAtom(atom, stmtIndex++, sparql2, headQualifiers, setVars2, rule, id, language);
					}				
				});	
				optionals += " OPTIONAL {" + sparql2.where + "} ";
				sparql2.where = "";
			});		
		}

		var q =	//sparql.getStandardPrefixes() 			currently too few 
			"PREFIX wd: <http://www.wikidata.org/entity/> \n" +
			"PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n" +
			"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
			"PREFIX ps: <http://www.wikidata.org/prop/statement/> \n" +
			"PREFIX pq: <http://www.wikidata.org/prop/qualifier/> \n" +
			"PREFIX wikibase: <http://wikiba.se/ontology#>" +
			
			"SELECT " + sparql2.select + " WHERE { " + sparql.where + optionals + sparql2.filter + " } LIMIT 10 ";
		
			
		ruleData.push({rule: rule, headqualifiers: headQualifiers, sparql: q});
	
	});
	
	
	
	return ruleData;
	
//	
//		});
//	}
};
	


var processRelAtom = function(atom, stmtIndex, sparql, headQualifiers, setVars, rule, id, language) {
	
	var s = getRelAtomSPARQL(atom,stmtIndex,rule.head.atom.entity.value, id,language);
	
	angular.forEach(s.selectvars, function(v) {
		sparql.select += (sparql.selectvars.indexOf(v)===-1) ? v + " " : "";
		sparql.selectvars.push(v);
	});
	
	sparql.where += s.where;				
	sparql.filter += s.filter;
	
	var stmtVar = s.stmtvar;
	
	if(atom.set.type == "set") {
		angular.forEach(atom.set.value, function(qualifier) {
			
			var s = getQualifierSPARQL(qualifier,stmtVar,rule.head.atom.entity.value,id);
			
			angular.forEach(s.selectvars, function(v) {
				sparql.select += (sparql.selectvars.indexOf(v)===-1) ? v + " " : "";
				sparql.selectvars.push(v);
			});
			
			sparql.where += s.where;		
			
			headQualifiers[qualifier.qvalue.value] = stmtIndex;
			
		});	
	} else { //set variable
		var qualifiers = setVars[atom.set.value];
		
		angular.forEach(qualifiers, function(qualifier) {
			
			var s = getQualifierSPARQL(qualifier,stmtVar,rule.head.atom.entity.value,id);
			
			angular.forEach(s.selectvars, function(v) {
				sparql.select += (sparql.selectvars.indexOf(v)===-1) ? v + " " : "";
				sparql.selectvars.push(v);
			});
			
			sparql.where += s.where;			
			
			headQualifiers[qualifier.qvalue.value] = stmtIndex;
		});	
	}

}


	

var addStatementsInfFromQuery2 = function(rule, instanceJson, statements, propertyIds, itemIds, objectId) { // fixedPropId

	angular.forEach(instanceJson, function(result) {
		var vstr = rule.head.atom.pvalue.value;//rule.body.relatoms[0].entity.value;//+ "entity";//rule.head.value + "entity";
		var eid = rule.head.atom.pvalue.type=='variable' ? 
				result[vstr].value.substring("http://www.wikidata.org/entity/".length) : rule.head.pvalue.value;
		
		
//				var eid = rule.body.relatoms[0].entity.type=='variable' ? 
//					result[vstr].value.substring("http://www.wikidata.org/entity/".length) : rule.body.relatoms[0].entity.value;
		var pid = rule.head.atom.property;
//				TODO new stmt id
		var sid = 0;

	
		if (! (pid in statements) ) {
			statements[pid] = [];
			propertyIds[pid] = true;
		}

//TODO consider case that too many? 
//TODO need the following?				
		var entityType;
//				if (eid.substring(0,1) == "P") {
//					entityType = "property";
//					propertyIds[eid] = true;
//				} else
		{
			entityType = "item";
			itemIds[eid] = true;
		}

		var value = { "entity-type": entityType, "numeric-id": parseInt(eid.substring(1))};
		
		var snak = {
			snaktype: "value",
			property: pid,
			datatype: "wikibase-item",
			datavalue: {value: value, type: "wikibase-entityid"}
		}; 
		
		var stmt = { mainsnak: snak, rank: "normal", type: "statement", 
				id: sid, 
				qualifiers: []//getQualifierData(result, rule.head.atom.set.value)
				}; 
		
		statements[pid].push(stmt);
	});

}

	
//	{"mainsnak":{
	//	"snaktype":"value",
//		"property":"P1038",
//		"datavalue":{
//			"value":{"entity-type":"item","numeric-id":425612},
//			"type":"wikibase-entityid"},
//		"datatype":"wikibase-item"},
//	"type":"statement",
//	"qualifiers":{
//		"P1039":[{
//			"snaktype":"value",
//			"property":"P1039",
//			"hash":"b3aef1481fa4e9ea4e1e33e698a10e682c547361",
//			"datavalue":{"value":{"entity-type":"item","numeric-id":9238344},
//						"type":"wikibase-entityid"},
//			"datatype":"wikibase-item"}]
//		},"qualifiers-order":["P1039"],"id":"Q1339$a89859aa-4010-4d06-a3ac-aa7966be0cbe","rank":"normal"}
var getQualifierData = function(bindings, set) {
	var qualifiers = {};
	
	angular.forEach(set, function(qualifier) {
		
		var x = bindings[qualifier.qvalue.value];
		
		var pqsnak = {
				snaktype: "value",
				property: qualifier.attribute.value,//bindings[qualifier.attribute].value,//TODO might be no var
				datatype: x.type,//or type?
				datavalue: x.value//{//value: bindings[qualifier.value].value, type: template.type}
			}; 

		if (! (qualifier.attribute.value in qualifiers) ) {
			qualifiers[qualifier.attribute.value] = [];
		}
			qualifiers[qualifier.attribute.value].push(pqsnak);
	
});
		
//		angular.forEach(templates, function(template) {
//			
//			if (! (template.property in qualifiers) ) {
//				qualifiers[template.property] = [];
//			}
//
//			//TODO fix might be complex json with ref to q var
//			var value = (typeof template.value == 'string' || template.value instanceof String) ?
//					bindings[template.value].value : template.value;
//			
//			//var pqvalue = { "time": entityType };//, "numeric-id": parseInt(eid.substring(1)) };
//			var pqsnak = {
//				snaktype: "value",
//				property: template.property,
//				datatype: template.datatype,
//				datavalue: {value: value, type: template.type}
//			}; 
//
//			qualifiers[template.property].push(pqsnak);
//		});
	
//		angular.forEach(bindings,function(binding, property) {
//			
//			}
//		});
	
	return qualifiers;
}
		

var getEntityDataInfRecord = function(language, label, id, statements) {
	return {
			language: language, // this is fixed for this result!
			label: label,//TODO what's that problem?
			labelorid: id,//TODO what's that problem? eid id? check stmt tab what it does
//				description: '',
//				aliases: [],
			statements: statements,
//				sitelinks: {},
			missing: false,
			termsPromise: null,
			propLabelPromise: null,
			waitForPropertyLabels: function() {
				if (this.propLabelPromise == null) {
					var propIdList = getPropertyIds(this.statements);
					this.propLabelPromise = i18n.waitForPropertyLabels(propIdList, language);
				}
				return this.propLabelPromise;
			},
			waitForTerms: function() {
				if (this.termsPromise == null) {
					var termIdList = getEntityIds(this.statements);
					this.termsPromise = i18n.waitForTerms(termIdList, language);
				}
				return this.termsPromise;
			}
		};
}


return {
		getEntityDataInferred: getEntityDataInferred,
	};
}]);

return {}; }); // module definition end