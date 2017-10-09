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
			'(?x.P1696 = ?y)@?S -> (?y.P1696 = ?x)@F(?S)',
			'(?x.P1696 = ?y)@?S -> (?y.P1696 = ?x)@?S', // x inverseOf y -> y inverseOf x
			'(?x.P361 = ?y)@?S -> (?y.P527 = ?x)@?S', // x partOf y -> y hasPart x
//			  '?S:(?att = ?start), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@{?att = ?start}', // x spouse y [att:start] -> y spouse x[att:start]
			'(?x.P26 = ?y)@(P580 = ?start), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
			'?S:(P580 = ?start), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S', // start = ?start in ?S, ?x spouse ?y: ?S -> ?y spouse ?x: ?S
			'?S:[P580 = ?start], (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S', // ?S = [start = ?start], ?x spouse ?y: ?S -> ?y spouse ?x: ?S
			'?S:(), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S', // ?S = [...], ?x spouse ?y: ?S -> ?y spouse ?x: ?S
			'?S:((P580 = ?start) \\ (P582 = +)), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
			'?S:((P580 = ?start) && (P582 = *)), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
			'?S:((P580 = ?start) || (P582 = +)), (?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
			'(?gf.P21 = Q6581097)@?X, (?gf.P40 = ?f)@?Y, (?f.P40 = ?s)@?Z -> (?s.P1038 = ?gf)@[P1039 = Q9238344]',
			'(?s.P21 = Q6581097)@?X, (?gf.P40 = ?f)@?Y, (?f.P40 = ?s)@?Z -> (?gf.P1038 = ?s)@[P1039 = Q11921506]'
		];

		var getRules = function() {
			return rules.map(function(rule) {
				return parser.parse(rule);
			});
		};

return {
		getRules: getRules
	};
}]);

return {}; }); // module definition end
