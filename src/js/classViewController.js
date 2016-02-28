
var language = "en";

classBrowser.factory('ClassView', function($route, util, sparql) {
	var MAX_EXAMPLE_INSTANCES = 20;
	var MAX_DIRECT_SUBCLASSES = 20;

	var qid;
	return {
		MAX_EXAMPLE_INSTANCES: MAX_EXAMPLE_INSTANCES,
		MAX_DIRECT_SUBCLASSES: MAX_DIRECT_SUBCLASSES,

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
			var url = buildUrlForApiRequest(qid);
			return util.httpRequest(url);
		},

		getQid: function(){
			return qid;
		}
	};
})
.controller('ClassViewController',
	function($scope, $route, ClassView, Classes, Properties, jsonData, sparql){
		ClassView.updateQid();
		$scope.qid = ClassView.getQid();
		$scope.exampleInstances = null;
		$scope.exampleSubclasses = null;

		ClassView.getInstances().then(function(data) {
			$scope.exampleInstances = sparql.prepareInstanceQueryResult(data, "P31", ClassView.getQid(), ClassView.MAX_EXAMPLE_INSTANCES + 1, null);
		});

		ClassView.getClassData().then(function(data) {
			$scope.classData = parseClassDataFromJson(data, $scope.qid);
		});

		$scope.url = "http://www.wikidata.org/entity/" + $scope.qid;

		Classes.then(function(classes){
			Properties.then(function(props){
				$scope.relatedProperties = jsonData.parseRelatedProperties($scope.qid, classes, props);
			});
			ClassView.getSubclasses().then(function(data) {
				$scope.exampleSubclasses = sparql.prepareInstanceQueryResult(data, "P279", ClassView.getQid(), ClassView.MAX_DIRECT_SUBCLASSES + 1, classes);
			});
			$scope.directInstances = classes.getDirectInstanceCount($scope.qid);
			$scope.directSubclasses = classes.getDirectSubclassCount($scope.qid);
			$scope.allInstances = classes.getAllInstanceCount($scope.qid);
			$scope.allSubclasses = classes.getAllSubclassCount($scope.qid);

		});
	}
);



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

function buildUrlForApiRequest( itemID ) {
	return "https://www.wikidata.org/wiki/Special:EntityData/" + itemID + ".json";
}

