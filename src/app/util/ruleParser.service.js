//////// Module Definition ////////////
define([
    'ajv',
    'parsimmon',
    'util/util.module'
], function(ajv, parsimmon) {
    ///////////////////////////////////////
    angular.module('util').factory('ruleParser', ['$http', '$q', 'util',
        function($http, $q, util) {
            var parse = function(rule) {
                var P = parsimmon;

                function token(parser) {
                    return parser.skip(P.regexp(/\s*/m));
                }

                function word(w) {
                    return P.string(w).thru(token);
                }

                function assignment(r, rhs) {
                    return P.seqMap(
                        r.ObjectTerm,
                        r.colon,
                        rhs,
                        function(attribute, _, value) {
                            return Object.freeze({
                                attribute: attribute,
                                value: value
                            });
                        });
                }

                function specifier(r, opening, closing, type) {
                    return opening.then(
                        P.sepBy(r.AssignmentWithPlaceholder,
                                r.comma)
                            .map(function(assignments) {
                                return Object.freeze({
                                    type: type + '-specifier',
                                    assignments: assignments
                                });
                            })
                    ).skip(closing);
                }

                var MARPL = P.createLanguage({
                    comma: function() { return word(','); },
                    colon: function() { return word(':'); },
                    arrow: function() { return word('->'); },
                    openingBrace: function() { return word('{'); },
                    closingBrace: function() { return word('}'); },
                    openingFloor: function() { return word('|_'); },
                    closingFloor: function() { return word('_|'); },
                    openingBracket: function() { return word('['); },
                    closingBracket: function() { return word(']'); },

                    ObjectVariable: function() {
                        return P.regexp(/\?[a-zA-Z]\w*/)
                            .map(function(name) {
                                return Object.freeze({
                                    type: "variable",
                                    value: name
                                });
                            });
                    },
                    ObjectLiteral: function() {
                        return P.regexp(/\w+:?\w*/)
                            .map(function(name) {
                                return Object.freeze({
                                    type: "literal",
                                    value: name
                                });
                            });
                    },
                    ObjectTerm: function(r) {
                        return P.alt(
                            r.ObjectVariable,
                            r.ObjectLiteral
                        );
                    },
                    SetLiteral: function(r) {
                        return r.openingBrace
                            .then(P.sepBy(r.Assignment, r.comma))
                            .skip(r.closingBrace)
                            .map(function(assignments) {
                                return Object.freeze({
                                    type: "set-term",
                                    assignments: assignments
                                });
                            });
                    },
                    SetVariable: function() {
                        return P.regexp(/\?[a-zA-Z]\w*/)
                            .map(function(name) {
                                return Object.freeze({
                                    type: "set-variable-",
                                    value: name
                                });
                            });
                    },
                    SetTerm: function(r) {
                        return P.alt(
                            r.SetLiteral,
                            r.SetVariable
                        );
                    },
                    SetAtom: function(r) {
                        return r.openingParenthesis
                            .seqMap(r.ObjectTerm,
                                    r.comma,
                                    r.ObjectTerm,
                                    function(attribute, _, value) {

                                    })
                            .skip(r.closingParenthesis);
                    },
                    RelationalAtomBase: function(r) {
                    },
                    RelationalAtom: function(r) {
                    },
                    RelationalAtomWithFunctionTerm: function(r) {
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
                            specifier(r.openingFloor, r.closingFloor, 'open'),
                            specifier(r.openingBracket, r.closingBracket, 'closed')
                        );
                    },
                    SpecifierExpression: function(r) {
                    },
                    SpecifierTerm: function(r) {
                    },
                    SpecifierAtom: function(r) {
                    },

                    Rule: function(r) {
                        return P.seq(
                            r.Body,
                            r.arrow,
                            r.Head
                        ).map(function(body, _, head) {
                            return Object.freeze({
                                body: body,
                                head: head
                            });
                        });
                    },
                    Head: function(r) {
                        return P.alt(
                            r.RelationalAtom,
                            r.RelationalAtomWithFunctionTerm
                        );
                    },
                    Body: function(r) {
                        return P.sepBy(
                            P.alt(
                                r.RelationalAtom,
                                r.SetAtom,
                                r.SpecifierAtom
                            ),
                            P.string(',')
                        );
                    }
                });

                return MARPL.SetTerm.tryParse(rule);
            };

            return {
                parse: parse
            };
        }]);

    return {};
});
