//////// Module Definition ////////////
define([
	'entitySearch/entitySearch.module',
	'util/util.service',
	'i18n/i18n.service',
	'i18n/translate.config'
], function() {
///////////////////////////////////////

angular.module('entitySearch').controller('entitySearchField', [
'$scope', '$translate', '$window', 'wikidataapi', 'i18n', 'util',
function($scope, $translate, $window, wikidataapi, i18n, util){
	$scope.selectedEntity = "";
	var lang = i18n.getLanguage();

	$scope.localSearch = function(str, timeoutPromise){
		updateLanguage();
		var promise = wikidataapi.searchEntities(str, lang).then(function(data){
			suggestions = [];
			for (var i= 0; i < data.length; i++){
				var alias = '';
				if (data[i].aliases){
					alias = ' (' + data[i].aliases[0] + ')';
				}
				console.log(data[i].id);
				suggestions.push({name: data[i].label, idName: data[i].id, id: String(i), description: alias + ' ' + (data[i].description ? data[i].description : '')});
			}
			return {data: suggestions};
		});
		return promise;
	};
	$scope.searchEntity= function () {
		if ($scope.selectedEntity){
			$window.location.href = i18n.getEntityUrl($scope.selectedEntity.originalObject.idName);
		}
	};

	var updateLanguage = function(){
		lang = i18n.getLanguage();
	}

  }]);

return {}; }); // module definition end
