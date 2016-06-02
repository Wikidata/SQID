//////// Module Definition ////////////
define([
	'util/util', // pulls in angular
	'util/wikidataapi',
	'app/statistics',
	'app/properties',
	'util/dataFormatter',
	'util/i18n'
], function() {
///////////////////////////////////////

angular.module('utilities').directive('sqidImage', ['wikidataapi', function(wikidataapi) {

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

.directive('sqidStatementTable', ['$compile', 'Properties', 'dataFormatter', 'util', 'i18n', function($compile, Properties, dataFormatter, util, i18n) {
	var properties = null;
	var outMissingTermsListener = { hasMissingTerms : false};
	var inMissingTermsListener = { hasMissingTerms : false};
	var outHtml = '';
	var inHtml = '';

	var hideStatementsThreshold = 3; // how many statements are displayed when hiding some

	var link = function (scope, element, attrs) {
		var show = attrs.show;
		var title = attrs.title;
		var narrowTable = ('narrow' in attrs);

		outHtml = '';
		inHtml = '';
		outMissingTermsListener.hasMissingTerms = false;
		inMissingTermsListener.hasMissingTerms = false;

		var includeProperty = function(numId) {
			if (!show || show == 'all') {
				return true;
			}
			if (numId == '31' || numId == '279') {
				return false;
			}

			var isId = (properties.getDatatype(numId) == 'ExternalId');
			var isHumanRelation = false;
			var isMedia = (properties.getDatatype(numId) == 'CommonsMedia');
			var isAboutWikiPages = (numId == '1151') || // "topic's main Wikimedia portal"
									(numId == '910'); // "topic's main category"
			angular.forEach(properties.getClasses(numId), function(classId) {
				if (classId == '19847637' || // "Wikidata property representing a unique identifier"
					classId == '18614948' || // "Wikidata property for authority control"
					classId == '19595382' || // "Wikidata property for authority control for people"
					classId == '19829908' || // "Wikidata property for authority control for places"
					classId == '19833377' || // "Wikidata property for authority control for works"
					classId == '18618628' || // "Wikidata property for authority control for cultural heritage identification"
					classId == '21745557' || // "Wikidata property for authority control for organisations"
					classId == '19833835' || // "Wikidata property for authority control for substances"
					classId == '22964274'  // "Wikidata property for identication in the film industry"
				) {
					isId = true;
				} else if (classId == '22964231') { // "Wikidata property for human relationships"
					isHumanRelation = true;
				} else if (classId == '18610173') { // "Wikidata property for Commons"
					isMedia = true;
				} else if (classId == '18667213' || // "Wikidata property about Wikimedia categories"
					classId == '22969221' // "Wikidata property giving Wikimedia list"
				) {
					isAboutWikiPages = true;
				}
			});

			switch (show) {
				case 'ids':
					return isId;
				case 'family':
					return isHumanRelation;
				case 'media':
					return isMedia;
				case 'wiki':
					return isAboutWikiPages;
				case 'other': default:
					return !isId && !isHumanRelation && !isMedia && !isAboutWikiPages;
			}
		}

		var getStatementHtmlTable = function(statements, propertyList, outlinks) {
			var html = '<table class="table table-striped table-condensed ' + 
				(narrowTable ? 'narrow-statements-table' : 'statements-table' ) + '"><tbody>';
			var hasContent = false;
			var missingTermsListener = outlinks ? outMissingTermsListener : inMissingTermsListener;

			angular.forEach(propertyList, function (propId) {
				var statementGroup = statements[propId]
				var propertyLabel = i18n.getPropertyLabel(propId);

				var hideSomeStatements = (statementGroup.length > hideStatementsThreshold + 1);
				angular.forEach(statementGroup, function (statement, index) {
					hasContent = true;
					if (hideSomeStatements && index >= hideStatementsThreshold) {
						html += '<tr ng-if="showRows(\'' + propId + '\')" title="' + propertyLabel + '">';
					} else {
						html += '<tr title="' + propertyLabel + '">';
					}
					if (index == 0) {
						html += '<th valign="top" rowspan="'
							+ (hideSomeStatements ? '{{getRowSpan(\'' + propId + '\',' + statementGroup.length + ')}}' : statementGroup.length )
							+ '">'
							+ i18n.getPropertyLink(propId)
							+ (hideSomeStatements ? '<br /><div style="margin-top: 15px; "><div class="badge-'
								+ (narrowTable ? 'small' : 'normal')  +
							' clickable" ng-click="toggleRows(\'' + propId + '\')"><span class="{{getShowRowsClass(\'' + propId + '\')}}"><span translate="STATEMENTS.NUMBER_STATEMENTS" translate-value-number="' + (statementGroup.length) + '"></span></span></div></div>' : '')
							+ '</th>';
					}
					html += '<td>' +
						( outlinks ? '' : '<span style="color: #999; margin-left: -2ex; margin-right: 1ex; font-size: 80%; "><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span></span>') +
						dataFormatter.getStatementValueBlockHtml(statement, properties, missingTermsListener, outlinks, narrowTable) +
						'</td>' +
						'</tr>';
				});
			});
			if (!hasContent) return '';
			html += '</tbody></table>';
			return html;
		}
		
		var updateHtml = function(element, scope) {
			var html;
			if ( scope.outHtml == '' && scope.inHtml == '' ) {
				html = '';
			} else {
				var panelId = 'statements_' + show;
				html = '<div class="panel panel-info">\n' +
							'<div class="panel-heading" data-toggle="collapse" data-target="#' + panelId + '"><h2 class="panel-title">\n' +
							'<a style="cursor:pointer;cursor:hand">' + title + '</a></h2></div>' +
							'<div id="' + panelId + '" class="panel-collapse collapse in">' +
							'<div style="overflow: auto;">';
				if (scope.inHtml != '') {
					html += '<uib-tabset type="pills" justified="true">' +
						'<uib-tab classes="shy-pill"><uib-tab-heading><span translate="STATEMENTS.OUTGOING"></span></uib-tab-heading>' +
						scope.outHtml +
						'</uib-tab>' +
						'<uib-tab classes="shy-pill"><uib-tab-heading><span translate="STATEMENTS.INCOMING"></span></uib-tab-heading>' +
						scope.inHtml +
						'</uib-tab>' +
						'</uib-tabset>';
				} else { // outHtml != '' in this case
					html += scope.outHtml;
				}
				html += '</div></div></div>';
			}
			insertAndCompile(html, element, scope);
		}

		var preparePropertyList = function(statements) {
			propertyScores = {};
			// Note: class-based ranking rarely seems to help; hence using properties only
			for (propertyId in statements) {
				angular.forEach(properties.getRelatedProperties(propertyId.substring(1)), function(relPropScore, relPropId) {
					if (relPropId in propertyScores) {
						propertyScores[relPropId] = propertyScores[relPropId] + relPropScore;
					} else {
						propertyScores[relPropId] = relPropScore;
					}
				});
			}

			scoredProperties = [];

			for (propertyId in statements) {
				var numPropId = propertyId.substring(1);
				if (includeProperty(numPropId)) {
					if (numPropId in propertyScores) {
						scoredProperties.push([numPropId,propertyScores[numPropId]]);
					} else {
						scoredProperties.push([numPropId,0]);
					}
				}
			}

			scoredProperties.sort(function(a, b) {
				var a = a[1];
				var b = b[1];
				return a < b ? 1 : (a > b ? -1 : 0);
			});

			ret = [];
			angular.forEach(scoredProperties, function(propertyData) {
				ret.push('P' + propertyData[0]);
			});
			return ret;
		}

		var insertAndCompile = function(html, element, scope) {
			element.html(html);
			$compile(element.contents())(scope);
		}

		// Register additional functions to toggle the display for longer lists of statements:
		scope.showRows = function(id) {
			var field = 'show' + id;
			if (field in scope) {
				return scope[field];
			} else {
				return false;
			}
		}
		scope.toggleRows = function(id) {
			var field = 'show' + id;
			scope[field] = !scope.showRows(id);
		}
		scope.getRowSpan = function(id,length) {
			return scope.showRows(id) ? length : hideStatementsThreshold;
		}
		scope.getShowRowsMessage = function(id) {
			return scope.showRows(id) ? 'STATEMENTS.LESS_STATEMENTS' : 'STATEMENTS.MORE_STATEMENTS';
		}
		scope.getShowRowsClass = function(id) {
			return (scope.showRows(id) ? 'expand-open' : 'expand-closed' );
		}
		
		scope.inHtml = '';
		scope.outHtml = '';

		scope.$watch(attrs.data, function(itemData){
			itemData.waitForPropertyLabels().then(function() {
				Properties.then(function(propertyData){
					properties = propertyData;
					var propertyList = preparePropertyList(itemData.statements);

					scope.outHtml = getStatementHtmlTable(itemData.statements, propertyList, true);
					updateHtml(element, scope);
					if (outMissingTermsListener.hasMissingTerms) {
						itemData.waitForTerms().then( function() {
							outMissingTermsListener.hasMissingTerms = false;
							scope.outHtml = getStatementHtmlTable(itemData.statements, propertyList, true);
							updateHtml(element, scope);
						});
					}
				})
			});
		});

		scope.$watch(attrs.indata, function(inData){
			if (!inData) return;
			inData.waitForPropertyLabels().then(function() {
				Properties.then(function(propertyData){
					properties = propertyData;
					var propertyList = preparePropertyList(inData.statements);

					var inHtml = getStatementHtmlTable(inData.statements, propertyList, false);
					if (inMissingTermsListener.hasMissingTerms) {
						inData.waitForTerms().then( function() {
							inMissingTermsListener.hasMissingTerms = false;
							scope.inHtml = getStatementHtmlTable(inData.statements, propertyList, false);
							updateHtml(element, scope);
						});
					} else {
						scope.inHtml = inHtml;
						updateHtml(element, scope);
					}
				})
			});
		});
	}

	return {
		restrict: 'E',
		link: link
	};
}]);

return {}; // module
});		  // definition end