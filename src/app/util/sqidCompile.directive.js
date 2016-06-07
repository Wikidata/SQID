//////// Module Definition ////////////
define([
	'util/util.module'
], function() {
///////////////////////////////////////

angular.module('util')

/**
 * Directive to include trusted or untrusted HTML snippets and compiling
 * the result. This is necessary to expand directives within the snippets,
 * which does not work when using ng-bind-html-trusted to incude HTML.
 */
.directive('sqidCompile', ['$compile', function ($compile) {
	return function(scope, element, attrs) {
		scope.$watch(
			function(scope) {
				return scope.$eval(attrs.sqidCompile);
			},
			function(value) {
				// If value is a TrustedValueHolderType, it needs to be
				// explicitly converted to a string in order to
				// get the HTML string.
				element.html(value && value.toString());
				$compile(element.contents())(scope);
			}
		);
	};
}])


return {}; }); // module definition end