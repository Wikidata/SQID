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
angular.module('util').factory('rules', [
    'ruleParser', 'rulesProvider', 'wikidataapi', 'util', 'i18n', 'sparql', '$q', '$http', '$log',
    function(ruleParser, rulesProvider, wikidataapi, util, i18n, sparql, $q, $http, $log) {

        function getStatements(newData, oldData, $scope) {
            var queries = [];
            var requests = [];
            var entityData = newData[0];
            var entityInData = newData[1];

            if (!entityData || !entityInData) {
                return;
            }

            entityData.waitForPropertyLabels().then(function() {
                entityInData.waitForPropertyLabels().then(function() {
                    var id = $scope.id;
                    var candidateRules = rulesProvider.getRules()
                        .filter(couldMatch(entityData.statements,
                                           entityInData.statements,
                                           $scope));

                    angular.forEach(candidateRules, function(rule) {
                        var subject = rule.head.arguments[0].name;
                        var binding = {};
                        binding[subject] = { id: id,
                                             outbound: entityData,
                                             inbound: entityInData
                                           };

                        queries.push(getInstanceCandidatesQuery(rule,
                                                                binding));
                    });

                    angular.forEach(queries, function(query) {
                        var request = sparql.getQueryRequest(query.query);
                        query.request = request;

                        request.then(function(sparqlResults) {
                            // iterate over result instances
                            angular.forEach(sparqlResults.results, function(sparqlResult) {
                                // augment bindings with results from SPARQL
                                query.bindings = augmentBindingsWithSPARQLResult(
                                    query.bindings,
                                    sparqlResult
                                );

                                // find claims we need to retrieve
                                var claims = Object.keys(query.bindings)
                                    .filter(function(binding) {
                                        return ((query.bindings[binding].type ===
                                                 'set-variable') &&
                                                'id' in query.bindings[binding]);
                                    })
                                    .map(function(binding) {
                                        return query.bindings[binding].id;
                                    });
                                wikidataapi.getClaims(claims).then(function(apiResult) {
                                    query.bindings = augmentBindingsWithAPIResult(
                                        query.bindings,
                                        apiResult
                                    );

                                    var instance = verifyCandidateInstance(query);
                                    if (angular.isDefined(instance)) {
                                        var statement = instantiateRuleHead(instance);
                                        $log.debug(ruleParser.print(instance.rule),
                                                   'inferred statement:',
                                                   statement, '');
                                    }
                                });
                            });
                        });

                        requests.push(query);
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

        function getInstanceCandidatesQuery(rule, bindings, maxInstances) {
            if (angular.isUndefined(bindings)) {
                bindings = {};
            }

            if(!isFinite(maxInstances) || maxInstances <= 0) {
                maxInstances = 10;
            }

            var constraints = [];
            var sparqlBindings = [];
            var sparqlPatterns = [];
            var sparqlOptionals = [];

            angular.forEach(rule.body, function(atom, key) {
                var namespace = '?_body_' + key + '_';
                var fragment = sparqlFragmentForAtom(atom, bindings, namespace);
                sparqlBindings = sparqlBindings.concat(fragment.bindings);
                sparqlPatterns = sparqlPatterns.concat(fragment.patterns);
                sparqlOptionals = sparqlOptionals.concat(fragment.optionals);
                constraints = constraints.concat(fragment.constraints);
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

            // ensure that set variables in the head are always interesting
            if ('name' in rule.head.annotation) {
                interestingVariables.push(rule.head.annotation.name);
            }

            sparqlBindings = util.unionArrays(sparqlBindings,
                                              interestingVariables,
                                              [rule.head.annotation.name]);

            if (constraints.length > 0) {
                constraints = util.unionArrays(constraints, []);
            }

            var query = sparqlQueryFromFragments(sparqlBindings,
                                                sparqlPatterns,
                                                sparqlOptionals,
                                                 maxInstances);

            return { rule: rule,
                     query: query,
                     bindings: bindings,
                     constraints: constraints
                   };
        }

        function sparqlFragmentForAtom(atom, variableBindings, namespace) {
            var variables = 0;
            var bindings = [];
            var patterns = [];
            var optionals = [];
            var constraints = [];

            function addPattern(subject, predicate, object) {
                patterns.push([subject, predicate, object].join(' '));
            }

            function addConstraint(type) {
                var args = [];
                var length = arguments.length;

                // add remaining arguments (skip arguments[0], it is `type')
                for (var i = 1; i < length; ++i) {
                    if (angular.isString(arguments[i])) {
                        args.push(arguments[i]);
                    }
                }

                constraints.push({ type: type,
                                   args: args,
                                   used: false
                                 });
            }

            function freshVar() {
                return namespace + (++variables);
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
                if (set.name in variableBindings) {
                    if (variableBindings[set.name].used) {
                        // we already have a binding for this set variable
                        var variant = freshVar();
                        addConstraint('Equality', set.name, variant);

                        return variant;
                    } else {
                        // first use of this binding
                        variableBindings[set.name].used = true;

                        return set.name;
                    }
                } else {
                    // we have not encountered this set variable before,
                    // just add a binding and carry on.
                    variableBindings[set.name] = { name: set.name,
                                                   type: 'set-variable',
                                                   used: false
                                                 };

                    return set.name;
                }
            }

            function isVar(name) {
               return name.startsWith('?');
            }

            function patternsForSpecifier(atom, indent) {
                if (!isFinite(indent)) {
                    indent = 0;
                }

                var patterns = [];
                var optionals = [];

                function addPattern(subject, predicate, object) {
                    patterns.push([subject, predicate, object].join(' '));
                }

                function addOptional(set, attribute, value) {
                    optionals.push(' '.repeat(indent) + 'OPTIONAL { ' +
                                   [set, attribute, value].join(' ') + ' }');
                }

                function addGroup(group, op, other) {
                    var pattern = (' '.repeat(indent) + '{ ' +
                                   group.join('\n' + ' '.repeat(indent + 2)) + ' }');

                    if (angular.isDefined(op)) {
                        if (op !== '.') {
                            pattern += '\n' + ' '.repeat(indent + 2) + op + ' ';
                        }
                    }

                    if (angular.isDefined(other) && other.length) {
                        pattern += (' '.repeat(indent) + '{ ' +
                                    other.join('\n' + ' '.repeat(indent + 2)) + ' }');
                    }

                    patterns.push(pattern);
                }

                var spec = atom;
                if ('specifier' in atom) {
                    spec = atom.specifier;
                }

                switch (spec.type) {
                case 'closed-specifier':
                    if (set === atom.set.name) {
                        // first instance of this specifier,
                        // add closure constraint
                        addConstraint('Closure', set);
                    }

                    // fallthrough
                    case 'open-specifier':
                        var assignments = spec.assignments.length;

                    for (var i = 0; i < assignments; ++i) {
                        var assignment = spec.assignments[i];
                        var attribute = maybeBinding(assignment.attribute, 'pq');
                        var value = '';
                        var optional = false;

                        switch (assignment.value.type) {
                        case 'literal':
                            // fallthrough
                        case 'variable':
                            value = maybeBinding(assignment.value, 'pqv');
                            break;
                        case 'star':
                            optional = true;
                            // fallthrough
                        case 'plus':
                            value = '[]'; // blank node
                            break;
                        }

                        if (!optional) {
                            // add a pattern to match this assignment
                            addPattern(set, attribute, value);
                        } else {
                            addOptional(set, attribute, value);
                        }
                    }
                    break;

                case 'union':
                    var lhs = patternsForSpecifier(spec.specifiers[0], indent);
                    var rhs = patternsForSpecifier(spec.specifiers[1], indent);
                    optionals = optionals.concat(lhs.optionals, rhs.optionals);

                    addGroup(lhs.patterns, 'UNION', rhs.patterns);
                    break;

                case 'intersection':
                    lhs = patternsForSpecifier(spec.specifiers[0], indent);
                    rhs = patternsForSpecifier(spec.specifiers[1], indent);
                    optionals = optionals.concat(lhs.optionals, rhs.optionals);

                    addGroup(lhs.patterns, '.', rhs.patterns);
                    break;

                case 'difference':
                    lhs = patternsForSpecifier(spec.specifiers[0], indent);
                    rhs = patternsForSpecifier(spec.specifiers[1], indent);
                    optionals = optionals.concat(lhs.optionals, rhs.optionals);

                    addGroup(lhs.patterns, 'MINUS', rhs.patterns);
                    break;

                default:
                    $log.debug("unsupported specifier expression type: `" +
                               spec.type + "'");
                    break;
                }

                return { patterns: patterns,
                         optionals: optionals
                       };
            }

            switch (atom.type) {
            case 'relational-atom':
                var subject = maybeBinding(atom.arguments[0], 'wd');
                var predicate = maybeBinding(atom.predicate, 'p');
                var statement = bindingOrFreshVarWithEquality(atom.annotation);
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

                bindings = bindings.concat([subject, predicate, object]
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
                var result = patternsForSpecifier(atom);
                patterns = patterns.concat(result.patterns);
                optionals = optionals.concat(result.optionals);

                break;

            default:
                $log.debug("Unkown atom type `" + atom.type +
                           "', don't know how to construct query fragment");
                break;
            }

            return { bindings: bindings,
                     patterns: patterns,
                     optionals: optionals,
                     constraints: constraints
                   };
        }

        function sparqlQueryFromFragments(bindings, patterns, optionals, limit) {
            var query = "SELECT DISTINCT " + bindings.join(" ") +
                "\nWHERE {\n  " + patterns.join(" .\n  ") +
                ((optionals.length) ? "\n  " + optionals.join(" .\n  ") : '') +
                "\n} LIMIT " + limit;

            return query;
        }

        function augmentBindingsWithSPARQLResult(bindings,
                                                 sparqlResult) {
            angular.forEach(sparqlResult[0],
                            function(item, name) {
                                var varName = '?' + name;
                                var id = util.getClaimIdFromSPARQLResult(
                                    util.getIdFromUri(item.value));
                                if (!(varName in bindings)) {
                                    bindings[varName] = { name: varName };
                                }

                                bindings[varName].id = id;
                                bindings[varName].item = item;
                            });

            return bindings;
        }

        function augmentBindingsWithAPIResult(bindings,
                                              apiResult) {
            angular.forEach(apiResult, function(result) {
                var property = Object.keys(result.claims)[0]; // only a single claim
                var claim = result.claims[property][0];

                // find binding for this claim
                angular.forEach(bindings, function(binding, idx) {
                    if (bindings[idx].id === claim.id) {
                        bindings[idx].qualifiers =
                            (('qualifiers' in claim)
                             ? claim.qualifiers
                             : []);
                    }
                });
            });

            return bindings;
        }

        function verifyCandidateInstance(query) {
            // resolve constraints, if any
            if (query.constraints.length > 0) {
                // FIXME implement this
                $log.debug('query has unresolved constraints; constraint solving is not implemented yet');
                return undefined;
            }

            return query;
        }

        function instantiateRuleHead(query) {
            var head = query.rule.head;

            function bindingOrLiteral(name) {
                if (('name' in name) && ('type' in name)) {
                    if (name.type === 'literal') {
                        return name.name;
                    }

                    name = name.name;
                }

                if (name in query.bindings) {
                    return query.bindings[name].id;
                }

                return name;
            }

            function copyQualifiers(qualifiers) {
                // FIXME filter out references here
                return qualifiers;
            }

            angular.forEach(ruleParser.variables(head),
                            function(variable) {
                                if (!(variable.name in query.bindings)) {
                                    throw new RangeError("variable `" + variable.name +
                                                         "' is not among result bindings");
                                }
                            });

            var subject = bindingOrLiteral(head.arguments[0]);
            var predicate = bindingOrLiteral(head.predicate);
            var object = bindingOrLiteral(head.arguments[1]);
            var qualifiers = [];

            switch (head.annotation.type) {
            case 'set-variable':
                qualifiers = copyQualifiers(
                    query.bindings[head.annotation.name].qualifiers
                );
                break;

            case 'set-term':
                // fallthrough
            case 'closed-specifier':
                qualifiers = head.annotation.assignments.map(
                    function(assignment) {
                        return { qualifier: bindingOrLiteral(assignment.attribute),
                                 value: bindingOrLiteral(assignment.value)
                               };
                    });
                break;

            case 'open-specifier':
                // fallthrough
            case 'function-term':
                // fallthrough
            default:
                throw new RangeError("unsupported annotation type `" +
                                     head.annation.type + "' in rule head");
            }

            // FIXME turn annotation into qualifiers
            return { subject: subject,
                     predicate: predicate,
                     object: object,
                     qualifiers: qualifiers
                   };
        }

        return {
            getStatements: getStatements
        };
}]);

return {}; }); // module definition end
