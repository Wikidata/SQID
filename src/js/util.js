
angular.module('utilities', [])
.factory('jsonData', function() {

	var JSON_LABEL = "l";
	var JSON_INSTANCES = "i";
	var JSON_SUBCLASSES = "s";
	var JSON_RELATED_PROPERTIES = "r";

	return {
		JSON_LABEL: JSON_LABEL,
		JSON_INSTANCES: JSON_INSTANCES,
		JSON_SUBCLASSES: JSON_SUBCLASSES,
		JSON_RELATED_PROPERTIES: JSON_RELATED_PROPERTIES,

		JSON_ITEMS_WITH_SUCH_STATEMENTS: "i",
		JSON_USES_IN_STATEMENTS: "s",
		JSON_USES_IN_STATEMENTS_WITH_QUALIFIERS: "w",
		JSON_USES_IN_QUALIFIERS: "q",
		JSON_USES_IN_PROPERTIES: "p",
		JSON_USES_IN_REFERENCES: "e",
		JSON_DATATYPE: "d",

		TABLE_SIZE: 15,
		PAGE_SELECTOR_SIZE: 2
	};

})

.factory('util', function($http, $q) {

	var httpRequest = function(url) {
		return $http.get(url).then(function(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				// invalid response
				return $q.reject(response.data);
			}
		},
		function(response) {
			// something went wrong
			return $q.reject(response.data);
		});
	}

	var jsonpRequest = function(url) {
		return $http.jsonp(url).then(function(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				// invalid response
				return $q.reject(response.data);
			}
		},
		function(response) {
			// something went wrong
			return $q.reject(response.data);
		});
	}
	
	var getIdFromUri = function(uri) {
		if ( uri.substring(0, "http://www.wikidata.org/entity/".length) === "http://www.wikidata.org/entity/" ) {
			return uri.substring("http://www.wikidata.org/entity/".length, uri.length);
		} else {
			return null;
		}
	}

	var getEntityUrl = function(entityId) { return "#/classview?id=" + entityId; };

	return {
		httpRequest: httpRequest,
		jsonpRequest: jsonpRequest,
		getEntityUrl: getEntityUrl,
		getIdFromUri: getIdFromUri
	};
})

.factory('sparql', function(util) {

	var SPARQL_SERVICE = "https://query.wikidata.org/bigdata/namespace/wdq/sparql";
	var SPARQL_UI_PREFIX = "https://query.wikidata.org/#";

	var getQueryUrl = function(sparqlQuery) {
		return SPARQL_SERVICE + "?query=" + encodeURIComponent(sparqlQuery);
	}

	var getQueryUiUrl = function(sparqlQuery) {
		return SPARQL_UI_PREFIX + encodeURIComponent(sparqlQuery);
	}

	var getQueryForPropertySubjects = function(propertyId, objectId, limit) {
		return "PREFIX wikibase: <http://wikiba.se/ontology#> \n\
PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n\
PREFIX wd: <http://www.wikidata.org/entity/> \n\
SELECT $p $pLabel \n\
WHERE { \n\
   { SELECT $p WHERE { $p wdt:" + propertyId +  (objectId != null ? " wd:" + objectId : " _:bnode")  +
   " . } LIMIT " + limit + " } \n\
   SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" . } \n\
}";
	}

	var fetchPropertySubjects = function(propertyId, objectId, limit) {
		console.log('SPARQL: ' + getQueryForPropertySubjects(propertyId, objectId, limit));
		var url = getQueryUrl(getQueryForPropertySubjects(propertyId, objectId, limit));
		return util.httpRequest(url);
	}

	var getInstance = function(sparqlQuery) {
		return SPARQL_UI_PREFIX + encodeURIComponent(sparqlQuery);
	}

	var getInlinkCount = function(propertyID, objectItemId) {
		var query = "PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n\
PREFIX wd: <http://www.wikidata.org/entity/> \n\
SELECT (count(*) as $c) WHERE { $p wdt:" + propertyID + " wd:" + objectItemId + " . }";
		var result = JSON.parse(httpGet(getQueryUrl(query)));
		return result.results.bindings[0].c.value;
	}

	var getPropertySubjects = function(propertyId, objectId, limit) {
		return fetchPropertySubjects(propertyId, objectId, limit).then(function(data){
				results = [];
				try {
					var instanceJson = data.results.bindings;
					var element;
					for (var i = 0; i < instanceJson.length; i++) {
						if ( i < limit-1 ) {
							var uri = util.getEntityUrl(util.getIdFromUri(instanceJson[i].p.value));
							element = {
								label: instanceJson[i].pLabel.value,
								uri: uri
							};
						} else {
							element = {
								label: "... further results",
								uri: getQueryUiUrl(getQueryForPropertySubjects(propertyId, objectId, 1000))
							};
						}
						results.push(element);
					}
				}
				catch (err) {
					//nothing to do here
				}
				return results;
		});
	}

	return {
		getQueryUrl: getQueryUrl,
		getQueryUiUrl: getQueryUiUrl,
		getInlinkCount: getInlinkCount,
		getPropertySubjects: getPropertySubjects,
		getIdFromUri: util.getIdFromUri // deprecated; only for b/c
	};

})

.factory('wikidataapi', function(util, $q) {

	var language = "en";

	var fetchEntityData = function(id) {
// 		return util.httpRequest("https://www.wikidata.org/wiki/Special:EntityData/" + id + ".json?action=purge");
		// Alternatively, the following API call also works. What is faster?
				return util.jsonpRequest('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + id + '&redirects=yes&props=sitelinks|descriptions|claims|datatype|aliases|labels&languages=' + language + '&callback=JSON_CALLBACK');
	}

	var getStatementValue = function(statementJson, defaultValue) {
		try {
			var ret = statementJson.mainsnak.datavalue.value;
			if (ret) return ret;
		} catch (err) {
			// fall through
		}
		return defaultValue;
	}

	var getEntityData = function(id) {
		return fetchEntityData(id).then(function(response) {
			var ret = {
				label: "",
				labelorid: id,
				description: "",
				images: [],
				aliases: [],
				banner: null,
				superclasses: [],
				instanceClasses: [],
				statements: {}
			};

			var entityData = response.entities[id];

			if (language in entityData.labels) {
				ret.label = entityData.labels[language].value;
				ret.labelorid = entityData.labels[language].value;
			}
			if (language in entityData.descriptions) {
				ret.description = entityData.descriptions[language].value;
			}
			if (language in entityData.aliases) {
				var aliasesData = entityData.aliases[language];
				for (var i in aliasesData){
					ret.aliases.push(aliasesData[i].value);
				}
			}
			
			if ("claims" in entityData) {
				// image
				if ("P18" in entityData.claims) {
					for (var i in entityData.claims.P18) {
						var imageFileName = getStatementValue(entityData.claims.P18[i],"");
						ret.images.push(imageFileName.replace(" ","_"));
					}
				}
				// instance of
				if ("P31" in entityData.claims) {
					for (var i in entityData.claims.P31) {
						ret.instanceClasses.push(getStatementValue(entityData.claims.P31[i],{"numeric-id": 0})["numeric-id"].toString());
					}
				}
				// subclass of
				if ("P279" in entityData.claims) {
					for (var i in entityData.claims.P279) {
						ret.superclasses.push(getStatementValue(entityData.claims.P279[i],{"numeric-id": 0})["numeric-id"].toString());
					}
				}
				// Wikivoyage banner; only pick the first banner if multiple
				if ("P948" in entityData.claims) {
					var imageFileName = getStatementValue(entityData.claims.P948[0],"");
					ret.banner = imageFileName.replace(" ","_");
				}
				
				ret.statements = entityData.claims;
			}

			return ret;
		});
	};

	var getImageData = function(fileName, width) {
		var url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=File%3A' +
			encodeURIComponent(fileName) + '&iiprop=size%7Curl&iiurlwidth=' + width + '&callback=JSON_CALLBACK';
		return util.jsonpRequest(url).then(function(response) {
			for (var key in response.query.pages) { // return first result
				return response.query.pages[key].imageinfo[0];
			}
		});
	};

	var getEntityTerms = function(entityIds) {
		var baseUrl = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&redirects=yes&props=descriptions%7Clabels&languages=' + language + '&callback=JSON_CALLBACK';
		var requests = [];

		for (var i = 0; i < entityIds.length; i += 50) {
			requests.push(util.jsonpRequest(baseUrl + '&ids=' + entityIds.slice(i,i+50).join('|')));
		}

		return $q.all(requests).then( function(responses) {
			var ret = {};
			angular.forEach(responses, function(response) {
				if ("entities" in response) {
					angular.forEach(response.entities, function(data,entityId) {
						var label = entityId;
						var desc = "";
						if (language in data.labels) label = data.labels[language].value;
						if (language in data.descriptions) desc = data.descriptions[language].value;
						ret[entityId] = { label: label, description: desc };
					});
				}
			});
			return ret;
		});
	};

	return {
		getEntityData: getEntityData,
		getEntityTerms: getEntityTerms,
		getImageData: getImageData
	};
})

.directive('wdcbImage', function(wikidataapi) {

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
})

.directive('wdcbStatementTable', function(Properties, Classes, wikidataapi, util) {
	var idTerms = {};
	var idTermsSize = 0;
	var properties = null;

	var link = function (scope, element, attrs) {
		var show = attrs.show;

		// clear term cache when it grows too big to prevent memory leak
		if (idTermsSize > 5000) {
			// 5000 is a lot; only the hugest of items may reach that (which is no problem either)
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

		var getValueHtml = function(datavalue, numPropId) {
			switch (datavalue.type) {
				case 'wikibase-entityid':
					if (datavalue.value["entity-type"] == "item") {
						var itemId = "Q" + datavalue.value["numeric-id"];
						var terms = getEntityTerms(itemId);
						return '<a href="' + util.getEntityUrl(itemId) + '">' + terms.label + '</a>' +
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
					switch (properties.getDatatype(numPropId)) {
						case 'Url':
							return '<a class="ext-link" href="' + datavalue.value + '" target="_blank">' + datavalue.value + '</a>';
						case 'CommonsMedia':
							return '<a class="ext-link" href="https://commons.wikimedia.org/wiki/File:' + datavalue.value.replace(' ','_') + '" target="_blank">' + datavalue.value + '</a>';
						//case 'String':
						default:
							return datavalue.value;
					}
				case 'monolingualtext':
					return datavalue.value.text + ' <span class="smallnote">[' + datavalue.value.language + ']</span>';
				case 'quantity':
					var amount = datavalue.value.amount;
					if (amount.substring(0,1) == '+') {
						amount = amount.substring(1);
					}
					var unit = util.getIdFromUri(datavalue.value.unit);
					if (unit !== null) {
						unit = ' <a href="' + util.getEntityUrl(unit) + '">' + getEntityTerms(unit).label + '</a>';
					} else {
						unit = '';
					}
					return amount + unit;
				case 'globecoordinate':
					var globe = util.getIdFromUri(datavalue.value.globe);
					if (globe !== null && globe != 'Q2') {
						globe = ' on <a href="' + util.getEntityUrl(globe) + '">' + getEntityTerms(globe).label + '</a>';
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
			var numPropId = snak.property.substring(1);
			if (showProperty) {
				ret += getPropertyLink(numPropId) + ' : ';
			}
			switch (snak.snaktype) {
				case 'value': 
					ret += getValueHtml(snak.datavalue, numPropId);
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
			if (statement.rank == 'preferred') {
				ret += ' <span class="glyphicon glyphicon-star" aria-hidden="true" title="This is a preferred statement"></span>';
			} else if (statement.rank == 'deprecated') {
				ret = '<span style="text-decoration: line-through;">' + ret + '</span> <span class="glyphicon glyphicon-ban-circle" aria-hidden="true" title="This is a deprecated statement"></span>';
			} 
			
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

		var getHtml = function(statements, propertyList) {
			var html = '<div style="overflow: auto;"><table class="table table-striped table-condensed"><tbody>';
			angular.forEach(propertyList, function (numPropId) {
				var statementGroup = statements['P' + numPropId]
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
			});
			html += '</tbody></table></div>';
			return html;
		}

		var preparePropertyList = function(itemData) {
			propertyScores = {};
			// Note: class-based ranking rarely seems to help; hence using properties only
			for (propertyId in itemData.statements) {
				angular.forEach(properties.getRelatedProperties(propertyId), function(relPropScore, relPropId) {
					if (relPropId in propertyScores) {
						propertyScores[relPropId] = propertyScores[relPropId] + relPropScore;
					} else {
						propertyScores[relPropId] = relPropScore;
					}
				});
			}

			scoredProperties = [];

			for (propertyId in itemData.statements) {
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
				ret.push(propertyData[0]);
			});
			return ret;
		}

		scope.$watch(attrs.data, function(itemData){
			Properties.then(function(propertyData){
				properties = propertyData;
				var propertyList = preparePropertyList(itemData);
				
				var html = getHtml(itemData.statements, propertyList);
				var missingTermIdList = Object.keys(missingTermIds);
				if (missingTermIdList.length > 0) {
					wikidataapi.getEntityTerms(missingTermIdList).then(function(terms){
						angular.extend(idTerms, terms);
						idTermsSize = Object.keys(idTerms).length;
						missingTermIds = {};
						element.replaceWith(getHtml(itemData.statements, propertyList));
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

