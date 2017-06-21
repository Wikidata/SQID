//////// Module Definition ////////////
define([
    'ajv',
    'parsimmon',
    'util/util.module'
], function(ajv, parsimmon) {
    console.log('module loaded');
    ///////////////////////////////////////
    angular.module('util').factory('ruleParser', ['$http', '$q', 'util',
        function($http, $q, util) {
            var parse = function(rule) {
                var P = parsimmon;

                var MARPL = P.createLanguage({
                    ObjectVariable: function(r) {
                        return P.regexp(/\?[a-z]\w*/)
                            .map(function(name) {
                                return Object.freeze({
                                    type: "variable",
                                    value: name
                                });
                            });
                    },
                    ObjectLiteral: function(r) {
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
                        return P.string('{}');
                    },
                    SetVariable: function(r) {
                        return P.regexp(/\?[A-Z]\w*/)
                            .map(function(name) {
                                return Object.freeze({
                                    type: "set-variable",
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
                    },
                    RelationalAtomBase: function(r) {
                    },
                    RelationalAtom: function(r) {
                    },
                    RelationalAtomWithFunctionTerm: function(r) {
                    },
                    Placeholder: function(r) {
                    },
                    Assignment: function(r) {
                    },
                    Specifier: function(r) {
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
                            P.string('->'),
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
