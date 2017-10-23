//////// Module Definition ////////////
define([
'rules/rules.module',
'rules/parser.service'
], function() {
///////////////////////////////////////

angular.module('rules').factory('provider', [
	'parser',
	function(parser) {

		var rules = [
			{ // x inverseOf y -> y inverseOf x
				rule: '(?x.P1696 = ?y)@?S -> (?y.P1696 = ?x)@?S',
				kind: 'materialise'
			},
			{ // x partOf y -> y hasPart x
				rule: '(?x.P361 = ?y)@?S -> (?y.P527 = ?x)@?S',
				kind: 'materialise'
			},
			{ // x spouse y -> y spouse x
				rule: '?S:(), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
				kind: 'materialise'
			},
			{ // grandfather
				rule: '(?gf.P21 = Q6581097)@?X, (?gf.P40 = ?f)@?Y, (?f.P40 = ?s)@?Z -> (?s.P1038 = ?gf)@[P1039 = Q9238344]',
				kind: 'informational'
			},
			{ // grandson
				rule: '(?s.P21 = Q6581097)@?X, (?gf.P40 = ?f)@?Y, (?f.P40 = ?s)@?Z -> (?gf.P1038 = ?s)@[P1039 = Q11921506]',
				kind: 'informational'
			},
			{ // grandmother
				rule: '(?gm.P21 = Q6581072)@?X, (?gf.P40 = ?f)@?Y, (?f.P40 = ?s)@?Z -> (?s.P1038 = ?gm)@[P1039 = Q9235758]',
				kind: 'informational'
			},
			{ // granddaughter
				rule: '(?d.P21 = Q6581072)@?X, (?gf.P40 = ?f)@?Y, (?f.P40 = ?s)@?Z -> (?gf.P1038 = ?s)@[P1039 = Q19756330]',
				kind: 'informational'
			}
		];

		var getRules = function() {
			return rules.map(function(rule) {
				return angular.extend({ kind: rule.kind },
									  parser.parse(rule.rule)
									 );
			});
		};

return {
		getRules: getRules
	};
}]);

return {}; }); // module definition end
