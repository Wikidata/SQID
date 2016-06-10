//////// Module Definition ////////////
define([
	'util/util.module',
	'jquery-ui'
], function() {
///////////////////////////////////////

angular.module('util').directive('ngSlider', function(){
	var SCALE_FACTOR = 1.005;
	var MULTIPLIER = 1000000;
	var scale = function(val){
		if (val > 0) {
			return Math.round((Math.log(val) / Math.log(SCALE_FACTOR))*MULTIPLIER);
		}
		else {
			return 0;
		}
	}
	
	var antiScale = function(val){
		if (val > 0) {
			return Math.round(Math.pow(SCALE_FACTOR, (val / MULTIPLIER)));
		}else{
			return 0;
		}
	}
	function link(scope, element, attrs){
		scope.$watchGroup(['startval', 'endval'], function(){
			element.slider({
				range: true,
				min: scale(parseInt(scope.begin)),
				max: scale(parseInt(scope.end)),
				values: [ scale(scope.startval), scale(scope.endval) ],
				slide: function( event, ui ) {
					scope.$parent.slider[parseInt(scope.index)].startVal = antiScale(ui.values[0]);
					scope.$parent.slider[parseInt(scope.index)].endVal = Math.min(antiScale(ui.values[1]), scope.end);
					scope.$parent.updateStatus();
					scope.$apply();
				}
			});
		});
	}
	
	return {
		scope:{
			begin: '=begin',
			end: '=end',
			index: '=index',
			startval: '=startval',
			endval: '=endval'
		},
		link: link
	};
});


return {}; }); // module definition end