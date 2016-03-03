
classBrowser.factory('ClassView', function($route, sparql, wikidataapi) {
	var MAX_EXAMPLE_INSTANCES = 20;
	var MAX_DIRECT_SUBCLASSES = 10;
	var RELATED_PROPERTIES_THRESHOLD = 5;

	var qid;
	return {
		MAX_EXAMPLE_INSTANCES: MAX_EXAMPLE_INSTANCES,
		MAX_DIRECT_SUBCLASSES: MAX_DIRECT_SUBCLASSES,
		RELATED_PROPERTIES_THRESHOLD: RELATED_PROPERTIES_THRESHOLD,

		updateQid: function() {
			qid = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		},

		getInstances: function() {
			return sparql.getPropertySubjects("P31", qid, MAX_EXAMPLE_INSTANCES + 1);
		},

		getSubclasses: function() {
			return sparql.getPropertySubjects("P279", qid, MAX_DIRECT_SUBCLASSES + 1);
		},

		getClassData: function() {
			return wikidataapi.fetchEntityData(qid);
		},

		getQid: function(){
			return qid;
		}
	};
})
.controller('ClassViewController',
	function($scope, $route, ClassView, Classes, Properties, sparql, wikidataapi){
		ClassView.updateQid();
		$scope.qid = ClassView.getQid();
		$scope.exampleInstances = null;
		$scope.exampleSubclasses = null;
		$scope.classData = null;
		$scope.superClasses = null;
		$scope.instanceClasses = null;
		$scope.classes = null;
		$scope.properties = null;

		$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;

		Classes.then(function(classes){
			var numId = $scope.qid.substring(1);

			Properties.then(function(properties){
				$scope.relatedProperties = properties.formatRelatedProperties(classes.getRelatedProperties(numId), ClassView.RELATED_PROPERTIES_THRESHOLD);
				$scope.instanceOfUrl = properties.getUrl("31");
				$scope.subclassOfUrl = properties.getUrl("279");
			});
			ClassView.getClassData().then(function(data) {
				$scope.classData = wikidataapi.extractEntityData(data, $scope.qid);
				var superClasses = [];
				for (var i in $scope.classData.superclasses) {
					var superNumId = $scope.classData.superclasses[i];
					superClasses.push({label: classes.getLabel(superNumId), url: classes.getUrl(superNumId), icount: classes.getAllInstanceCount(superNumId)});
				}
				$scope.superClasses = superClasses;
				
				var instanceClasses = [];
				for (var i in $scope.classData.instanceClasses) {
					var superNumId = $scope.classData.instanceClasses[i];
					instanceClasses.push({label: classes.getLabel(superNumId), url: classes.getUrl(superNumId), icount: classes.getAllInstanceCount(superNumId)});
				}
				$scope.instanceClasses = instanceClasses;
			});

			$scope.directInstances = classes.getDirectInstanceCount(numId);
			$scope.directSubclasses = classes.getDirectSubclassCount(numId);
			$scope.allInstances = classes.getAllInstanceCount(numId);
			$scope.allSubclasses = classes.getAllSubclassCount(numId);
			$scope.nonemptySubclasses = classes.getNonemptySubclasses(numId);

			if ($scope.directInstances > 0) {
				ClassView.getInstances().then(function(data) {
					$scope.exampleInstances = sparql.prepareInstanceQueryResult(data, "P31", ClassView.getQid(), ClassView.MAX_EXAMPLE_INSTANCES + 1, null);
				});
			}
			if ($scope.directSubclasses > 0) {
				ClassView.getSubclasses().then(function(data) {
					$scope.exampleSubclasses = sparql.prepareInstanceQueryResult(data, "P279", ClassView.getQid(), ClassView.MAX_DIRECT_SUBCLASSES + 1, classes);
				});
			}
		});
	}
)

.directive('wdcbStatementTable', function(Properties, wikidataapi, util) {
	var idTerms = {};
	var idTermsSize = 0;
	var properties = null;

	var link = function (scope, element, attrs) {
		var show = attrs.show;

		// clear term cache when it grows too big to prevent memory leak
		if (idTermsSize > 5000) {
			// 5000 is a lot; only the huges of items may reach that (which is no problem either)
			idTerms = {};
			idTermsSize = 0;
		}

		var missingTermIds = {};

		var includeProperty = function(numId) {
			if (!show || show == 'all') {
				return true;
			}
			if (numId == '31' || numId == '279') {
				return false;
			}
			if (show == 'ids') {
				return (properties.getDatatype(numId) == 'ExternalId');
			}

			// if (show == 'other')
			return (properties.getDatatype(numId) != 'ExternalId');
		}

		var getEntityTerms = function(entityId) {
			if (entityId in idTerms) {
				return idTerms[entityId];
			} else {
				missingTermIds[entityId] = true;
				return { label: entityId, description: ""};
			}
		}

		var getPropertyLink = function(numId) {
			return '<a href="' + properties.getUrl(numId) + '">' + properties.getLabelOrId(numId) + '</a>';
		}

		var getValueHtml = function(datavalue) {
			switch (datavalue.type) {
				case 'wikibase-entityid':
					if (datavalue.value["entity-type"] == "item") {
						var itemId = "Q" + datavalue.value["numeric-id"];
						var terms = getEntityTerms(itemId);
						return '<a href="' + util.getItemUrl(itemId) + '">' + terms.label + '</a>' +
							( terms.description != '' ? ' <span class="smallnote">(' + terms.description + ')</span>' : '' );
					} else if (datavalue.value["entity-type"] == "property") {
						return getPropertyLink(datavalue.value["numeric-id"]);
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
					return datavalue.value;
				case 'monolingualtext':
					return datavalue.value.text + ' <span class="smallnote">[' + datavalue.value.language + ']</span>';
				case 'quantity':
					var amount = datavalue.value.amount;
					if (amount.substring(0,1) == '+') {
						amount = amount.substring(1);
					}
					var unit = util.getIdFromUri(datavalue.value.unit);
					if (unit !== null) {
						unit = ' <a href="' + util.getItemUrl(unit) + '">' + getEntityTerms(unit).label + '</a>';
					} else {
						unit = '';
					}
					return amount + unit;
				case 'globecoordinate':
					var globe = util.getIdFromUri(datavalue.value.globe);
					if (globe !== null && globe != 'Q2') {
						globe = ' on <a href="' + util.getItemUrl(globe) + '">' + getEntityTerms(globe).label + '</a>';
					} else {
						globe = '';
					}
					return '(' + datavalue.value.latitude + ', ' + datavalue.value.longitude + ')' + globe;
				default:
					return 'value type "' + datavalue.type + '" is not supported yet.';
			}
		}

		var makeSnakHtml = function(snak, showProperty) {
			ret = '';
			if (showProperty) {
				ret += getPropertyLink(snak.property.substring(1)) + ' : ';
			}
			switch (snak.snaktype) {
				case 'value': 
					ret += getValueHtml(snak.datavalue);
					break;
				case 'somevalue':
					ret += '<i>unspecified value</i>';
					break;
				case 'novalue':
					ret += '<i>no value</i>';
					break;
			}
			return ret;
		}
		
		var makeStatementValueHtml = function(statement) {
			ret = makeSnakHtml(statement.mainsnak, false);
			if ('qualifiers' in statement) {
				ret += '<div style="padding-left: 10px; font-size: 80%; ">';
				angular.forEach(statement.qualifiers, function (snakList) {
					angular.forEach(snakList, function(snak) {
						ret += '<div>' + makeSnakHtml(snak, true) + '</div>';
					});
				});
				ret += '</div>';
			}
			return ret;
		};

		var getHtml = function(statements) {
			var html = '<div style="overflow: auto;"><table class="table table-striped table-condensed"><tbody>';
			angular.forEach(statements, function (statementGroup, propertyId) {
				var numPropId = propertyId.substring(1);
				if (includeProperty(numPropId)) {
					angular.forEach(statementGroup, function (statement, index) {
						html += '<tr>';
						if (index == 0) {
							html += '<th valign="top" rowspan="' + statementGroup.length + '" style="min-width: 20%;">'
								+ getPropertyLink(numPropId)
								+ '</th>';
						}
						html += '<td>' + makeStatementValueHtml(statement) + '</td>'
						html += '</tr>';
					});
				}
			});
			html += '</tbody></table></div>';
			return html;
		}

		scope.$watch(attrs.statements, function(statements){
			Properties.then(function(props){
				properties = props;
				var html = getHtml(statements);
				var missingTermIdList = Object.keys(missingTermIds);
				if (missingTermIdList.length > 0) {
					wikidataapi.getEntityTerms(missingTermIdList).then(function(terms){
						angular.extend(idTerms, terms);
						idTermsSize = Object.keys(idTerms).length;
						missingTermIds = {};
						element.replaceWith(getHtml(statements));
					});
				} else {
					element.replaceWith(html);
				}
			});
		});
	};

	return {
		restrict: 'E',
		link: link
	};
});

