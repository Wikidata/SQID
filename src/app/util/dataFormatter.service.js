//////// Module Definition ////////////
define([
	'util/util.module',
	'util/util.service',
	'i18n/i18n.service'
], function() {
///////////////////////////////////////

/**
 * This component provides methods for turning parts of the Wikidata 
 * data model into HTML for display.
 */ 
angular.module('util').factory('dataFormatter', ['util', 'i18n', function(util, i18n) {

	var getEntityTerms = function(entityId, missingTermsListener) {
		if (!i18n.hasEntityTerms(entityId)) {
			missingTermsListener['hasMissingTerms'] = true;
		}
		return i18n.getEntityTerms(entityId);
	}

	var getSomeValueHtml = function() { return '<i><span translate="STATEMENTS.SOME_VALUE"></span></i>'; }
	var getNoValueHtml = function() { return '<i><span translate="STATEMENTS.NO_VALUE"></span></i>'; }

	/**
	 * Returns HTML to present the given value for the given property.
	 * The missingTermsListener object will have its 'hasMissingTerms' field set to
	 * true if there any labels required for the HTML are unavailable in the i18n
	 * cache. This usually means that rendering will have to wait until labels have
	 * been fetched.
	 */
	var getValueHtml = function(datavalue, numPropId, properties, missingTermsListener, inline, short) {
		switch (datavalue.type) {
			case 'wikibase-entityid':
				if (datavalue.value["entity-type"] == "item") {
					var itemId = "Q" + datavalue.value["numeric-id"];
					var terms = getEntityTerms(itemId, missingTermsListener);
					if (inline) {
						return '<a title="' + terms.description + '" href="' + i18n.getEntityUrl(itemId) + '">' + terms.label + '</a>';
					} else {
						return '<a href="' + i18n.getEntityUrl(itemId) + '">' + terms.label + '</a>' +
							( terms.description != '' ? ' <span class="smallnote">(' + i18n.autoLinkText(terms.description) + ')</span>' : '' );
					}
				} else if (datavalue.value["entity-type"] == "property") {
					return i18n.getPropertyLink('P' + datavalue.value["numeric-id"]);
				}
			case 'time':
				var dateParts = datavalue.value.time.split(/[-T]/);
				var precision = datavalue.value.precision;
				var epochModifier = '';
				if (dateParts[0] == '') {
					dateParts.shift();
					epochModifier = ' BCE';
				} else if (dateParts[0].substring(0,1) == '+' ) {
					dateParts[0] = dateParts[0].substring(1);
				}
				var result = dateParts[0];
				if (precision >= 10) {
					result += '-' + dateParts[1];
				}
				if (precision >= 11) {
					result += '-' + dateParts[2];
				}
				if (precision >= 12) {
					result += ' ' + dateParts[3];
				}
				return result + epochModifier;
			case 'string':
				var displayString = datavalue.value;
				if (short && displayString.length > 15) {
					displayString = displayString.substring(0,6) + "..." + displayString.substring(displayString.length-6);
				}
				switch (properties.getDatatype(numPropId)) {
					case 'Url':
						return '<a class="ext-link" href="' + datavalue.value + '" target="_blank">' + displayString + '</a>';
					case 'CommonsMedia':
						return '<a class="ext-link" href="https://commons.wikimedia.org/wiki/File:' + datavalue.value.replace(' ','_') + '" target="_blank">' + displayString + '</a>';
					//case 'String': etc.
					default:
						var urlPattern = properties.getUrlPattern(numPropId);
						if (urlPattern) {
							return '<a class="ext-link" href="' + urlPattern.replace('$1',datavalue.value) + '" target="_blank" title="' + datavalue.value + '">' + displayString + '</a>';
						} else {
							return '<span title="' + datavalue.value + '">' + displayString + '</span>';
						}
				}
			case 'monolingualtext':
				return i18n.autoLinkText(datavalue.value.text) + ' <span class="smallnote">[' + datavalue.value.language + ']</span>';
			case 'quantity':
				var amount = datavalue.value.amount;
				if (amount.substring(0,1) == '+') {
					amount = amount.substring(1);
				}
				var unit = util.getIdFromUri(datavalue.value.unit);
				if (unit !== null) {
					unit = ' <a href="' + i18n.getEntityUrl(unit) + '">' + getEntityTerms(unit, missingTermsListener).label + '</a>';
				} else {
					unit = '';
				}
				return amount + unit;
			case 'globecoordinate':
				var globe = util.getIdFromUri(datavalue.value.globe);
				if (globe !== null && globe != 'Q2') {
					globe = ' on <a href="' + i18n.getEntityUrl(globe) + '">' + getEntityTerms(globe, missingTermsListener).label + '</a>';
				} else {
					globe = '';
				}
				return '(' + datavalue.value.latitude + ', ' + datavalue.value.longitude + ')' + globe;
			case 'sqid-text':
				return datavalue.value;
			default:
				return 'value type "' + datavalue.type + '" is not supported yet.';
		}
	}

	/**
	 * Returns the HTML to present a single snak, provided as a JSON object in the
	 * Wikibase API structure.
	 * The boolean showProperty controls if the property of the snak should be shown.
	 * The missingTermsListener object will have its 'hasMissingTerms' field set to
	 * true if there any labels required for the HTML are unavailable in the i18n
	 * cache. This usually means that rendering will have to wait until labels have
	 * been fetched.
	 */
	var getSnakHtml = function(snak, showProperty, properties, missingTermsListener, inline, short) {
		var ret = '';
		var propId = snak.property;
		if (showProperty) {
			ret += i18n.getPropertyLink(propId) + ' : ';
		}
		switch (snak.snaktype) {
			case 'value': 
				ret += getValueHtml(snak.datavalue, propId.substring(1), properties, missingTermsListener, inline, short);
				break;
			case 'somevalue':
				ret += getSomeValueHtml();
				break;
			case 'novalue':
				ret += getNoValueHtml();
				break;
		}
		return ret;
	}

	var getStatementMainValueHtml = function(statement, properties, missingTermsListener, inline, short) {
		var ret = getSnakHtml(statement.mainsnak, false, properties, missingTermsListener, inline, short);
		if (statement.rank == 'preferred') {
			ret += ' <span class="glyphicon glyphicon-star" aria-hidden="true" title="{{\'STATEMENTS.PREFERRED_HINT\'|translate}}"></span>';
		} else if (statement.rank == 'deprecated') {
			ret = '<span style="text-decoration: line-through;">' + ret + '</span> <span class="glyphicon glyphicon-ban-circle" aria-hidden="true" title="{{\'STATEMENTS.DEPRECATED_HINT\'|translate}}"></span>';
		}
		return ret;
	}

	var getSnaksHtml = function(snaks, properties, missingTermsListener, inline, short) {
		var ret = '';
		angular.forEach(snaks, function (snakList) {
			angular.forEach(snakList, function(snak) {
				ret += '<div>' + getSnakHtml(snak, true, properties, missingTermsListener, inline, short) + '</div>';
			});
		});
		return ret;
	}

	var getSnaksTableHtml = function(snaks, properties, missingTermsListener, inline, isProposal) {
		var ret = '';
		angular.forEach(snaks, function (snakList) {
			var first = true;
			angular.forEach(snakList, function(snak) {
				ret += '<tr' + (isProposal ? ' class="proposal"' : '') + '>';
				if (first) {
					first = false;
					ret += '<td valign="top" rowspan="' + snakList.length + '">' +
						i18n.getPropertyLink(snak.property) +
						'</td>';
				}
				ret += '<td>' + getSnakHtml(snak, false, properties, missingTermsListener, inline) + '</td>';
				if (isProposal){
					ret += '<td></td>';
				}
				ret += '</tr>';
			});
		});
		return ret;
	}

	/**
	 * Returns the HTML to present a single statement, provided as a JSON object in the
	 * Wikibase API structure, in block format.
	 * The missingTermsListener object will have its 'hasMissingTerms' field set to
	 * true if there any labels required for the HTML are unavailable in the i18n
	 * cache. This usually means that rendering will have to wait until labels have
	 * been fetched.
	 */
	var getStatementValueBlockHtml = function(statement, properties, missingTermsListener, showReferences, short) {
		var statementId = statement.id;

		var refTable = '';
		var refCount = 0;
		if (showReferences) {
			refTable += '<div style="overflow: auto; clear: both; padding-top: 4px;" ng-if="showRows(\'' + statementId + '\')">';
			if ('references' in statement) {
				refCount = statement.references.length;
				refTable += '<table class="reference-table">';
				angular.forEach(statement.references, function(reference) {
					var isProposal = false;
					var showControls = false;
					var referenceId = statement.id;
					if ('source' in reference){
						if (reference.source != 'Wikidata'){
							isProposal = true;
							if ('refId' in reference){
								referenceId = reference.refId;
							}
							if (statement.source == 'Wikidata'){
								showControls = true;
							}
						}
					}
					var proposalControls = '';
					if (showControls){
						proposalControls = '<th><div class="proposal-ctrl">'
							+ '<i class="fa fa-times-circle proposal-reject" ng-click="rejectReference(\'' + statement.id  + '\', \'' + encodeURIComponent(JSON.stringify(reference)) + '\');$event.stopPropagation()"></i>'
							+ '<i class="fa fa-check-circle proposal-accept" ng-click="approveReference(\'' + statement.id  + '\', \'' + encodeURIComponent(JSON.stringify(reference)) + '\');$event.stopPropagation()"></i>'
							+ '</div></th>';
					}
					refTable += '<tr' + (isProposal ? ' class="proposal"' : '') + '><th colspan="2">{{\'SEC_REFERENCE\'|translate}}' + (isProposal ? ' {{ \'PROPOSAL\' | translate }}' : '') + '</th>'
						+ proposalControls
						+ '</tr>'
						+ getSnaksTableHtml(reference.snaks, properties, missingTermsListener, false, isProposal);
					if (isProposal){
						refTable += '<tr class="proposal"><td class="proposal-font-format"><span translate="PROPOSAL_SOURCE"></span></td><td class="proposal-font-format">' + reference.source + '</td><td></td></tr>';
					}
				});
				refTable += '</table>';
			} else {
				refTable += '<span class="font-small">{{\'NO_REFERENCES_HINT\'|translate}}</span>'
			}
			refTable += '</div>';
		}

		var ret = getStatementMainValueHtml(statement, properties, missingTermsListener, false, short);

		// Showing this everywhere seems too obstrusive. We should have a way to toggle such information.
// 		if (showReferences && refCount == 0) {
// 			ret += '<span title="{{\'NO_REFERENCES_HINT\'|translate}}"  class="unsourced light-grey"></span>';
// 		}

		if ('qualifiers' in statement) {
			ret += '<div class="qualifiers">'
				+ getSnaksHtml(statement.qualifiers, properties, missingTermsListener, false, short)
				+ '</div>';
		}

		ret += refTable;

		return ret;
	}

	/**
	 * Returns the HTML to present a single statement, provided as a JSON object in the
	 * Wikibase API structure, in inline format.
	 * The missingTermsListener object will have its 'hasMissingTerms' field set to
	 * true if there any labels required for the HTML are unavailable in the i18n
	 * cache. This usually means that rendering will have to wait until labels have
	 * been fetched.
	 * 
	 * FIXME This fails since html needs to be an angular expression that evaluates to an $sce escaped html string, which is something we cannot insert on this level.
	 */
	var getStatementValueInlineHtml = function(statement, properties, missingTermsListener) {
		var ret = getStatementMainValueHtml(statement, properties, missingTermsListener, true);

		if ('qualifiers' in statement) {
			ret += ' <span uib-popover-html="\''
				+  getSnaksHtml(statement.qualifiers, properties, missingTermsListener, true)//.replace(/"/g,"'")
				+ '\'"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></span>';
		}

		return ret;
	}

	return {
		getValueHtml: getValueHtml,
		getSomeValueHtml: getSomeValueHtml,
		getNoValueHtml: getNoValueHtml,
		getSnakHtml: getSnakHtml,
		getStatementValueBlockHtml: getStatementValueBlockHtml,
		getStatementValueInlineHtml: getStatementValueInlineHtml,
		getStatementMainValueHtml: getStatementMainValueHtml,
		getStatementQualifiersHtml: function(statement, properties, missingTermsListener, inline) {
			return getSnaksHtml(statement.qualifiers, properties, missingTermsListener, true);
		}
	};
}]);


return {}; }); // module definition end