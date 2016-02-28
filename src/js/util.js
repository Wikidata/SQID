
angular.module('utilities', [])
.factory('jsonData', function() {

	var JSON_LABEL = "l";
	var JSON_INSTANCES = "i";
	var JSON_SUBCLASSES = "s";
	var JSON_RELATED_PROPERTIES = "r";

	var parseClassNumbers = function (qid, json){
		var numbers = {instances : "", subclasses: ""};
		try {
			numbers.instances = json[qid][JSON_INSTANCES];
			numbers.subclasses = json[qid][JSON_SUBCLASSES];
		} catch(e){}
		return numbers;
	};
  
	var parseLabel = function (data, id){
		return data[id][JSON_LABEL];
	};
  
	var parseRelatedProperties = function(qid, classesJson, propertyJson){
		var ret = [];
		try {
			var relProps = classesJson[qid][JSON_RELATED_PROPERTIES];
			var relPropsList = [];
			for (var relProp in relProps) relPropsList.push([relProp, relProps[relProp]]);

			relPropsList.sort(function(a, b) {
				a = a[1];
				b = b[1];
				return a < b ? 1 : (a > b ? -1 : 0);
			});

			for (var i = 0; i < relPropsList.length; i++) {
				if (relPropsList[i][1] < 15) break;
				var propId = relPropsList[i][0];
				var resultObj = {label : parseLabel(propertyJson, propId) , link: "#/propertyview?id=" + propId};
				ret.push(resultObj);
			}
		}
		catch (e){}

		return ret;
	};
	
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
		PAGE_SELECTOR_SIZE: 2,

		parseClassNumbers: parseClassNumbers,
		parseLabel: parseLabel,
		parseRelatedProperties: parseRelatedProperties
	};

});

