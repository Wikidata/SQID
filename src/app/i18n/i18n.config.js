define([ // module definition dependencies
	'i18n/i18n.module',
	'i18n/i18n.service',
	'i18n/translate.config'
], function() {

angular.module('i18n').run(['$rootScope', 'i18n' , function($rootScope, i18n) {

	// watch the url for lang parameter settings
	$rootScope.$on('$routeChangeStart', function(e, next, current) {
		if(next.params.lang !== undefined) {
			i18n.setLanguage(next.params.lang);	
		}
	});
}]);

return {};}); // module definition end