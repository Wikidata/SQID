define([ // module definition dependencies
	'i18n/i18n.module',
	'ngCookies',				//
	'ngTranslate-core',			// cannot for the life of me sort out the 
	'ngTranslate-loader',		// dependency in a way that the bundle will
	'ngTranslate-storage-cook',	// execute in the right order when optimized
	'ngTranslate-storage-loc'	// unless loading in this order explicitly
], function() {


angular.module('i18n').config(['$translateProvider', function ($translateProvider) {

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
		//.useSanitizeValueStrategy('escape') // using this makes it impossible to use HTML (links, tooltips, etc.) in variable replacements
		;
}]);

return {};}); // module definition end