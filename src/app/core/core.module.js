'use strict'; // indicate that code is executed in strict mode

define([ // module definition dependencies
	'ngAnimate', 
	'ngRoute',
	'jquery-ui',
	'ui-boostrap-tpls' // implicit bootstrap
], function() {


angular.module('core',[
	'ngAnimate', 'ngRoute', //'ngCookies',  
	'ui.bootstrap', 'pascalprecht.translate', //'angucomplete-alt', 
	//'i18n'//, 'utilities'//,'queryInterface'
])

	////////////
	/// TODO /////////////////////////////////////////////
	// following components should go somewhere else ? //

	.filter('to_trusted', ['$sce', function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}]);

	


return {};}); // module definition end