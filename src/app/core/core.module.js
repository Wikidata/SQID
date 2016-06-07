'use strict'; // indicate that code is executed in strict mode

define([ // module definition dependencies
	'ngAnimate', 
	'ngRoute',
	'jquery-ui',
	//'ngCookies',
	//'ngTranslate', // is (has to be?) loaded explicitly in main.js
	//'ngComplete',
	//'util/util',
	'ui-boostrap-tpls', // implicit bootstrap
	// 'i18n/i18n.module',
	
], function() {

$("[data-toggle=popover]").popover({html:true});

angular.module('core',[
	'ngAnimate', 'ngRoute', //'ngCookies',  
	'ui.bootstrap', 'pascalprecht.translate', //'angucomplete-alt', 
	//'i18n'//, 'utilities'//,'queryInterface'
])



	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {templateUrl: 'app/core/start.html'})
			.when('/browse', { templateUrl: 'app/browse/browse.html' })
			// .when('/datatypes', { templateUrl: 'views/datatypes.html' })
			.when('/about', { templateUrl: 'app/core/about.html' })
			// .when('/status', { templateUrl: 'views/status.html' })
			// .when('/view', { templateUrl: 'views/view.html' })
			// .when('/query', { templateUrl: 'views/queryview.html'})
			.otherwise({redirectTo: '/'});
	}])

	.filter('to_trusted', ['$sce', function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}])

	.directive('ngSlider', function(){
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
	})

	.controller('TypeSelectorController', function($scope, Arguments){
		Arguments.refreshArgs();
		var args = Arguments.getArgs();
		switch (args.type) {
			case "classes":
				$scope.firstActive = "active";
				$scope.secondActive = "";
				break;
			case "properties":
				$scope.firstActive = "";
				$scope.secondActive = "active";
				break;
			default:
				console.log("type: " + args.type + " is unknown");
				$scope.firstActive = "active";
				$scope.secondActive = "";
		}
	});

return {};}); // module definition end