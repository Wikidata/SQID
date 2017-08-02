define(['rules/rules.module',
        'util/util.service',
        'rules/ast.service',
        'rules/matcher.service',
        'rules/references.service'
       ],
function() {
    angular.module('rules').factory('instantiator',
    ['util', 'ast', 'matcher', 'references',
    function(util, ast, matcher, references) {
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

        function instantiateRuleHead(query, skipReferences) {
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

            angular.forEach(ast.variables(head),
                            function(variable) {
                                if (!(variable.name in query.bindings)) {
                                    throw new RangeError("variable `" + variable.name +
                                                         "' is not among result bindings");
                                }
                            });

            var predicate = bindingOrLiteral(head.predicate);
            var object = bindingOrLiteral(head.arguments[1]);
            var qualifiers = {};

            switch (head.annotation.type) {
            case 'set-variable':
                qualifiers = matcher.copyQualifiers(
                    query.bindings[head.annotation.name].qualifiers
                );

                break;

            case 'set-term':
                // fallthrough
            case 'closed-specifier':
                angular.forEach(head.annotation.assignments, function(assignment) {
                    var property = bindingOrLiteral(assignment.attribute);

                    if (!(property in qualifiers)) {
                        qualifiers[property] = [];
                    }

                    qualifiers[property].push({
                        snaktype: 'value',
                        datatype: 'wikibase-item',
                        datavalue: { value: { 'entity-type': 'item',
                                              'numeric-id': bindingOrLiteral(assignment.value).substring(1)
                                            },
                                     type: 'wikibase-entityid'
                                   },
                        property: property
                    });
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
            var statement = {};
            statement[predicate] = [{ mainsnak: { snaktype: 'value',
                                                  property: predicate,
                                                  datavalue: { type: 'wikibase-entityid',
                                                               value: { 'entity-type': 'item',
                                                                        'numeric-id': object.substring(1)
                                                                      }
                                                             },
                                                  datatype: 'wikibase-item'
                                                },
                                      rank: 'normal',
                                      type: 'statement',
                                      qualifiers: qualifiers
                                    }];

            if (skipReferences === true) {
                statement.references =
                    references.generateReference(query);
            }

            return statement;
        }

        return { augmentBindingsWithSPARQLResult: augmentBindingsWithSPARQLResult,
                 augmentBindingsWithAPIResult: augmentBindingsWithAPIResult,
                 instantiateRuleHead: instantiateRuleHead
        };
    }]);

    return {};
});
