//////// Module Definition ////////////
define([
    'ajv',
    'parsimmon',
    'util/util.module',
], function() {
    ///////////////////////////////////////

    angular.module('util').factory('ruleParser', ['$http', '$q', 'util', 'ajv', 'parsimmon',
        function($http, $q, util, ajv, parsimmon) {
            var parse = function(rule) {
                var P = parsimmon;

                var MARPL = P.createLanguage({
                    ObjectTerm: function(r) {
                        return P.alt(
                            r.Variable,
                            r.Literal
                        );
                    },
                    SetLiteral: function(r) {
                    },
                    SetVariable: function(r) {
                    },
                    SetTerm: function(r) {
                    },
                    SetAtom: function(r) {
                    },
                    RelationalAtomBase: function(r) {
                    },
                    RelationalAtom: function(r) {
                    },
                    RelationalAtomWithFunctionTerm(r) {
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
                    },
                });

                return MARPL.Rule.tryParse(rule);
            };

            return {
                parse: parse
            };
        }]);

    return {};
});
