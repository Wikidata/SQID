//////// Module Definition ////////////
define([
	'util/util.module',
	'util/util.service'
], function() {
///////////////////////////////////////

angular.module('util').factory('wikidataapi', ['util', '$q', function(util, $q) {

	var getEntityData = function(id, language) {
		// Special:EntityData does not always return current data, not even with "action=purge"
		return util.jsonpRequest('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + id + '&redirects=yes&props=sitelinks|descriptions|claims|datatype|aliases|labels&languages=' + language + '&callback=JSON_CALLBACK');
	}

	var getEntityTerms = function(entityIds, language) {
		var baseUrl = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&redirects=yes&props=descriptions%7Clabels&languages=' + language + '&callback=JSON_CALLBACK';
		var requests = [];

		for (var i = 0; i < entityIds.length; i += 50) {
			requests.push(util.jsonpRequest(baseUrl + '&ids=' + entityIds.slice(i,i+50).join('|')));
		}

		return $q.all(requests).then( function(responses) {
			var idTerms = {}
			angular.forEach(responses, function(response) {
				if ("entities" in response) {
					angular.forEach(response.entities, function(data,entityId) {
						var label = entityId;
						var desc = "";
						if ('labels' in data && language in data.labels) label = data.labels[language].value;
						if ('descriptions' in data && language in data.descriptions) desc = data.descriptions[language].value;
						idTerms[entityId] = { label: label, description: desc };
					});
				}
			});
			return idTerms;
		});
	};

	var getEntityLabels = function(entityIds, language) {
		var baseUrl = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&redirects=yes&props=labels&languages=' + language + '&callback=JSON_CALLBACK';
		var requests = [];

		for (var i = 0; i < entityIds.length; i += 50) {
			requests.push(util.jsonpRequest(baseUrl + '&ids=' + entityIds.slice(i,i+50).join('|')));
		}

		return $q.all(requests).then( function(responses) {
			var entityLabels = {}
			angular.forEach(responses, function(response) {
				if ("entities" in response) {
					angular.forEach(response.entities, function(data,entityId) {
						if ('labels' in data && language in data.labels) { 
							entityLabels[entityId] = data.labels[language].value;
						} else {
							entityLabels[entityId] = entityId;
						}
					});
				}
			});
			return entityLabels;
		});
	};

	var searchEntities = function(str, lang='en', limit=7) {
		var url = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&limit=' + String(limit) +  '&language='+ lang + '&uselang=' + lang + '&type=item&continue=0&search=' + str + '&callback=JSON_CALLBACK';
		return util.jsonpRequest(url).then(function(response){
			if (!response.search){
				return null;
			};
			return response.search;
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
	return {
		getEntityData: getEntityData,
		getEntityTerms: getEntityTerms,
		getEntityLabels: getEntityLabels,
		searchEntities: searchEntities,
		getImageData: getImageData
	};
}]);

return {}; }); // module definition end