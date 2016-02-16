
var language = "en";

function getClassData( qid ) {
	var ret = {
		label: "",
		description: "",
		image: "",
		aliases: ""
	}
	try {
		var url = buildUrlForApiRequest(qid);
	    var result = util.httpGet( url );
		var resultJson = JSON.parse(result);
		ret.label = resultJson.entities[qid].labels[language].value;
		ret.description = resultJson.entities[qid].descriptions[language].value;
		aliasesJson = resultJson.entities[qid].aliases[language];
		if (aliasesJson != undefined) {
			for (var entry in aliasesJson){
				if (entry == 0){
					ret.aliases = aliasesJson[entry].value;
				} else {
					ret.aliases = ret.aliases + " | " + aliasesJson[entry].value;
				}
			}
		}
		var imageJson = resultJson.entities[qid].claims.P18;

		if (imageJson == undefined) {
			ret.image = "http://commons.wikimedia.org/w/thumb.php?f=MA_Route_blank.svg&w=50";
		} else {
			imageJson = imageJson.pop();
			ret.image = "http://commons.wikimedia.org/w/thumb.php?f=" + (imageJson.mainsnak.datavalue.value).replace(" ","_") + "&w=200";
		}
	}
	catch (err) {
	}
	return ret;
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

function getExampleInstances (itemID) {
	instances = [];
	try {
		var limit = 9;
		var url = buildUrlForSparQLRequest(getQueryForInstances (itemID, limit));
		var result = util.httpGet( url );
		var length = 0;
		var instanceJson = JSON.parse(result).results.bindings;
		length = instanceJson.length;
		for (var i = 0; i < length; i++) {
			element = {label: parseLabelFromJson(instanceJson[i]), uri: parseUriFromJson(instanceJson[i])};
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

function getQueryForInstances ( itemID, limit ) {
	return "PREFIX%20wikibase%3A%20%3Chttp%3A%2F%2Fwikiba.se%2Fontology%23%3E%0APREFIX%20wd%3A%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E%20%0APREFIX%20wdt%3A%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F%3E%0APREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0A%0ASELECT%20%3Fp%20%3FpLabel%20WHERE%20{%0A%20%20%20%20%3Fp%20wdt%3AP31%20wd%3A" + itemID + "%20.%0A%20%20%20SERVICE%20wikibase%3Alabel%20{%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20.%0A%20%20%20}%0A%20}%20LIMIT%20" + limit;
}

function buildUrlForSparQLRequest (query) {
	return "https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + query;
}

function buildUrlForApiRequest( itemID ) {
	return "https://www.wikidata.org/wiki/Special:EntityData/" + itemID + ".json";
}

function getQueryForNumberRequest( itemID, propertyID ){
	return "PREFIX wikibase%3A <http%3A%2F%2Fwikiba.se%2Fontology%23>%0APREFIX wd%3A <http%3A%2F%2Fwww.wikidata.org%2Fentity%2F> %0APREFIX wdt%3A <http%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F>%0APREFIX rdfs%3A <http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23>%0APREFIX p%3A <http%3A%2F%2Fwww.wikidata.org%2Fprop%2F>%0APREFIX v%3A <http%3A%2F%2Fwww.wikidata.org%2Fprop%2Fstatement%2F>%0A%0ASELECT (count(*) as %3Fc)%0AWHERE {%0A    %3Fp wdt%3A" + propertyID + " wd%3A" + itemID + " .%0A}";
}