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
				rule: '(?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
				kind: 'materialise'
			},
			{ // grandfather
				rule: '(?grandfather.P21 = Q6581097)@?X, (?grandfather.P40 = ?parent)@?Y, (?parent.P40 = ?child)@?Z -> (?child.P1038 = ?grandfather)@[P1039 = Q9238344]',
				kind: 'informational'
			},
			{ // grandson
				rule: '(?son.P21 = Q6581097)@?X, (?grandparent.P40 = ?parent)@?Y, (?parent.P40 = ?son)@?Z -> (?grandparent.P1038 = ?son)@[P1039 = Q11921506]',
				kind: 'informational'
			},
			{ // grandmother
				rule: '(?grandmother.P21 = Q6581072)@?X, (?grandmother.P40 = ?parent)@?Y, (?parent.P40 = ?child)@?Z -> (?child.P1038 = ?grandmother)@[P1039 = Q9235758]',
				kind: 'informational'
			},
			{ // granddaughter
				rule: '(?daughter.P21 = Q6581072)@?X, (?grandparent.P40 = ?parent)@?Y, (?parent.P40 = ?daughter)@?Z -> (?grandparent.P1038 = ?daughter)@[P1039 = Q19756330]',
				kind: 'informational'
			},
			{
				rule: '?X:(P580=?startdate), (?headOfState.P39 = ?headOffice)@?X, (?country.P1906 = ?headOffice)@?Y -> (?country.P35 = ?headOfState)@[P580=?startdate]',
				kind: 'materialise'
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
