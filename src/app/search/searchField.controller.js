//////// Module Definition ////////////
define([
	'search/search.module',
	'util/util.service',
	'i18n/i18n.service',
	'i18n/translate.config'
], function() {
///////////////////////////////////////

angular.module('search').controller('searchField', [
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
				suggestions.push({name: data[i].label + alias, idName: data[i].id, id: String(i)});
			}
			return {data: suggestions};
		});
		return promise;
	};
	$scope.searchEntity= function () {
		if ($scope.selectedEntity){
			$window.location.href = '/#/view?id=' + $scope.selectedEntity.originalObject.idName + '&lang=' + lang;
		}
	};

	var updateLanguage = function(){
		lang = i18n.getLanguage();
	}

  }]);

return {}; }); // module definition end
