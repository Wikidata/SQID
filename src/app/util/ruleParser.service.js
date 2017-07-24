//////// Module Definition ////////////
define([
    'ajv',
    'parsimmon',
    'util/util.module'
], function(ajv, parsimmon) {
    ///////////////////////////////////////
    angular.module('util').factory('ruleParser',
    ['$http', '$q', '$log', 'util',
    function($http, $q, $log, util) {
        var P = parsimmon;

        function word(w) {
            return P.string(w).trim(P.regexp(/\s*/m));
        }

        function assignment(r, rhs) {
            return P.seqObj(['attribute', r.ObjectTerm],
                            r.equals,
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
                        return {
                            type: type,
                            specifiers: [obj.lhs, obj.rhs]
                        };
                    });
        }

        function relationalAtom(r, setTerm) {
            return P.seqObj(r.openingParenthesis,
                            ['subject', r.ObjectTerm],
                            r.dot,
                            ['predicate', r.ObjectTerm],
                            r.equals,
                            ['object', r.ObjectTerm],
                            r.closingParenthesis,
                            r.at,
                            ['annotation', setTerm])
                .map(function(obj) {
                    return {
                        type: 'relational-atom',
                        predicate: obj.predicate,
                        arguments: [obj.subject, obj.object],
                        annotation: obj.annotation
                    };
                });
        }

        function type(type) {
            return function(parser) {
                return parser.map(function(obj) {
                    obj.type = type;
                    return obj;
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
            difference: function() { return word('\\'); },
            intersection: function() { return word('&&'); },
            objectName: function() { return P.regexp(/[PQ]\d+/); },
            variableName: function() { return P.regexp(/\?[a-zA-Z]\w*/); },
            openingBrace: function() { return word('{'); },
            closingBrace: function() { return word('}'); },
            openingFloor: function() { return word('('); },
            closingFloor: function() { return word(')'); },
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
            ObjectLiteral: function(r) {
                return P.seqObj(['name', r.objectName])
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
                    r.SetVariable,
                    specifier(r, r.openingFloor, r.closingFloor, 'open'),
                    specifier(r, r.openingBracket, r.closingBracket, 'closed')
                );
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
                        return {
                            type: "star"
                        };
                    }),
                    word('+').map(function() {
                        return {
                            type: "plus"
                        };
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
                    specifierExpression(r, 'difference')
                );
            },
            SpecifierTerm: function(r) {
                return P.alt(r.SpecifierExpression,
                             r.Specifier);
            },
            SpecifierAtom: function(r) {
                return P.seqObj(['set', r.SetVariable],
                                r.colon,
                                ['specifier', r.SpecifierTerm])
                        .thru(type('specifier-atom'));
            },
            Rule: function(r) {
                return P.seqObj(['body', r.Body],
                                r.arrow,
                                ['head', r.Head])
                        .thru(type('rule'));
            },
            Head: function(r) {
                return P.alt(
                    r.RelationalAtom,
                    r.RelationalAtomWithFunctionTerm
                );
            },
            Body: function(r) {
                return P.sepBy(P.alt(r.RelationalAtom,
                                         r.SpecifierAtom),
                                   r.comma);
            }
        });

        function parse(rule, skipVerification) {
            var ast = MARPL.Rule.tryParse(rule);

            ast = Object.freeze(rewrite(ast));
            if (skipVerification !== true) {
                verify(ast);
            }

            return ast;
        }

        function rewrite(ast) {
            if (ast.head.annotation.type === 'function-term') {
                // disambiguate variable names in the function term
                var args = ast.head.annotation.arguments.length;
                arguments: for (var arg = 0; arg < args; ++arg) {
                    if (ast.head.annotation.arguments[arg].type === 'some-variable') {
                        // find a binding for this variable in the body
                        var name = ast.head.annotation.arguments[arg].name;
                        var atoms = ast.body.length;

                        for (var atom = 0; atom < atoms; ++atom) {
                            switch (ast.body[atom].type) {
                            case 'relational-atom':
                                if (ast.body[atom].annotation.type === 'set-variable' &&
                                    ast.body[atom].annotation.name === name) {
                                    ast.head.annotation.arguments[arg].type = 'set-variable';
                                    continue arguments;
                                }

                                for (var property in ['subject, predicate, object']) {
                                    if (ast.body[atom][property].type === 'variable' &&
                                        ast.body[atom][property].name === name) {
                                        ast.head.annotation.arguments[arg].type = 'variable';
                                        continue arguments;
                                    }
                                }
                                break;
                            case 'set-atom':
                                if (ast.body[atom].set.type === 'set-variable' &&
                                    ast.body[atom].set.name === name) {
                                    ast.head.annotation.arguments[arg].type = 'set-variable';
                                    continue arguments;
                                }

                                if (ast.body[atom].attribute === name ||
                                    ast.body[atom].value === name) {
                                    ast.head.annotation.arguments[arg].type = 'variable';
                                    continue arguments;
                                }
                                break;
                            case 'specifier-atom':
                                if (ast.body[atom].set === name) {
                                    ast.head.annotation.arguments[arg].type = 'set-variable';
                                    continue arguments;
                                }

                                var assignments = ast.body[atom].assignments.length;
                                for (var i = 0; i < assignments; ++i) {
                                    if (ast.body[atom].assignments[i].attribute === name ||
                                        ast.body[atom].assignments[i].value === name) {
                                        ast.head.annotation.arguments[arg].type = 'variable';
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

            function specifierAtom(name, spec) {
                return {type: 'specifier-atom',
                        set: {type: 'set-variable',
                              name: name
                             },
                        specifier: spec
                       };
            }

            if (ast.head.annotation.type === 'closed-specifier') {
                // just treat it as a set literal
                ast.head.annotation.type = 'set-term';
            }

            atoms = ast.body.length;
            var newAtoms = [];

            // push specifiers into specifier atoms
            for (atom = 0; atom < atoms; ++atom) {
                if (ast.body[atom].type !== 'relational-atom') {
                    continue;
                }

                if (ast.body[atom].annotation.type !== 'open-specifier' &&
                    ast.body[atom].annotation.type !== 'closed-specifier') {
                    continue;
                }

                variable = '?_body_spec_for_' + atom;
                newAtoms = newAtoms.concat(
                    specifierAtom(variable, ast.body[atom].annotation));
                ast.body[atom].annotation = {type: 'set-variable',
                                             name: variable
                                            };
            }

            ast.body = ast.body.concat(newAtoms);

            return ast;
        }

        function print(ast) {
            var result = '';

            if (angular.isArray(ast)) {
                return ast.join(', ');
            }

            switch (ast.type) {
            case 'variable': // fallthrough
            case 'set-variable':
                result = ast.name;
                break;

            case 'rule':
                result = ast.body.map(print).join(', ') +
                    ' -> ' + print(ast.head);
                break;

            case 'relational-atom':
                result = '(' + print(ast.arguments[0]) +
                    '.' + print(ast.predicate) +
                    ' = ' + print(ast.arguments[1]) +
                    ')@' + print(ast.annotation);
                break;

            case 'set-term':
                result = '{' + ast.assignments.map(function(as) {
                    return print(as.attribute) + ' = ' + print(as.value);
                }).join(', ') + '}';
                break;

            case 'specifier-atom':
                result = print(ast.set) + ':' + print(ast.specifier);
                break;

            case 'union':
                result = ('(' + print(ast.specifiers[0]) + ' || ' +
                          print(ast.specifiers[1]) + ')');
                break;

            case 'intersection':
                result = ('(' + print(ast.specifiers[0]) + ' && '  +
                          print(ast.specifiers[1]) + ')');
                break;

            case 'difference':
                result = ('(' + print(ast.specifiers[0]) + ' \\ ' +
                          print(ast.specifiers[1]) + ')');
                break;

            case 'function-term':
                result = ast.name + '(' +
                    ast.arguments.map(print).join(', ') + ')';
                break;

            case 'open-specifier':
                result = '(' + ast.assignments.map(function(as) {
                    return print(as.attribute) + ' = ' + print(as.value);
                }).join(', ') + ')';
                break;

            case 'closed-specifier':
                result = '[' + ast.assignments.map(function(as) {
                    return print(as.attribute) + ' = ' + print(as.value);
                }).join(', ') + ']';
                break;

            case 'star':
                result = '*';
                break;

            case 'plus':
                result = '+';
                break;

            case 'literal':
                result = ast.name;
                break;

            default:
                $log.debug("unknown object in print(): " + ast);
                break;
            }

            return result;
        }

        function variables(ast) {
            function bind(m, f) {
                return m.map(f).reduce(function(acc, elt) {
                    return acc.concat(elt);
                }, []);
            }
            var collector = [];

            if (angular.isArray(ast)) {
                return collector.concat(bind(ast, variables));
            }

            switch (ast.type) {
            case 'variable': // fall through
            case 'set-variable':
                collector = ast;
                break;

            case 'rule':
                collector = collector.concat(
                    bind(ast.body, variables),
                    variables(ast.head)
                );
                break;

            case 'relational-atom':
                collector = collector.concat(
                    variables(ast.predicate),
                    bind(ast.arguments, variables),
                    variables(ast.annotation)
                );
                break;

            case 'set-term':
                collector = collector.concat(
                    bind(ast.assignments, variables)
                );
                break;

            case 'specifier-atom':
                collector = collector.concat(
                    variables(ast.set),
                    variables(ast.specifier)
                );
                break;

            case 'union': // fallthrough
            case 'intersection': // fallthrough
            case 'difference':
                collector = collector.concat(
                    variables(ast.specifiers[0]),
                    variables(ast.specifiers[1])
                );
                break;

            case 'function-term':
                collector = collector.concat(
                    bind(ast.arguments, variables)
                );
                break;

            case 'open-specifier': // fallthrough
            case 'closed-specifier':
                collector = collector.concat(
                    bind(ast.assignments, variables)
                );
                break;
            case 'star': // fallthrough
            case 'plus': // fallthough
            case 'literal': // fallthrough
            default:
                // something different. assume it doesn't have variables.
                break;
            }

            return collector;
        }

        function verify(ast) {
            // verify that the AST conforms to the schema
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

            // ensure rule safety
            var variablesInHead = variables(ast.head);
            var variablesInBody = variables(ast.body);

            vars: for (var variable in variablesInHead) {
                for (var other in variablesInBody) {
                    if (variable.name === other.name) {
                        if (variable.type !== other.type) {
                            throw new SyntaxError("Variable `" + variable +
                                                  " occurs with different types.");
                        }

                        continue vars;
                    }
                }

                throw new SyntaxError("Variable `" + variable +"' " +
                                      "does not occur in rule body");
            }
        }

        function isVariableName(name) {
            try {
                MARPL.variableName.tryParse(name);
            } catch (err) {
                return false;
            }

            return true;
        }

        function isObjectName(name) {
            try {
                MARPL.objectName.tryParse(name);
            } catch (err) {
                return false;
            }

            return true;
        }

        return {
            parse: parse,
            verify: verify,
            print: print,
            variables: variables,
            isObjectName: isObjectName,
            isVariableName: isVariableName
        };
    }]);

    return {};
});
