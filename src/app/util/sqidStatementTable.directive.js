//////// Module Definition ////////////
define([
	'util/util.module',
	'util/util.service',
	'util/dataFormatter.service',
	'util/primarySources.service',
	'i18n/i18n.service',
	'data/properties.service'
], function() {
///////////////////////////////////////

angular.module('util').directive('sqidStatementTable', [
'$compile', 'properties', 'dataFormatter', 'util', 'i18n', 'primarySources',
function($compile, Properties, dataFormatter, util, i18n, primarySources) {
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
									(numId == '910') || // "topic's main category"
									(numId == '1204'); // "Wikimedia portal's main topic"
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
				var statementListId = propId + ( outlinks ? '-out' : '-in' );
				var statementGroup = statements[propId];
				var propertyLabel = i18n.getPropertyLabel(propId);

				var proposedStatementsCount = 0;
				angular.forEach(statementGroup, function (statement, index) {
					if (statement.source && statement.source != 'Wikidata') {
						proposedStatementsCount++;
					}
				});

				var statementCountString;
				var statementBadgeExtraClass;
				if (proposedStatementsCount == 0) {
					statementCountString = statementGroup.length.toString();
					statementBadgeExtraClass = "";
				} else {
					statementCountString = (statementGroup.length-proposedStatementsCount).toString() + "+" + proposedStatementsCount.toString();
					statementBadgeExtraClass = " info";
				}

				var hideSomeStatements = (statementGroup.length > hideStatementsThreshold + 1);
				angular.forEach(statementGroup, function (statement, index) {
					hasContent = true;
					var isProposal = (statement.source && statement.source != 'Wikidata');
					if (hideSomeStatements && index >= hideStatementsThreshold) {
						html += '<tr ng-if="showRows(\'' + statementListId + '\')" title="' + propertyLabel + '"' + (isProposal ? ' class="proposal"' : "") + '>';
					} else {
						html += '<tr title="' + propertyLabel + '"' + (isProposal ? ' class="proposal"' : "") + '>';
					}
					if (index == 0) {
						html += '<th valign="top" class="statements-table-left" rowspan="'
							+ (hideSomeStatements ? '{{getRowSpan(\'' + statementListId + '\',' + statementGroup.length + ')}}' : statementGroup.length )
							+ '">'
							+ i18n.getPropertyLink(propId)
							+ (hideSomeStatements ? '<br /><div style="margin-top: 15px; "><div class="badge-'
								+ (narrowTable ? 'small' : 'normal')  +
							' clickable' + statementBadgeExtraClass + '" ng-click="toggleRows(\'' + statementListId + '\')"><span class="{{getShowRowsClass(\'' + statementListId + '\')}}"><span translate="STATEMENTS.NUMBER_STATEMENTS" translate-value-number="' + (statementCountString) + '"></span></span></div></div>' : '')
							+ '</th>';
					}

					if (outlinks) { // expand statement, only used for outlinks right now (may change in future)
						html += '<td ng-click="toggleRows(\'' + statement.id + '\')" class="clickable">' +
							'<div style="float: right; "><span class="{{getShowRowsClass(\'' + statement.id + '\')}} light-grey font-tiny clickable"></span></div>';
					} else { // show left-arrow for inlinks
						html += '<td><span class=" light-grey font-tiny" style="margin-left: -2ex; margin-right: 1ex; "><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span></span>';
					}

					if (isProposal){
						if (!scope.proposalRegister){
							scope.proposalRegister = {};
						}
						scope.proposalRegister[statement.id] = statement;
						html += '<div class="proposal-ctrl"><span translate="PROPOSAL"></span>'
							+ '<i class="fa fa-times-circle proposal-reject" ng-if="handles(\'' + statement.id + '\', \'reject\')" ng-click="reject(\'' + statement.id + '\');$event.stopPropagation()"></i>'
							+ '<i class="fa fa-check-circle proposal-accept" ng-if="handles(\'' + statement.id + '\', \'approve\')" ng-click="approve(\'' + statement.id + '\');$event.stopPropagation()"></i>'
							+ '<span style="display: block"><span translate="SOURCE"></span>: ' + statement.source + ' </span></div>';
					}

					// add reference proposal to proposal register
					angular.forEach(statement.references, function(reference){
						if ('source' in reference){
							if (reference.source != 'Wikidata'){
								if ('refId' in reference){
									if (!scope.proposalRegister){
										scope.proposalRegister = {};
									}
									scope.proposalRegister['ref' + reference.refId] = reference;
								}
							}
						}
					});

					html += dataFormatter.getStatementValueBlockHtml(statement, properties, missingTermsListener, outlinks, narrowTable)
						+ '</td></tr>';
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

		function preparePropertyList(statements) {
			var propertyScores = {};
			// Note: class-based ranking rarely seems to help; hence using properties only
			for (var propertyId in statements) {
				angular.forEach(properties.getRelatedProperties(propertyId.substring(1)), function(relPropScore, relPropId) {
					if (relPropId in propertyScores) {
						propertyScores[relPropId] = propertyScores[relPropId] + relPropScore;
					} else {
						propertyScores[relPropId] = relPropScore;
					}
				});
			}

			var scoredProperties = [];

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

			var ret = [];
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
		scope.approve = function(statement){
			scope.proposalRegister[statement].approve(true);
		}
		scope.reject = function(statement){
			scope.proposalRegister[statement].reject(true);
		}
		scope.approveReference = function(referenceId){
			scope.proposalRegister[referenceId].approve(true);
		}
		scope.rejectReference = function(referenceId){
			scope.proposalRegister[referenceId].reject(true);
		}

        scope.handles = function(statement, action) {
            return ((action in scope.proposalRegister[statement]) &&
                    (angular.isDefined(scope.proposalRegister[statement][action])));
        };

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

return {}; }); // module definition end
