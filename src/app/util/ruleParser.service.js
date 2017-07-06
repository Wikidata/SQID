//////// Module Definition ////////////
define([
    'ajv',
    'parsimmon',
    'util/util.module'
], function(ajv, parsimmon) {
    ///////////////////////////////////////
    angular.module('util').factory('ruleParser', ['$http', '$q', '$log', 'util',
        function($http, $q, $log, util) {
            var parse = function(rule, skipVerification) {
                var P = parsimmon;

                function word(w) {
                    return P.string(w).trim(P.regexp(/\s*/m));
                }

                function assignment(r, rhs) {
                    return P.seqObj(['attribute', r.ObjectTerm],
                                    r.colon,
                                    ['value', rhs]);
                }

                function specifier(r, opening, closing, typ) {
                    return P.seqObj(opening,
                                    ['assignments',
                                        P.sepBy(r.AssignmentWithPlaceholder,
                                                r.comma)],
                                    closing)
                            .thru(type(typ + '-specifier'));
                }

                function specifierExpression(r, type)
                {
                    return P.seqObj(r.openingParenthesis,
                                    ['lhs', r.SpecifierTerm],
                                    r[type],
                                    ['rhs', r.SpecifierTerm],
                                    r.closingParenthesis)
                            .map(function(obj) {
                                return Object.freeze({
                                    type: type,
                                    specifiers: [obj.lhs, obj.rhs]
                                });
                            });
                }

                function relationalAtom(r, setTerm) {
                    return P.seqObj(['subject', r.ObjectTerm],
                                    r.dot,
                                    ['predicate', r.ObjectTerm],
                                    r.equals,
                                    ['object', r.ObjectTerm],
                                    r.at,
                                    ['annotation', setTerm])
                        .map(function(obj) {
                            return Object.freeze({
                                type: 'relational-atom',
                                predicate: obj.predicate,
                                arguments: [obj.subject, obj.object],
                                annotation: obj.annotation
                            });
                        });
                }

                function type(type) {
                    return function(parser) {
                        return parser.map(function(obj) {
                            obj.type = type;
                            return Object.freeze(obj);
                        });
                    };
                }

                var MARPL = P.createLanguage({
                    at: function() { return word('@'); },
                    dot: function() { return word('.'); },
                    comma: function() { return word(','); },
                    colon: function() { return word(':'); },
                    arrow: function() { return word('->'); },
                    union: function() { return word('||'); },
                    equals: function() { return word('='); },
                    contains: function() { return word('#'); },
                    difference: function() { return word('\\'); },
                    intersection: function() { return word('&&'); },
                    variableName: function() { return P.regexp(/\?[a-zA-Z]\w*/); },
                    openingBrace: function() { return word('{'); },
                    closingBrace: function() { return word('}'); },
                    openingFloor: function() { return word('|_'); },
                    closingFloor: function() { return word('_|'); },
                    openingBracket: function() { return word('['); },
                    closingBracket: function() { return word(']'); },
                    openingParenthesis: function() { return word('('); },
                    closingParenthesis: function() { return word(')'); },


                    someVariable: function(r) {
                        return P.seqObj(['name', r.variableName])
                                .thru(type('some-variable'));
                    },
                    ObjectVariable: function(r) {
                        return P.seqObj(['name', r.variableName])
                                .thru(type('variable'));
                    },
                    ObjectLiteral: function() {
                        return P.seqObj(['name', P.regexp(/[PQ]\d+/)])
                                .thru(type('literal'));
                    },
                    ObjectTerm: function(r) {
                        return P.alt(
                            r.ObjectVariable,
                            r.ObjectLiteral
                        );
                    },
                    SetLiteral: function(r) {
                        return P.seqObj(r.openingBrace,
                                        ['assignments', P.sepBy(r.Assignment, r.comma)],
                                        r.closingBrace)
                                .thru(type('set-term'));
                    },
                    SetVariable: function(r) {
                        return P.seqObj(['name', r.variableName])
                                .thru(type('set-variable'));
                    },
                    SetTerm: function(r) {
                        return P.alt(
                            r.SetLiteral,
                            r.SetVariable
                        );
                    },
                    SetAtom: function(r) {
                        return P.seqObj(r.openingParenthesis,
                                        ['attribute', r.ObjectTerm],
                                        r.colon,
                                        ['value', r.ObjectTerm],
                                        r.closingParenthesis,
                                        r.contains,
                                        ['set', r.SetTerm])
                                .thru(type('set-atom'));
                    },
                    FunctionTerm: function(r) {
                        return P.seqObj(['name', P.regexp(/[a-zA-Z]\w*/)],
                                        r.openingParenthesis,
                                        ['arguments',
                                         P.sepBy(P.alt(r.ObjectLiteral,
                                                       r.SetLiteral,
                                                       r.someVariable),
                                                 r.comma)],
                                        r.closingParenthesis)
                                .thru(type('function-term'));
                    },
                    RelationalAtom: function(r) {
                        return relationalAtom(r, r.SetTerm);
                    },
                    RelationalAtomWithFunctionTerm: function(r) {
                        return relationalAtom(r, r.FunctionTerm);
                    },
                    Placeholder: function() {
                        return P.alt(
                            word('*').map(function() {
                                return Object.freeze({
                                    type: "star"
                                });
                            }),
                            word('+').map(function() {
                                return Object.freeze({
                                    type: "plus"
                                });
                            })
                        );
                    },
                    Assignment: function(r) {
                        return assignment(r, r.ObjectTerm);
                    },
                    AssignmentWithPlaceholder: function(r) {
                        return assignment(r, P.alt(
                            r.ObjectTerm,
                            r.Placeholder
                        ));
                    },
                    Specifier: function(r) {
                        return P.alt(
                            specifier(r, r.openingFloor, r.closingFloor, 'open'),
                            specifier(r, r.openingBracket, r.closingBracket, 'closed')
                        );
                    },
                    SpecifierExpression: function(r) {
                        return P.alt(
                            specifierExpression(r, 'union'),
                            specifierExpression(r, 'intersection'),
                            specifierExpression(r, 'difference'));
                    },
                    SpecifierTerm: function(r) {
                        return P.alt(r.SpecifierExpression,
                                     r.Specifier);
                    },
                    SpecifierAtom: function(r) {
                        return P.seqObj(['specifier', r.SpecifierTerm],
                                        r.openingParenthesis,
                                        ['set', r.SetVariable],
                                        r.closingParenthesis)
                                .thru(type('specifier-atom'));
                    },

                    Rule: function(r) {
                        return P.seqObj(['body', r.Body],
                                        r.arrow,
                                        ['head', r.Head]);
                    },
                    Head: function(r) {
                        return P.alt(
                            r.RelationalAtom,
                            r.RelationalAtomWithFunctionTerm
                        );
                    },
                    Body: function(r) {
                        return P.sepBy(
                            P.alt(r.RelationalAtom,
                                  r.SetAtom,
                                  r.SpecifierAtom), r.comma);
                    }
                });

                var ast = MARPL.Rule.tryParse(rule);

                if (ast.head.annotation.type === 'function-term') {
                    // disambiguate variable names in the function term
                    var args = ast.head.annotation.arguments.length;
                    arguments: for (var arg = 0; arg < args; ++arg) {
                        if (ast.head.annotation.arguments[arg].type === 'some-variable') {
                            // find a binding for this variable in the body
                            var name = ast.head.annotation.arguments[arg].name;
                            var atoms = ast.body.length;
                            var v = function(type) {
                                return Object.freeze({
                                    type: type,
                                    name: name
                                });
                            };

                            for (var atom = 0; atom < atoms; ++atom) {
                                switch (ast.body[atom].type) {
                                case 'relational-atom':
                                    if (ast.body[atom].annotation.type === 'set-variable' &&
                                        ast.body[atom].annotation.name === name) {
                                        ast.head.annotation.arguments[arg] = v('set-variable');
                                        continue arguments;
                                    }

                                    for (var property in ['subject, predicate, object']) {
                                        if (ast.body[atom][property].type === 'variable' &&
                                            ast.body[atom][property].name === name) {
                                            ast.head.annotation.arguments[arg] = v('variable');
                                            continue arguments;
                                        }
                                    }
                                    break;
                                case 'set-atom':
                                    if (ast.body[atom].set.type === 'set-variable' &&
                                        ast.body[atom].set.name === name) {
                                        ast.head.annotation.arguments[arg] = v('set-variable');
                                        continue arguments;
                                    }

                                    if (ast.body[atom].attribute === name ||
                                        ast.body[atom].value === name) {
                                        ast.head.annotation.arguments[arg] = v('variable');
                                        continue arguments;
                                    }
                                    break;
                                case 'specifier-atom':
                                    if (ast.body[atom].set === name) {
                                        ast.head.annotation.arguments[arg] = v('set-variable');
                                        continue arguments;
                                    }

                                    var assignments = ast.body[atom].assignments.length;
                                    for (var i = 0; i < assignments; ++i) {
                                        if (ast.body[atom].assignments[i].attribute === name ||
                                            ast.body[atom].assignments[i].value === name) {
                                            ast.head.annotation.arguments[arg] = v('variable');
                                            continue arguments;
                                        }
                                    }
                                    break;
                                default:
                                    // something unexpected happened, ignore it.
                                    $log.warn("unexpected atom type `" +
                                              ast.body[atom].type +
                                              "'in rule body: " + ast);
                                }
                            }
                        }

                        if (ast.head.annotation.arguments[arg].type === 'some-variable') {
                            // this variable does not occour within the body, as is required
                            throw new SyntaxError("Variable `" + name +
                                                  "' is unbound in rule: " + ast);
                        }
                    }
                }

                if (skipVerification !== true) {
                    $http.get('data/rules.schema.json')
                        .then(function(response) {
                            var schema = response.data;
                            var validator = new ajv();
                            var valid = validator.validate(schema, ast);

                            if (!valid) {
                                var errMsg = 'Failed to validate rule AST: ' +
                                    validator.errors;

                                $log.error(validator.errors);
                                throw new SyntaxError(errMsg);
                            }
                        });
                }

                return ast;
            };

            return {
                parse: parse
            };
        }]);

    return {};
});
