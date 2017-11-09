//////// Module Definition ////////////
define([
	'view/view.module',
	'view/view.service',
	'ngRoute',
	'i18n/translate.config',
	'util/sparql.service',
	'util/util.service',
	'util/htmlCache.service',
	'util/sqidStatementTable.directive',
	'util/sqidCompile.directive',
	'util/map.directive',
	'proposals/proposals.service',
	'proposals/primarySources.service',
	'rules/rules.service',
	'data/properties.service',
	'data/classes.service',
	'oauth/oauth.service',
	'i18n/i18n.service'
], function() {
///////////////////////////////////////

/* eslint angular/di: 0 */
angular.module('view').controller('ViewController', [
    '$scope', '$route', '$sce', '$translate', 'view', 'classes', 'properties', 'oauth', 'sparql', 'util', 'i18n', 'htmlCache', 'proposals', 'primarySources', 'rules', '$q',
    function($scope, $route, $sce, $translate, View, Classes, Properties, oauth, sparql, util, i18n, htmlCache, proposals, primarySources, rules, $q){
	var MAX_EXAMPLE_INSTANCES = 20;
	var MAX_DIRECT_SUBCLASSES = 10;
	var MAX_PROP_SUBJECTS = 10;
	var MAX_PROP_VALUES = 20;
	var RELATED_PROPERTIES_THRESHOLD = 5;

	i18n.checkCacheSize();

	htmlCache.reset();
	$scope.getCachedHtml = htmlCache.getValue;

	$scope.lang = i18n.getLanguage();

	$scope.translations = {};

	$translate(['SEC_CLASSIFICATION.INSTANCE_SUBCLASSES_HINT', 'SEC_CLASSIFICATION.SUBCLASS_SUBCLASSES_HINT', 'SEC_CLASSIFICATION.ALL_SUBCLASSES_HINT', 'TYPICAL_PROPS.HINT_CLASS', 'TYPICAL_PROPS.HINT_PROP', 'SEC_PROP_USE.ENTITIES_HINT', 'SEC_PROP_USE.VALUES_HINT', 'SEC_PROP_USE.STATEMENTS_HINT', 'SEC_PROP_USE.QUALIFIERS_HINT', 'MODALS.EMPTY_FIELDS_ERROR', 'MODALS.EXECUTION_ERROR', 'MODALS.EXECUTION_SUCCESSFUL']).then( function(translations) {
		$scope.translations['SUBCLASS_SUBCLASSES_HINT'] = translations['SEC_CLASSIFICATION.SUBCLASS_SUBCLASSES_HINT'];
		$scope.translations['INSTANCE_SUBCLASSES_HINT'] = translations['SEC_CLASSIFICATION.INSTANCE_SUBCLASSES_HINT'];
		$scope.translations['ALL_SUBCLASSES_HINT'] = translations['SEC_CLASSIFICATION.ALL_SUBCLASSES_HINT'];
		$scope.translations['TYPICAL_PROPS_HINT_CLASS'] = translations['TYPICAL_PROPS.HINT_CLASS'];
		$scope.translations['TYPICAL_PROPS_HINT_PROP'] = translations['TYPICAL_PROPS.HINT_PROP'];
		$scope.translations['PROP_ENTITIES_HINT'] = translations['SEC_PROP_USE.ENTITIES_HINT'];
		$scope.translations['PROP_VALUES_HINT'] = translations['SEC_PROP_USE.VALUES_HINT'];
		$scope.translations['PROP_STATEMENTS_HINT'] = translations['SEC_PROP_USE.STATEMENTS_HINT'];
		$scope.translations['PROP_QUALIFIERS_HINT'] = translations['SEC_PROP_USE.QUALIFIERS_HINT'];
		$scope.translations['MODALS_EMPTY_FIELDS_ERROR'] = translations['MODALS.EMPTY_FIELDS_ERROR'];
		$scope.translations['MODALS_EXECUTION_ERROR'] = translations['MODALS.EXECUTION_ERROR'];
		$scope.translations['MODALS_EXECUTION_SUCCESSFUL'] = translations['MODALS.EXECUTION_SUCCESSFUL'];
	});

	$scope.classes = null;
	$scope.properties = null;
	$scope.entityData = null;
	$scope.banner = null;
	$scope.homepage = null;
	$scope.urlWikipedia = null;
	$scope.images = [];
	$scope.entityInData = null;
	$scope.richDescription = null;

	$scope.exampleInstances = null;
	$scope.exampleSubclasses = null;
	$scope.superClassCount = -1;
	$scope.instanceClassCount = -1;

	$scope.examplePropertyItems = null;
	$scope.examplePropertyValues = null;
	$scope.superPropertyCount = -1;

	$scope.directInstances = 0;
	$scope.directSubclasses = 0;
	$scope.allInstances = 0;
	$scope.allSubclasses = 0;
	$scope.nonemptySubclasses = null;
	$scope.propertyStatementCount = 0;
	$scope.propertyAverageStatements = 0;
	$scope.propertyQualifierCount = 0;
	$scope.propertyReferenceCount = 0;
	$scope.propertyDatatype = null;

	$scope.modalResponse = null;
	$scope.modalResponseClass = null;

	$scope.hasEditRights = false;

	$scope.alertText = '';

	$scope.proposalsWatcher = null;
	$scope.proposalsPromises = [];

	oauth.userinfo().then(function(data){
		if (data){
			if (!View.hasEditRights()){
				View.clearEntityDataCache();
			}
			View.setEditRights(true);
			$scope.hasEditRights = true;
		}else{
			if (View.hasEditRights){
				View.clearEntityDataCache();
			}
			$scope.hasEditRights = false;
			View.setEditRights(false);
		}
	});

	var refreshContent = function(useCache){
		var func = useCache ? View.getEntityData : View.getEntityDataUncached;
		func().then(function(data) {
			$scope.entityData = data;
			$scope.images = View.getImages(data.statements);
			$scope.banner = View.getBanner(data.statements);
			$scope.homepage = View.getHomepage(data.statements);
			$scope.urlWikipedia = View.getUrlWikipedia(data.sitelinks);
			$scope.richDescription = $sce.trustAsHtml(i18n.autoLinkText($scope.entityData.description));
			data.waitForPropertyLabels().then( function() {
				$scope.instanceOfUrl = i18n.getEntityUrl("P31");
				$scope.instanceOfLabel = i18n.getPropertyLabel("P31");
				$scope.subclassOfUrl = i18n.getEntityUrl("P279");
				$scope.subclassOfLabel = i18n.getPropertyLabel("P279");
				$scope.subpropertyOfUrl = i18n.getEntityUrl("P1647");
				$scope.subpropertyOfLabel = i18n.getPropertyLabel("P1647");
			});

			Classes.then(function(classes){
				View.getValueList(data, 'P31', classes).then( function(instanceClasses) {
					$scope.instanceClassCount = instanceClasses.length;
					$scope.instanceClassesHtml = View.getValueListTrustedHtml(instanceClasses, false);
				});
				if ($scope.isItem) {
					View.getValueList(data, 'P279', classes).then( function(superClasses) {
						$scope.superClassCount = superClasses.length;
						$scope.superClassesHtml = View.getValueListTrustedHtml(superClasses, false);
						$scope.superClassesHtmlWithCounts = View.getValueListTrustedHtml(superClasses, true);
					});
				}
			});
        });
    };

	var createAlert = function(message){
		$scope.alertText = message;
		$('#alert-message').css('display', 'block');
		window.setTimeout(function(){
			$('#alert-message').css('display', 'none');
		}, 2000);
	};

	primarySources.setRefreshFunction(refreshContent);
	primarySources.setAlertFunction(createAlert);

	View.updateId().then(function() {
		$scope.id = View.getId();
		refreshContent(false);

		return View.getEntityInlinks();
	}).then(function(data) {
		$scope.entityInData = data;

		var numId = $scope.id.substring(1);
		$scope.isItem = ( $scope.id.substring(0,1) != 'P' );

		// unregister old proposal watcher
		if (angular.isFunction($scope.proposalsWatcher)) {
			$scope.proposalsWatcher();
		}

		// register a watcher that updates proposals when statements and inlinks arrive
		$scope.proposalsWatcher = $scope.$watchGroup([
			'entityData',
			'entityInData'
		], proposals.getEntityDataListener($scope.id));

		Properties.then(function(properties){
			if (!$scope.isItem) {
				View.getEntityData().then(function(data) {
					View.getValueList(data, 'P1647', properties).then( function(superProperties) {
						$scope.superPropertyCount = superProperties.length;
						$scope.superPropertiesHtml = View.getValueListTrustedHtml(superProperties, false);
					});
				});

				View.formatPropertyMap(properties.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD).then( function(formattedProperties) {
					$scope.relatedProperties = formattedProperties;
				});

				$scope.propertyItemCount = properties.getItemCount(numId);
				$scope.propertyStatementCount = properties.getStatementCount(numId);
				$scope.propertyAverageStatements = Math.round($scope.propertyStatementCount/$scope.propertyItemCount*100)/100;
				$scope.propertyQualifierCount = properties.getQualifierCount(numId);
				$scope.propertyReferenceCount = properties.getReferenceCount(numId);
				$scope.propertyDatatype = properties.getDatatype(numId);

				View.formatPropertyMap(properties.getQualifiers(numId), null).then( function(formattedProperties) {
					$scope.propertyQualifiers = formattedProperties;
				});

				if ($scope.propertyItemCount > 0) {
					sparql.getPropertySubjects($scope.id, null, MAX_PROP_SUBJECTS + 1).then(function(result) {
						$scope.examplePropertyItems = result;
					});
				}
				if ($scope.propertyDatatype == 'WikibaseItem' || $scope.propertyDatatype == 'WikibaseProperty') {
					sparql.getPropertyObjects(null, $scope.id, MAX_PROP_VALUES + 1).then(function(result) {
						$scope.examplePropertyValues = result;
					});
				}
			}
		});
		$scope.url = 'https://www.wikidata.org/wiki/' +
			( $scope.isItem ? '' : 'Property:' ) +
			$scope.id +
			( i18n.fixedLanguage() ? ('?uselang=' + i18n.getLanguage()) : '' );
		$scope.urlReasonator = 'https://tools.wmflabs.org/reasonator/?q=' + $scope.id +
			( i18n.fixedLanguage() ? ('?lang=' + i18n.getLanguage()) : '' );
		Classes.then(function(classes){
			if ($scope.isItem) {
				View.formatPropertyMap(classes.getRelatedProperties(numId), RELATED_PROPERTIES_THRESHOLD).then( function(formattedProperties) {
					$scope.relatedProperties = formattedProperties;
				});
				$scope.directInstances = classes.getDirectInstanceCount(numId);
				$scope.directSubclasses = classes.getDirectSubclassCount(numId);
				$scope.allInstances = classes.getAllInstanceCount(numId);
				$scope.allSubclasses = classes.getAllSubclassCount(numId);
				$translate('SEC_INSTANCES.ALL_INSTANCES_HINT', { subclassCount : $scope.allSubclasses } ).then( function(result) {
					$scope.translations['ALL_INSTANCES_HINT'] = result;
				});

				View.formatNonemptySubclasses(numId, classes, classes.getAllInstanceCount).then( function(subclasses) {
					$scope.instanceSubclasses = subclasses;
					View.formatNonemptySubclasses(numId, classes, classes.getAllSubclassCount).then( function(subclasses) {
						$scope.subclassSubclasses = subclasses;
						if ($scope.instanceSubclasses.length > 0) {
							$scope.subclassActiveTab = 0;
						} else if ($scope.subclassSubclasses.length > 0) {
							$scope.subclassActiveTab = 1;
						} else {
							$scope.subclassActiveTab = 2;
						}
					});
				});

				if ($scope.directInstances > 0) {
					sparql.getPropertySubjects("P31", $scope.id, MAX_EXAMPLE_INSTANCES + 1).then(function(result) {
						$scope.exampleInstances = result;
					});
				}
				if ($scope.directSubclasses > 0) {
					sparql.getPropertySubjects("P279", $scope.id, MAX_DIRECT_SUBCLASSES + 1).then(function(result) {
						$scope.exampleSubclasses = result;
					});
				}
			}
		});
		$scope.editLabel = function(){
			var modalId = '#editLabelModal';
			var newLabel = $scope.newLabel;
			var lang = i18n.getLanguage();
			var id = $scope.id;
			if (newLabel){
				var response = oauth.setLabel(id, newLabel, lang);
				response.then(function(data){
					if (data.data.error == "OK"){
						// $scope.modalResponse = $scope.translations['MODALS_EXECUTION_SUCCESSFUL'];
						// $scope.modalResponseClass = "text-success";
						$(modalId).modal('hide');
						$scope.closeModal();
						refreshContent(false);
					}else{

						$scope.modalResponse = $scope.translations['MODALS_EXECUTION_ERROR'] +
							( (data.data.error) ? ("</br>" + String(data.data.error)) : "");
						$scope.modalResponseClass = "text-danger";
					}
				});
			}else{
				$scope.modalResponse = $scope.translations['MODALS_EMPTY_FIELDS_ERROR'];
				$scope.modalResponseClass = "text-danger";
			}
		}

	});
	$scope.closeModal = function(){
		$scope.modalResponse = null;
		$scope.modalResponseClass = null;
	}
}]);

return {};}); // module definition end
