//////// Module Definition ////////////
define([
	'layout/layout.module',
	'i18n/i18n.config',
	'meta/statistics.service'
], function() {
///////////////////////////////////////

angular.module('layout').directive('sqidApp', [function() {
	return {
		templateUrl: 'app/layout/layout.html',
		restrict: 'A'
	};
}]).directive('sqidMainNav', [function() {
	return {
		templateUrl: 'app/layout/sqidMainNav.tpl.html'
	};
}])

.directive('sqidTitle', ['$rootScope', 'i18n', '$translate', function($rootScope, i18n, $translate) {

	return {
		link: link,
		restrict: 'A'
	};
	function link(scope, element, attrs) {

		$rootScope.$on('$routeChangeStart', function(e, next, current) {
			var page = false,
				suffix = ' - SQID';

			if (angular.isDefined(next.$$route)) {
				switch(next.$$route.originalPath.substr(1)) {
					case '':       page = 'PAGE_TITLE.START'; break;
					case 'about':  page = 'PAGE_TITLE.ABOUT'; break;
					case 'browse': browseTitle(); break;
					case 'view' :  viewTitle(); break;
					case 'query':  page = 'PAGE_TITLE.QUERY'; break;
					default:       page = false;
				}
			} else {
				console.log('next.$$route is undefined', e, next, current)
			}

			if(page) {
				(function translatePageName() {
					if(!$translate.isReady()) { setTimeout(translatePageName,100); }
					else {
						$translate(page).then(function(str) {
							page = str;
							updateElement();
						});
					}
				})();
			}

			function browseTitle() {
				page = (next.params.type === 'properties' ? 'PAGE_TITLE.PROPERTIES' : 'PAGE_TITLE.CLASSES');
			}

			function viewTitle() {
				page = false;
				if(next.params.id) {
					i18n.waitForTerms([next.params.id]).then(function() {
						page = i18n.getEntityLabel(next.params.id);
						updateElement();
					});
				}
			}

			function updateElement() {
				var text = 'SQID - Wikidata Explorer';
				if (page) {
					text = page + suffix;
				}
				element.text(text);
			}
		});
	}
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
