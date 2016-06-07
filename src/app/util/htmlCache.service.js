//////// Module Definition ////////////
define([
	'util/util.module'
], function() {
///////////////////////////////////////


angular.module('util').factory('htmlCache', ['$sce', function($sce) {
	var trustedHtmlSnippets = [];

	return {
		reset : function() { trustedHtmlSnippets = []; },
		getKey : function(html) {
			trustedHtmlSnippets.push($sce.trustAsHtml(html));
			return trustedHtmlSnippets.length-1;
		},
		getValue : function(key) {
			if (key < trustedHtmlSnippets.length) {
				return trustedHtmlSnippets[key];
			} else {
				return $sce.trustAsHtml('<span style="color: red;">HTML key ' + index + ' not found!</span>');
			}
		}
	};
}])

return {}; }); // module definition end