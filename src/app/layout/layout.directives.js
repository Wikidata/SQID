//////// Module Definition ////////////
define([
	'layout/layout.module',
	'meta/statistics.service'
], function() {
///////////////////////////////////////

angular.module('layout').directive('sqidApp', [function() {
	return {
		templateUrl: 'app/layout/layout.html'
	};
}]).directive('sqidMainNav', [function() {
	return {
		templateUrl: 'app/layout/sqidMainNav.tpl.html'
	};
}])


.directive('sqidImage', ['wikidataapi', function(wikidataapi) {

	var link = function (scope, element, attrs) {
		scope.$watch(attrs.file, function(file){
			wikidataapi.getImageData(file,attrs.width).then(function(imagedata) {
				var html = '<a href="' + imagedata.descriptionurl + '" taget="_blank">' +
						'<img src="' + imagedata.thumburl +'" style="display: block; margin-left: auto; margin-right: auto;"/>' +
					'</a>';
				element.replaceWith(html);
			});
		});
	};
	
	return {
		restrict: 'E',
		link: link
	};
}])

.directive('sqidFooter', ['$compile', 'statistics', function($compile, statistics) {

	var link = function (scope, element, attrs) {
		statistics.then(function(stats) {
			var innerHtml = '<div class="col-md-6"><span translate="FOOTER.STAT_DATE" translate-value-date="' + stats.getDumpDate().toLocaleDateString() + '"></span> (<a href="#/status"><span translate="FOOTER.STAT_LINK"></span></a>)</div>';
			innerHtml += '<div class="col-md-6"><span translate="FOOTER.POWERED_BY"></span></div>';
			element.html('<hr/><div class="container-fluid"><div class="footer row">' + innerHtml + '</div></div>');
			$compile(element.contents())(scope);
		});
	};
	
	return {
		restrict: 'E',
		link: link
	};
}])



return {}; }); // module definition end