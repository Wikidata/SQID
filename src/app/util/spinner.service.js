//////// Module Definition ////////////
define([
	'require',
	'util/util.module',
	'spin'
], function(require) {
///////////////////////////////////////


angular.module('util').factory('spinner', function() {
	var opts = {
		lines: 15, // The number of lines to draw
		length: 13, // The length of each line
		width: 5, // The line thickness
		radius: 2, // The radius of the inner circle
		scale: 1.25, // Scales overall size of the spinner
		corners: 1, // Corner roundness (0..1)
		color: ['#006698', '#339966', '#900', '#339966'], //'#000', // #rgb or #rrggbb or array of colors
		opacity: 0.1, // Opacity of the lines
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		speed: 1, // Rounds per second
		trail: 56, // Afterglow percentage
		fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		className: 'spinner', // The CSS class to assign to the spinner
		top: '50%', // Top position relative to parent
		left: '50%', // Left position relative to parent
		shadow: true, // Whether to render a shadow
		hwaccel: true, // Whether to use hardware acceleration
		position: 'absolute' // Element positioning
	}
	return function(target) {
		var Spinner = require('spin');
		return new Spinner(opts).spin(target);
	};
});


return {}; }); // module definition end