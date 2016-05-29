//////// Module Definition ////////////
define([
	'app/app', // pulls angular, ngroute and utilties
], function() {
///////////////////////////////////////

angular.module('classBrowserApp').config(['$translateProvider', function ($translateProvider) {

	$translateProvider
		.useStaticFilesLoader({ prefix: 'lang/', suffix: '.json' })
		.useLocalStorage()
		.fallbackLanguage('en')
		.preferredLanguage('en')
// 			.useSanitizeValueStrategy('escape') // using this makes it impossible to use HTML (links, tooltips, etc.) in variable replacements
		;
}]).factory();

return {};}); //  module definition end