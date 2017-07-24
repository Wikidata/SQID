//////// Module Definition ////////////
define([
	'util/util.module',
    'util/ruleParser.service',
    'util/rulesProvider.service',
    'util/wikidataapi.service',
    'util/util.service',
    'util/sparql.service',
    'i18n/i18n.service'
], function() {
///////////////////////////////////////
//	NEXT TODO (for veronika) make closed specs work. and closed and open ones in conditionals
//
//	we assume
//	- the rules to be correct syntactically (see the MARS paper)
//	- every set variable to occur only in a single relational atom
//	- no complex specifier terms anywhere
//	- there are no set atoms of the form "tuple \in set expression", where the set expression does not contain variables
//	  (such atoms are generally allowed, but I do not see any sense in them?)
//	- no closed specifiers in conditionals - currently in general! TODO
//
//  TODO open spec in function term, is regarded as open in general.
//	that is not correct if the conditionals do not apply. should we disallow open specs in conditionals
//	(they can be expressed as set atoms anyway) or fix that?
//
//  TODO how to find the correct qualifier attributes when the ful snaks have been requested?...
//	...we do not have an id/hash for them in the sparql result
//
//	the entry point: getStatementsInferred
//	- getRules: import rules, collect info about set terms, generate sparql queries
//	- collect ids of stmts to request and get them
//	- create corresponding snaks

angular.module('util').factory('rules', [
    'ruleParser', 'rulesProvider', 'wikidataapi', 'util', 'i18n', 'sparql', '$q', '$http', '$log',
    function(ruleParser, rulesProvider, wikidataapi, util, i18n, sparql, $q, $http, $log) {

        function getStatements(newData, oldData, $scope) {
            var entityData = newData[0];
            var entityInData = newData[1];

            if (!entityData || !entityInData) {
                return;
            }

            entityData.waitForPropertyLabels().then(function() {
                entityInData.waitForPropertyLabels().then(function() {
                    var id = $scope.id;
                    $log.debug('infer rules for ' + id);
                    $log.debug(entityData);
                    $log.debug(entityInData);

                    var candidateRules = rulesProvider.getRules()
                        .filter(couldMatch(entityData.statements,
                                           entityInData.statements,
                                           $scope));

                    angular.forEach(candidateRules, function(rule) {
                        var subject = rule.head.arguments[0].name;
                        var binding = makeBinding(subject,
                                                  id,
                                                  entityData,
                                                  entityInData);
                        var instances = getBodyInstances(rule,
                                                         binding);

                        angular.forEach(instances, function(instance) {
                            $log.debug(ruleParser.print(rule),
                                       instance);
                        });
                    });
                });
            });
        }

        function hasMatchingStatement(statements, predicate, object) {
            var predicates = Object.keys(statements);

            if (predicate.type === 'literal') {
                predicates = [predicate.name];

                if (!(predicate.name in statements)) {
                    return false;
                }
            }

            if ((!object) ||
                (object.type === 'variable')) {
                return true;
            }

            return predicates.some(function(pred) {
                return statements[pred].some(function(stmt) {
                    return (stmt.mainsnak.datavalue.value === stmt.name);
                });
            });
        }

        function couldMatch(data, inboundData, scope) {
            return function(rule) {
                var subject = rule.head.arguments[0];

                if (subject.type === 'literal' &&
                    subject.name != scope.id) {
                    return false;
                }

                return rule.body.every(function(atom) {
                    if (atom.type !== 'relational-atom') {
                        return true;
                    }

                    if ((atom.arguments[0].name === subject.name) &&
                        (!hasMatchingStatement(data,
                                               atom.predicate,
                                               atom.arguments[1]))) {
                        return false;
                    }

                    if ((atom.arguments[1].name === subject.name) &&
                        (!hasMatchingStatement(inboundData,
                                               atom.predicate))) {
                        return false;
                    }

                    return true;
                });
            };
        }

        function makeBinding(subject, id, data, inboundData) {
            var obj = {};
            obj[subject] = { id: id,
                             outbound: data,
                             inbound: inboundData
                           };

            return obj;
        }

        function getBodyInstances(rule, bindings) {
            var constraints = [];

            if (!bindings) {
                bindings = {};
            }

            var candidateInstances = getInstanceCandidates(rule, bindings);

            return candidateInstances;
        }

        function getInstanceCandidates(rule, bindings, maxInstances) {
            if(!isFinite(maxInstances) || maxInstances <= 0) {
                maxInstances = 10;
            }

            var sparqlBindings = [];
            var sparqlPatterns = [];

            angular.forEach(rule.body, function(atom, key) {
                var namespace = '?_body_' + key + '_';
                var fragment = sparqlFragmentForAtom(atom, bindings, namespace);
                sparqlBindings = sparqlBindings.concat(fragment.bindings);
                sparqlPatterns = sparqlPatterns.concat(fragment.patterns);
            });

            var interestingVariables = [];

            angular.forEach(ruleParser.variables(rule.head),
                            function(variable) {
                                if ((variable.type !== 'variable') ||
                                    (variable.name in bindings)) {
                                    return;
                                }

                                interestingVariables.push(variable.name);
                            });

            sparqlBindings = util.unionArrays(sparqlBindings,
                                              interestingVariables);

            $log.debug(sparqlQueryFromFragments(sparqlBindings,
                                                sparqlPatterns,
                                                maxInstances));
        }

        function sparqlFragmentForAtom(atom, variableBindings, namespace) {
            var variables = 0;
            var bindings = [];
            var patterns = [];
            var constraints = [];

            function addPattern (subject, predicate, object) {
                patterns.push([subject, predicate, object].join(' '));
            }

            function freshVar() {
                return namespace + ++variables;
            }

            function maybeBinding(name, prefix) {
                if (!prefix) {
                    prefix = '';
                } else if (prefix.slice !== ':') {
                    prefix += ':';
                }

                if ('name' in name) {
                    name = name.name;
                }

                if (name in variableBindings) {
                    return prefix + variableBindings[name].id;
                } else if (ruleParser.isVariableName(name)) {
                    return name;
                }

                return prefix + name;
            }

            function bindingOrFreshVarWithEquality(set) {

            }

            function isVar(name) {
                return name.startsWith('?');
            }

            switch (atom.type) {
            case 'relational-atom':
                var subject = maybeBinding(atom.arguments[0], 'wd');
                var predicate = maybeBinding(atom.predicate, 'p');
                var statement = freshVar();
                var object = maybeBinding(atom.arguments[1], 'wd');

                addPattern(subject, predicate, statement);

                if (isVar(predicate)) {
                    // we don't know the exact predicate (it's a variable),
                    // so we have to query for the corresponding node

                    var ps = freshVar;
                    var property = freshVar();
                    addPattern(property, ps, object);
                    addPattern(property, 'wikibase:claim', predicate);
                    addPattern(property, 'wikibase:statementProperty', ps);
                } else {
                    // this is the easy case, we find the corresponding
                    // node by replacing the `p'-prefix with `ps. in
                    // the predicate

                    addPattern(statement, 'ps' + predicate.slice(1), object);
                }

                bindings = bindings.concat([subject, predicate, statement, object]
                                           .filter(isVar));
                break;

            case 'specifier-atom':
                // first, make sure that the set variable we use is unique,
                // but remember that we introduced that binding, since the
                // variable might appear in another atom and we'd have to
                // ensure that the corresponding annotations are equal—
                // we can't reuse the variable in the query because it might
                // correspnod to a qualifier for a different statement and
                // thus be a different individual in the reified RDF graph.
                //
                // note that we cannot simply _always_ use a fresh variable,
                // since we do want this variable to join with a relational
                // atom.

                var set = bindingOrFreshVarWithEquality(atom.set);
                bindings.push(set);

            default:
                $log.debug("Unkown atom type `" + atom.type +
                           "', don't know how to construct query fragment");
                break;
            }

            return { bindings: bindings,
                     patterns: patterns,
                     constraints: constraints
                   };
        }

        function sparqlQueryFromFragments(bindings, patterns, limit) {
            var query = "SELECT DISTINCT " + bindings.join(" ") +
                "\nWHERE {\n  " + patterns.join(" .\n  ") +
                "\n} LIMIT " + limit;

            return query;
        }

var SPARQL_LIMIT = 100;
//TODO select one
//prefix we use for variables in SPARQL. disallow for user variables
var VAR_PREFIX = "?VAR";


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

var isSPARQLVar = function(object, itemInRule) {

	return (object.type == "variable") && (object.value != itemInRule);
};

//object needs type and value
var getSPARQLTerm = function(object, itemInRule, itemId) {

	return (object.type != "variable")  ? object.value :
		isSPARQLVar(object, itemInRule) ? "?"+object.value : itemId;
};

//qualifier needs attribute and qvalue
//itemInRule is id or var
var addQualifierSPARQL = function(qualifier, stmtvar, pvalue, sparql, itemInRule, itemId) {

	var attrIsVar = isSPARQLVar(qualifier.attribute, itemInRule);
	var attr = getSPARQLTerm(qualifier.attribute, itemInRule, itemId);


	var qvalueIsVar = isSPARQLVar(qualifier.qvalue, itemInRule);
	var qvalue = getSPARQLTerm(qualifier.qvalue, itemInRule, itemId);

	var value = qvalueIsVar ? qvalue : "wd:"+qvalue;

	if(attrIsVar) {
		sparql.where +=
			" \n "+
			stmtvar +" "+
			attr +" "+
			(qvalueIsVar ? qvalue : "wd:"+qvalue) + ". " +
			VAR_PREFIX+attr.substring(1)+"qualifier " +
			"wikibase:qualifier " +
			attr + ". ";

		addIfNew(attr,sparql.selectvars);

	} else {
		sparql.where +=
			" \n "+
			stmtvar + " "+
			"pq:"+ attr + " " +
			(qvalueIsVar ? qvalue : "wd:"+qvalue) +". ";
	}

	if(qvalueIsVar) addIfNew(qvalue,sparql.selectvars);

};

//atom needs entity, property, and pvalue
//itementity is id or var, the term representing item in the rule
var addRelTripleSPARQL = function(atom, stmtvar, sparql, itemInRule, itemId) {

	var entityIsVar = isSPARQLVar(atom.entity, itemInRule);
	var entity = getSPARQLTerm(atom.entity, itemInRule, itemId);

	var pvalueIsVar = isSPARQLVar(atom.pvalue, itemInRule);
	var pvalue = getSPARQLTerm(atom.pvalue, itemInRule, itemId);

	sparql.where += 	" \n "+
	(entityIsVar ? entity : "wd:"+entity) + " " +
	"p:" + atom.property + " " +
	stmtvar + ". \n " +
	stmtvar + " " +
	"ps:" + atom.property + " " +
	(pvalueIsVar ? pvalue : "wd:"+pvalue) + ". ";

	if(entityIsVar) addIfNew(entity,sparql.selectvars);
	if(pvalueIsVar) addIfNew(pvalue,sparql.selectvars);
	addIfNew(stmtvar,sparql.selectvars);


};



//	a relational atom, index for it, rule it occurs in, id of entity the inferred stmts are about
var getStatementVariable = function(atom, index, itemInRule, itemId) {

	var entityIsVar = atom.entity.type=="variable";//isSPARQLVar(atom.entity, itemInRule);
	var entity = atom.entity.value;//getSPARQLTerm(atom.entity, itemInRule, itemId);

	return VAR_PREFIX + entity//(entityIsVar ? entity.substring(1) : entity) + "stmt" + index;
//	entity.substring(1)
	+ "stmt" + index;

};


var addRelAtomSPARQL = function(atom, index, rule, setVarQualifiersMap, qvalueRAtomMap, sparql, id) {

	var stmtVar = getStatementVariable(atom, index, rule, id);

	addRelTripleSPARQL(atom,stmtVar,sparql, rule.head.atom.entity.value,id);

	var qualifiers = atom.set.type == "set-expression" ? atom.set.value : setVarQualifiersMap[atom.set.value];
	var pvalue = getSPARQLTerm(atom.pvalue, rule.head.atom.entity.value, id);

	angular.forEach(qualifiers, function(qualifier) {

		addQualifierSPARQL(qualifier,stmtVar, atom.property, sparql,rule.head.atom.entity.value,id);

		qvalueRAtomMap[qualifier.qvalue.value] = index;
	});

}

//for all set variables, collect the qualifiers mentioned with it
var getSetVarQualifiers = function(atoms) {
	var sets = new Object();

	angular.forEach(atoms, function(atom) {
		if(atom.type == "set-atom") {
			put(sets, atom.variable, atom);

		} else if(atom.type == "closed-specifier" || atom.type == "open-specifier") {
			angular.forEach(atom.value, function(qualifier) {
				put(sets, atom.variable, qualifier);
			});
		}
	});

	return sets;
};

//currently not used. sth did not work
//var getSetVarsRelAtomIndex = function(varname, rule) {
//	var index = 0;
//	for (var i = 0; i < rule.body.atoms.length; i++) {
//		if(rule.body.atoms[i].type == "relational-atom"){
//
//			if(rule.body.atoms[i].set.type == "variable" &&
//					rule.body.atoms[i].set.value == varname) return index;
//
//			index++;
//		}
//	}
//
//	return -1;//should not occur since MAPLE requires each set var to occur in a relational atom
//};


//for all set variables, collect the info if an open specifier is part of its specification
var getOpenSpecRAtomMap = function(rule, setVarRAtomMap) {
	var sets = new Object();

	angular.forEach(rule.body.atoms, function(atom) {

		if(atom.type == "open-specifier") {
			sets[atom.variable] = setVarRAtomMap[atom.variable].index;
		}

	});
//	TODO open spec in function term, is regarded as open in general.
//	that is not correct (if conditionals do not apply). should we disallow open specs in conditionals? same can be expressed as set atoms
	if(rule.head.atom.set.type == "function-term") {

		angular.forEach(rule.head.atom.set.value, function(f) {
			angular.forEach(f.conditions, function(atom) {
				if(atom.type == "open-specifier") {
					sets[atom.variable] = setVarRAtomMap[atom.variable].index;
				}

			});
		});
	}

	return sets;
};

////we currently assume each set var to occur only in one rel atom
//var getSetVarAtomIndexMap = function(rule) {
//	var index = 0;
//	var result = new Object();
//
//	angular.forEach(rule.body.atoms, function(atom) {
//		if(atom.type == "relational-atom") {
//			if(atom.set.type == "set-variable")
//				result[atom.set.value] = index;
//
//			index++;
//		}
//	});
//
//}

//we currently assume each set var to occur only in one rel atom
var getSetVarRAtomMap = function(rule) {
	var index = 0;
	var result = new Object();

	angular.forEach(rule.body.atoms, function(atom) {
		if(atom.type == "relational-atom" && atom.set.type == "set-variable") {
				result[atom.set.value] = {atom:atom, index:index};
		}
		index++;
	});

	return result;
}

var getAtom = function(rule, index) {


	if(index < rule.body.atoms.length)
		return rule.body.atoms[index];

	if(rule.head.atom.set.type == "function-term") {

		var j = rule.body.atoms.length-1;
		var functions = rule.head.atom.set.value;

		for (var i = 0; i < functions.length; i++) {

			if(index < j + functions[i].conditions.length)
				return functions[i].conditions[index-j];

			j += functions[i].conditions.length;

		}
	}

	return null;
};




var getRules = function(id) {

	var ruleData = [];

//TODO	import rules from external source?
	angular.forEach(ruleExamples.getRules(), function(rule) {
//		parameters to pass by reference
		var sparql = {
			selectvars: [],
			where: "",
			filter: ""
		}

//		atom in rule
		var index = 0;

		var setVarQualifiersMap = getSetVarQualifiers(rule.body.atoms);
		var setVarRAtomMap = getSetVarRAtomMap(rule);
		var openSpecRAtomMap = getOpenSpecRAtomMap(rule, setVarRAtomMap);
//		qvalueRAtomMap: maps qualifiers to relational atom it is associated to (to ease property... finding later)
		var qvalueRAtomMap = new Object();

		angular.forEach(rule.body.atoms, function(atom) {
			if(atom.type == "relational-atom"){

				addRelAtomSPARQL(atom, index, rule, setVarQualifiersMap, qvalueRAtomMap, sparql, id);
			}
			index++;
		});


//		we (re)use the sparql.where/filter to store the OPTIONAL/OPTIONAL filters, therefore save the real ones
		var where = sparql.where;
		var filter = sparql.filter;
		sparql.where =  "";
		sparql.filter =  "";

		var optionals = "";


		if(rule.head.atom.set.type == "function-term") {
			var entityTerm0;
			angular.forEach(rule.head.atom.set.value, function(f, findex) {

				var setVarQualifiersMap2 = getSetVarQualifiers(f.conditions);
				mergeMaps(setVarQualifiersMap, setVarQualifiersMap2);

				angular.forEach(f.conditions, function(atom, i) {
//					we (can) assume that there are relational atoms in the body where the variable occurs in
					if(atom.type == "set-atom"){

						var batom = setVarRAtomMap[atom.variable].atom;
						var index2 = setVarRAtomMap[atom.variable].index;
						var stmtVar = getStatementVariable(batom, index2, rule, id);
						var pvalue = getSPARQLTerm(batom.pvalue, rule.head.atom.entity.value, id);

						addQualifierSPARQL(atom,stmtVar,pvalue,sparql,rule.head.atom.entity.value,id);

//						we do not want to overwrite refs to (certain) body occurrences
						if(qvalueRAtomMap[atom.qvalue.value] == null)
							qvalueRAtomMap[atom.qvalue.value] = index2;

						if(i==0) entityTerm0 = getSPARQLTerm(batom.entity,rule.head.atom.entity.value,id);

					} else if(atom.type == "open-specifier" || atom.type == "closed-specifier"){ //TODO closed not tested yet

						var batom = setVarRAtomMap[atom.variable].atom;
						var index2 = setVarRAtomMap[atom.variable].index;
						var stmtVar = getStatementVariable(batom, index2, rule, id);
						var pvalue = getSPARQLTerm(batom.pvalue, rule.head.atom.entity.value, id);

						angular.forEach(atom.value, function(atom) {

							addQualifierSPARQL(atom,stmtVar,pvalue,sparql,rule.head.atom.entity.value,id);

//							we do not want to overwrite refs to (certain) body occurrences
							if(qvalueRAtomMap[atom.qvalue.value] == null)
								qvalueRAtomMap[atom.qvalue.value] = index2;

						});

						if(i==0) entityTerm0 = getSPARQLTerm(batom.entity,rule.head.atom.entity.value,id);
					}

					index++;

				});


				optionals += " OPTIONAL {" + sparql.where + sparql.filter + " } ";
				sparql.where =  "";
				sparql.filter =  "";

			});
		}

		//we assume each variable to occur only once!
		var select = "";
		angular.forEach(sparql.selectvars, function(v) {
			select +=  v + " ";
		});

		var query =	//sparql.getStandardPrefixes() 			currently too few
			"PREFIX wd: <http://www.wikidata.org/entity/> \n " +
			"PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n " +
			"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n " +
			"PREFIX ps: <http://www.wikidata.org/prop/statement/> \n " +
			"PREFIX pq: <http://www.wikidata.org/prop/qualifier/> \n " +
			"PREFIX pqv: <http://www.wikidata.org/prop/qualifier/value/> \n " +
			"PREFIX wikibase: <http://wikiba.se/ontology#> \n " +

			"SELECT " + select + " WHERE { " + where + optionals + filter + " } LIMIT " + SPARQL_LIMIT;


		ruleData.push({rule: rule, 	//setvaratommap: setVarAtomMap,
			qvalueratommap: qvalueRAtomMap, setvarqualifiersmap: setVarQualifiersMap, openspecratommap: openSpecRAtomMap,
			sparql: query});

	});

	return ruleData;
};


var getQualifierSnaksForRule = function(itemId, qualifierset, openAtomIndex, rule, qvalueRAtomMap, sparqlBindings, apiBindings, atomsToStmts) {
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
		} else {//we assume it is a variable
			var index = qvalueRAtomMap[qualifier.qvalue.value];
			var stmtIndexInApiBindings = atomsToStmts[index];

			var atom = getAtom(rule,index);

//			TODO the last [0] is not correct, but how to find the correct qualifier. we do not have an id/hash for that in the sparql result
//			TODO the first [0] is correct, right? for a statement property, there is only one object?!
//			we probably would have to iterate over all and compare to the simple value from the sparql result
			snak = apiBindings[stmtIndexInApiBindings].claims[atom.property][0].qualifiers[attrId][0];
//			for (var qsnak in apiBindings[stmtIndexInApiBindings].claims[atom.property][0].qualifiers[attrId]) {
//				if(qsnak.hash == qvalueHash) {
//					snak = qsnak;
//					break;
//				}
//			}
		}


		if (! (attrId in qualifiers) ) {
			qualifiers[attrId] = [];
		}
		qualifiers[attrId].push(snak);

	});



	if(openAtomIndex != null) {

		var stmtIndexInApiBindings = atomsToStmts[openAtomIndex];
		var atom = getAtom(rule,openAtomIndex);

		var qualifiersJSON = apiBindings[stmtIndexInApiBindings].claims[atom.property][0].qualifiers;

		for (var attrId in qualifiersJSON) {
			  if (qualifiersJSON.hasOwnProperty(attrId)) {
				  angular.forEach(qualifiersJSON[attrId], function(snak) {

						if (! (attrId in qualifiers) ) {
							qualifiers[attrId] = [];
						}
						qualifiers[attrId].push(snak);
					});
			  }
		}
	}



	return qualifiers;
};


var allSetAtomVarsBound = function(atom, sparqlBindings) {

	if(atom.attribute.type == "variable" &&
			!sparqlBindings.hasOwnProperty(atom.attribute.value))
		return false;
	if(atom.qvalue.type == "variable" &&
			!sparqlBindings.hasOwnProperty(atom.qvalue.value))
		return false;

	return true;
};

var allSpecifierAtomVarsBound = function(atom, sparqlBindings) {

	for(var i = 0; i < atom.value.length; i++) {
		if(!allSetAtomVarsBound(atom.value[i], sparqlBindings))
			return false;
	}

	return true;
};

//assume: atom of type "function-term"
//return: qualifiers if all corresponding variables are in sparql result (conditionals were in sparql's optional)
var getFunctionQualifiers = function(atom, sparqlBindings) {
	var qualifiers = [];


	angular.forEach(atom.set.value, function(f) {

		var conditionalsSat = true;

		for (var i = 0; i < f.conditions.length; i++) {
			var atom = f.conditions[i];

			if(atom.type == "set-atom") {
				if(!allSetAtomVarsBound(atom, sparqlBindings)) {
					conditionalsSat = false;
					break;
				}
			} else if(atom.type == "open-specifier" || atom.type == "closed-specifier") {
				if(!allSpecifierAtomVarsBound(atom, sparqlBindings)) {
					conditionalsSat = false;
					break;
				}
			}
//			TODO add complex specifiers
		}

		if(conditionalsSat) {
			angular.forEach(f.insert, function(qualifier) {
				qualifiers.push(qualifier);
			});
		}

	});

	return qualifiers;
};


var addInferredFromQuery = function(itemId, ruleData, allSparqlBindings, apiBindings, atomsToStmts, statements, propertyIds, itemIds) {

	var rule = ruleData.rule;

	angular.forEach(allSparqlBindings, function(sparqlBindings, i) {

		var property = rule.head.atom.property;
		var pvalue = rule.head.atom.pvalue.type == "variable" ? sparqlBindings[rule.head.atom.pvalue.value].value
				.substring("http://www.wikidata.org/entity/".length) : rule.head.atom.pvalue.value;

		if (! (property in statements) ) {
			statements[property] = [];
			propertyIds[property] = true;
		}

//TODO consider case that too many?
		var entityType;
		if (pvalue.substring(0,1) == "P") {
			entityType = "property";
			propertyIds[pvalue] = true;
		} else {
			entityType = "item";
			itemIds[pvalue] = true;
		}

		var qset = rule.head.atom.set.type == "set-expression" ? rule.head.atom.set.value :
			rule.head.atom.set.type == "set-variable" ? ruleData.setvarqualifiersmap[rule.head.atom.set.value] :
				rule.head.atom.set.type == "function-term" ? getFunctionQualifiers(rule.head.atom,sparqlBindings) : [];// ruleData, sparqlBindings, apiBindings, itemId) : [];//latter should never be the case?

		var openAtomIndex = ruleData.openspecratommap[rule.head.atom.set.value];


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
				qualifiers: getQualifierSnaksForRule(itemId, qset, openAtomIndex, rule, ruleData.qvalueratommap, sparqlBindings, apiBindings,  atomsToStmts[i])
		};

		statements[property].push(stmt);
	});

}



var getStatementsInferred = function(id) {

	var rules = getRules(id);
	var requests = [];

	angular.forEach(rules, function (rule) {
		requests.push(sparql.getQueryRequest(rule.sparql));
	});

	var statements = {};
	var propertyIds = {};
	var itemIds = {};

	return $q.all(requests).then( function(responses) {

//		collect the ids needed to request the qualifiers
		var stmtIds = [];
//		we request a stmt only once so map possibly several relational relational atoms to one stmt
		var atomsToStmts = [];

		angular.forEach(responses, function (response, i) {
			var atomsToStmts1 = [];

			angular.forEach(response.results.bindings, function (result, k) {

				var atomsToStmts2 = [];

				var index = 0;
				angular.forEach(rules[i].rule.body.atoms, function (atom) {

					if(atom.type == "relational-atom") {
						var sv = getStatementVariable(atom, index, rules[i].rule.head.atom.entity.value, id).substring(1);

						var stmtId = result[sv].value
							.substring("http://www.wikidata.org/entity/statement/".length).replace('-','$');
						var j = stmtIds.indexOf(stmtId);
						if(j == -1) {
							stmtIds.push(stmtId);
							atomsToStmts2[index] = stmtIds.length-1;
						} else {
							atomsToStmts2[index] = j;
						}

					}
					index++;
				});

				atomsToStmts1.push(atomsToStmts2);
			});
			atomsToStmts.push(atomsToStmts1);
		});



		return	wikidataapi.getClaims(stmtIds).then(function(apiBindings){

			for (var i = 0; i < rules.length; i ++) {
				addInferredFromQuery(id, rules[i], responses[i].results.bindings,
						apiBindings, atomsToStmts[i],
						statements, propertyIds, itemIds );
			}


			return { statements:statements, propertyids:propertyIds, itemids:itemIds};

		});
	});
};


        return {
            getStatements: getStatements,
            getStatementsInferred: getStatementsInferred
        };
}]);

return {}; }); // module definition end
