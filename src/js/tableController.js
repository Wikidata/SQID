classBrowser.controller('TableController', function($scope, Arguments, Classes, Properties, jsonData){

    var paginationControl = {

      pageSelectorData: {},

      refreshPageSelectorData: function(args, idArray){
        var from;
        var to;
        var active = Math.floor(args.from / jsonData.TABLE_SIZE) + 1;
        var prev;
        var next;

        if ((2*2 +1) * jsonData.TABLE_SIZE >= idArray.length){
          if (jsonData.TABLE_SIZE >= idArray.length){
            pageSelectorData = {
              enabled: false
            }
            return;
          }else{
            to = Math.floor(idArray.length / jsonData.TABLE_SIZE);
            if ((idArray.length % jsonData.TABLE_SIZE) > 0){
              to++;
            }
            from = 1;

          }
        }else{
          if (active > 2){
            if ((2*jsonData.TABLE_SIZE) < (idArray.length - args.from)){
              from = active - 2;
              to = from + 2*2;
            }else{ // there are not enough succesors
              // assertion: there are enough predecessors
              var offset = Math.floor((idArray.length - args.from) / jsonData.TABLE_SIZE) - 1; // number of following pages
              if (((idArray.length - args.from) % jsonData.TABLE_SIZE) > 0){
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
          enabled: true,
          prevEnabled: (from != active),
          nextEnabled: (to != active)
        }
      },

      setPageSelectorScopes: function(){
        var array = [];
        if (pageSelectorData.enabled){
          for (var i = pageSelectorData.start; i <= pageSelectorData.end; i++){
            if (i == pageSelectorData.current){
              array.push([i, "active"])
            }else{
              array.push([i, ""]);
            }
          }
        }
        $scope.pagination = array;
        if (pageSelectorData.prevEnabled){
          $scope.prevEnabled = "enabled";
          $scope.prevLink= '#/browse?from=' 
            + ($scope.args.from - jsonData.TABLE_SIZE)
            + '&to=' + ($scope.args.to - jsonData.TABLE_SIZE)
            + '&type=' + $scope.args.type;
          $scope.prevClass= "";
        }else{
          $scope.prevEnabled = "disabled";
          $scope.prevLink = '';
          $scope.prevClass= "not-active";
        }
        if (pageSelectorData.nextEnabled){
          $scope.nextEnabled = "enabled";
          $scope.nextLink= '#/browse?from=' 
            + ($scope.args.from + jsonData.TABLE_SIZE)
            + '&to=' + ($scope.args.to + jsonData.TABLE_SIZE)
            + '&type=' + $scope.args.type;
          $scope.nextClass="";
        }else{
          $scope.nextEnabled = "disabled";
          $scope.nextLink = '';
          $scope.nextClass = "not-active";  
        }
      }

    }

    var tableContent = [];

    var initArray = function(json, filterfunc){
      var ret = []
      for (var entry in json) {
          if (filterfunc(json[entry])) {
              ret.push(entry);
          }
      }
      return ret;
    };

    var getClassFromId = function(id, data){
      return ['<a href="#/classview?id=Q' + id + '">Q' + id + '</a>', data.getLabel(id),  data.getAllInstanceCount(id).toString(), data.getAllSubclassCount(id).toString()];
    };
    
    var getPropertyFromId = function(id, data){
      return ['<a href="#/propertyview?id=P' + id + '">P' + id + '</a>', data.getLabel(id), data.getStatementCount(id).toString(), data.getQualifierCount(id).toString(), data.getReferenceCount(id).toString()];
    };
    
    var refreshTableContent = function(args, idArray, content, entityConstructor){
      tableContent = [];
      for (var i = args.from; i < Math.min(args.to, (idArray.length )); i++){
        tableContent.push(entityConstructor(idArray[i], content));
      }
    };
    
    var refresh = function(args, content, idArray, entityConstructor){
      paginationControl.refreshPageSelectorData(args, idArray);
      refreshTableContent(args, idArray, content, entityConstructor);
    };
    
    var applyFilter = function(entry){
      if (!$scope.filterLabels){
        return true;
      }
      if (($scope.filterLabels == "") ) {
        return true;
      }
      if (!entry[jsonData.JSON_LABEL]) {
        return false;
      }
      if (entry[jsonData.JSON_LABEL].indexOf($scope.filterLabels) > -1) {
        return true;
      }else{
        return false;
      }
    }

    var initSlider = function(sliderData){
      //result = [];
      //for 
      //resu.add()
    }

    var updateTable = function(){
      if (args.type == "classes") {
        Classes.then(function(data){
          var classesArray = initArray(data.getClasses(), applyFilter);
          // todo: apply filter
          refresh(args, data, classesArray, getClassFromId);
          $scope.content = tableContent;
          $scope.tableHeader = data.classesHeader;
          paginationControl.setPageSelectorScopes();
          $scope.entityCount = classesArray.length;
          $scope.slider = [
            {name: "number of instances", from: 0, to: 4000000, startVal: 0, endVal: 100},
            {name: "number of subclasses", from: 0, to: 10000, startVal: 0, endVal: 100}];
        });
      }
      if (args.type == "properties") {
          Properties.then(function(data){
          var propertiesArray = initArray(data.getProperties(), applyFilter);
          refresh(args, data, propertiesArray, getPropertyFromId);
          $scope.content = tableContent;
          $scope.tableHeader = data.propertiesHeader;
          paginationControl.setPageSelectorScopes();
          $scope.entityCount = propertiesArray.length;
          $scope.slider = [
            {name: "uses in statements", from: 0, to: 20000000, startVal: 0, endVal: 100},
            {name: "uses in qualifiers", from: 0, to: 100000, startVal: 0, endVal: 100},
            {name: "uses in references", from: 0, to: 100000, startVal: 0, endVal: 100}];
          });
      }
      
    }
    $scope.slider = []; // TODO: init slider in refreshArgs()
    // execution part
    Arguments.refreshArgs();
    var args = Arguments.getArgs();
    $scope.tableSize = jsonData.TABLE_SIZE;
    $scope.args=args;
    $scope.filterdata;
    if (!$scope.filterText) {$scope.filterText = ""};
    updateTable();
    //$scope.searchfilter = angular.copy(searchfilter);
    $scope.searchFilter = function(){
      updateTable();
    }
    
  });
