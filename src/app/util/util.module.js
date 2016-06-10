//////// Module Definition ////////////
define([
	'angular'
], function() {
///////////////////////////////////////


angular.module('util', [
	// i18n should be here since the i18n service is injected
	// into some of util's components
	// however i18n.module already depends on util.module so 
	// that'd give a circular dependency. luckily the DI works 
	// also without stating this dependency in this case
]);

return {}; }); // module definition end