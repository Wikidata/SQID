//////// Module Definition ////////////
define([
	'app/app', // pulls angular, ngroute and utilties
	//'ngTranslate' // is loaded explicitly in main.js
], function() {
///////////////////////////////////////

angular.module('classBrowserApp').config(['$translateProvider', function ($translateProvider) {

	$translateProvider
		.useStaticFilesLoader({ prefix: 'lang/', suffix: '.json' })
		.useLocalStorage()
		.fallbackLanguage('en')
		//.preferredLanguage('en')
		.registerAvailableLanguageKeys(  // define existing
			['en', 'de', 'nb'], {		// languages and aliases
				'en_*': 'en', 'en-*': 'en',
				'de_*': 'de', 'de-*': 'de',
				'nb_*': 'nb', 'nb-*': 'nb'
		}).determinePreferredLanguage()
// 			.useSanitizeValueStrategy('escape') // using this makes it impossible to use HTML (links, tooltips, etc.) in variable replacements
		;
}]).factory();

return {};}); //  module definition end