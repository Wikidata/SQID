define([ // module definition dependencies
	'i18n/i18n.module'
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
}]).factory();


return {};}); // module definition end