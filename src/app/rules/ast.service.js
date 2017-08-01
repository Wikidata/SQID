define(['ajv',
        'rules/rules.module'
       ],
function(ajv) {
    angular.module('rules').factory('ast',
    ['$http', '$log',
    function($http, $log) {
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

    return { print: print,
             verify: verify,
             variables: variables
           };
    }]);

    return {};
});
