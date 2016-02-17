'use strict'; // indicate that code is executed strict

// namespace to avoid huge amount of global variables
var util = {

  JSON_LABEL: "l",
  JSON_INSTANCES: "i",
  JSON_SUBCLASSES: "s",
  JSON_RELATED_PROPERTIES: "r",
  TABLE_SIZE: 10,
  PAGE_SELECTOR_SIZE: 2,


  httpGet: function(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.setRequestHeader("Accept","text/csv; charset=utf-8");
    xmlHttp.send( null );
    return xmlHttp.responseText;
  },

  getQueryString: function (field) {
    var href = window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
  }

};

angular.module('classBrowserApp', ['ngAnimate', 'ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {templateUrl: 'views/start.html'})
      .when('/browse', { templateUrl: 'views/browseData.html' })
      .when('/datatypes', { templateUrl: 'views/datatypes.html' })
      .when('/about', { templateUrl: 'views/about.html' })
      .otherwise({redirectTo: '/'});
  })
  // .directive('page-selection', function(){
  //   // var gen = function()
  //   return {
  //     restrict: 'A',
  //     scope: ,
  //     template: gen(),  
  //   }
  // })
  .factory('Classes', function($http) {
    
    var promise;
	  var classes; 
    var args = {}; 
    var pageSelectorData = {};
    var classesArray = [];
    var tableContent = [];

    var refreshArgs = function(){
      args = {
        from: (util.getQueryString("from")) ? parseInt(util.getQueryString("from")) : 0,
        to: (util.getQueryString("to")) ? parseInt(util.getQueryString("to")) : 10,
        type: (util.getQueryString("type")) ? util.getQueryString("type") : "classes"
      }
    }

    var initArray = function(json){
      var ret = []
      for (var entry in json) {
          ret.push(entry);
        }
      console.log("size:" + ret.length);
      return ret;
    }

    var getEntityFromId = function(id){
      return {
        id: id,
        label: classes[id][util.JSON_LABEL],
        numberOfInstances: classes[id][util.JSON_INSTANCES],
        numberOfSubclasses: classes[id][util.JSON_SUBCLASSES],
        relatedProperties: classes[id][util.JSON_RELATED_PROPERTIES]
      }
    }

    var refreshTableContent = function(){
      tableContent = [];
      for (var i = args.from; i < args.to; i++){
        tableContent.push(getEntityFromId(classesArray[i]));
      }
    }

    var refreshPageSelectorData = function(){
      var from;
      var to;
      var active = Math.floor(args.from / util.TABLE_SIZE) + 1;
      
      if ((2*2 +1) * util.TABLE_SIZE >= classesArray.length){
        if (util.TABLE_SIZE >= classesArray.length){
          pageSelectorData = {
            enabled: false
          }
          return;
        }else{
          to = Math.floor(classesArray.length / util.TABLE_SIZE);
          if ((classesArray.length % util.TABLE_SIZE) > 0){
            to++;
          }
          from = 1;
        }
      }else{
        if (active > 2){
          if ((2*util.TABLE_SIZE) > (classesArray.length - args.from)){
            from = active - 2;
          }else{ // there are not enough succesors
            // assertion: there are enough predecessors
            var offset = Math.floor((classesArray.length - args.from) / util.TABLE_SIZE) - 1; // number of following pages
            if (((classesArray.length - args.from) % util.TABLE_SIZE) > 0){
              offset++;
            }
            from = active - (2-offset) - 2
            to = active + offset;
          }
        }else{ // active lower than or equal PAGE_SELECTOR_SIZE
          from = 1;
          to = 2*2+1;
        }
      }
      pageSelectorData = {
        start: from,
        end: to,
        current: active,
        enabled: true
      }
    }

    if (!promise){
      promise = $http.get("data/classes.json").then(function(response){
        classes = response.data;
        args = refreshArgs();
        classesArray = initArray(classes);

        return {
          classesHeader: ["ID","Label","Instances","Subclasses"],

          getContent: function(){
            console.log("CALL: getContent()");
            return tableContent;
          },
          getPageSelectorData: function(){
            conolse.log("CALL: getPageSelectorData()");
            return pageSelectorData;
          },
          refresh: function(){
            console.log("CALL: refresh()")
            refreshArgs();
            refreshPageSelectorData();
            refreshTableContent();
          }
        };

      });
    }

    return promise;
  })
  .controller('MyController', function($scope, Classes){
    Classes.then(function(data){
      $scope.classesForClasses = data;
      $scope.classesForClasses.refresh();
    });
  });
