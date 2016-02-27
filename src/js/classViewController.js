
var language = "en";


function httpRequest($http, $q, url){
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


classBrowser.factory('ClassView', function($http, $route, $q) {
	var qid;
	return {
		updateQid: function() {
			qid = ($route.current.params.id) ? ($route.current.params.id) : "Q5";
		},

		getInstances: function() {	
			var url = buildUrlForSparQLRequest(getQueryForPropertySubjects("P31", qid, 21));
			return httpRequest($http, $q, url);
		},

		getSubclasses: function() {	
			var url = buildUrlForSparQLRequest(getQueryForPropertySubjects("P279", qid, 21));
			return httpRequest($http, $q, url);
		},

		getClassData: function() {	
			var url = buildUrlForApiRequest(qid);
			return httpRequest($http, $q, url);
		},

		getQid: function(){
			return qid;
		}
	};
})
.controller('ClassViewController', function($scope,$route, ClassView, Classes, Properties){
	ClassView.updateQid();
	$scope.qid = ClassView.getQid();

	ClassView.getInstances().then(function(data) {
		$scope.exampleInstances = parseExampleInstances(data,getQueryForPropertySubjects("P31", ClassView.getQid(), 1000));
	});

	ClassView.getSubclasses().then(function(data) {
		$scope.exampleSubclasses = parseExampleInstances(data,getQueryForPropertySubjects("P279", ClassView.getQid(), 1000));
	});

	ClassView.getClassData().then(function(data) {
		$scope.classData = parseClassDataFromJson(data, $scope.qid);
	});
	$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;

	Classes.then(function(data){
		Properties.then(function(props){
			$scope.relatedProperties = util.parseRelatedProperties($scope.qid, data.getClasses(), props.getProperties());
		});
		$scope.classNumbers = util.parseClassNumbers($scope.qid, data.getClasses());
		//$scope.classNumbers = getNumberForClass($scope.qid);
	});
});



function parseClassDataFromJson( data, qid ){
	var ret = {
		label: "",
		description: "",
		image: "",
		aliases: ""
	};
	try {
		ret.label = data.entities[qid].labels[language].value;
		ret.description = data.entities[qid].descriptions[language].value;
		aliasesJson = data.entities[qid].aliases[language];
		if (aliasesJson != undefined) {
			for (var entry in aliasesJson){
				if (entry == 0){
					ret.aliases = aliasesJson[entry].value;
				} else {
					ret.aliases = ret.aliases + " | " + aliasesJson[entry].value;
				}
			}
		}
		var imageJson = data.entities[qid].claims.P18;
		if (imageJson == undefined) {
			ret.image = null;
		} else {
			imageJson = imageJson.pop();
			ret.image = "http://commons.wikimedia.org/w/thumb.php?f=" + (imageJson.mainsnak.datavalue.value).replace(" ","_") + "&w=260";
		}
	}
	catch (err) {
	}
	return ret;
}

function getPropertyLabel(data, pid) {
	return data[pid][util.JSON_LABEL];
}

function getNumberForClass(itemID) {
	var instanceOf = "P31";
	var subclassOf = "P279";
	return {instances: getNumber(itemID,instanceOf), subclasses: getNumber(itemID,subclassOf)};
}

function getNumber(itemID, propertyID) {
	var url = buildUrlForSparQLRequest(getQueryForNumberRequest(itemID, propertyID));
	var result = util.httpGet(url);
	var number = JSON.parse(result);
	return number.results.bindings[0].c.value;
}

function parseExampleInstances(data, continuationQuery) {
	instances = [];
	try {
		var instanceJson = data.results.bindings;
		for (var i = 0; i < instanceJson.length; i++) {
			if ( i < 20 ) {
				element = {label: parseLabelFromJson(instanceJson[i]), uri: parseUriFromJson(instanceJson[i])};
			} else {
				element = {label: "... further results", uri: "https://query.wikidata.org/#" + continuationQuery};
			}
			instances.push(element);
		}
	}
	catch (err) {
		//nothing to do here
	}
	return instances;
}

function parseLabelFromJson ( json ) {
	return json.pLabel.value;
}

function parseUriFromJson ( instance ) {
	return instance.p.value;
}

function getQueryForPropertySubjects ( propertyId, objectId, limit ) {
	return encodeURIComponent(
"PREFIX wikibase: <http://wikiba.se/ontology#> \n\
 PREFIX wdt: <http://www.wikidata.org/prop/direct/> \n\
 PREFIX wd: <http://www.wikidata.org/entity/> \n\
 SELECT $p $pLabel \n\
 WHERE { \n\
   $p wdt:" + propertyId + " wd:" + objectId + " . \n\
   SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" . } \n\
 } LIMIT " + limit
	);
}

function buildUrlForSparQLRequest (query) {
	return "https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + query;
}

function buildUrlForApiRequest( itemID ) {
	return "https://www.wikidata.org/wiki/Special:EntityData/" + itemID + ".json";
}

function getQueryForNumberRequest( itemID, propertyID ){
	return encodeURIComponent(
"PREFIX wdt: <http://www.wikidata.org/prop/direct/> \
 PREFIX wd: <http://www.wikidata.org/entity/> \
 SELECT (count(*) as $c) WHERE { $p wdt:" + propertyID + " wd:" + itemID + " . }"
	);
}
