classBrowser.controller('TableController', function($scope, Arguments, Classes, Properties){

    // definition part
  
    var pageSelectorData = {};
    var tableContent = [];

    var initArray = function(json){
      var ret = []
      for (var entry in json) {
          if (($scope.filterText == "") || (entry.indexOf($scope.filterText) > -1)) {
            ret.push(entry);
          }
        }
      return ret;
    };

    var getClassFromId = function(id, data){
      return ['<a href="#/classview?id=' + id + '">' + id + '</a>', data[id][util.JSON_LABEL],  data[id][util.JSON_INSTANCES].toString(), data[id][util.JSON_SUBCLASSES].toString()];
    };
    
    var getPropertyFromId = function(id, data){
      return ['<a href="#/propertyview?id=' + id + '">' + id + '</a>', data[id][util.JSON_LABEL], data[id][util.JSON_USES_IN_STATEMENTS].toString(), data[id][util.JSON_USES_IN_QUALIFIERS].toString(), data[id][util.JSON_USES_IN_REFERENCES].toString()];
    };
    
    var refreshTableContent = function(args, idArray, content, entityConstructor){
      tableContent = [];
      for (var i = args.from; i < Math.min(args.to, (idArray.length )); i++){
        tableContent.push(entityConstructor(idArray[i], content));
      }
    };

    var refreshPageSelectorData = function(args, idArray){
      var from;
      var to;
      var active = Math.floor(args.from / util.TABLE_SIZE) + 1;
      var prev;
      var next;

      if ((2*2 +1) * util.TABLE_SIZE >= idArray.length){
        if (util.TABLE_SIZE >= idArray.length){
          pageSelectorData = {
            enabled: false
          }
          return;
        }else{
          to = Math.floor(idArray.length / util.TABLE_SIZE);
          if ((idArray.length % util.TABLE_SIZE) > 0){
            to++;
          }
          from = 1;

        }
      }else{
        if (active > 2){
          if ((2*util.TABLE_SIZE) < (idArray.length - args.from)){
            from = active - 2;
            to = from + 2*2;
          }else{ // there are not enough succesors
            // assertion: there are enough predecessors
            var offset = Math.floor((idArray.length - args.from) / util.TABLE_SIZE) - 1; // number of following pages
            if (((idArray.length - args.from) % util.TABLE_SIZE) > 0){
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
    };
    
    var refresh = function(args, content, idArray, entityConstructor){
      console.log("CALL: refresh()");
      refreshPageSelectorData(args, idArray);
      refreshTableContent(args, idArray, content, entityConstructor);
    };
    
    var setPageSelectorScopes = function(){
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
          + ($scope.args.from - util.TABLE_SIZE)
          + '&to=' + ($scope.args.to - util.TABLE_SIZE)
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
          + ($scope.args.from + util.TABLE_SIZE)
          + '&to=' + ($scope.args.to + util.TABLE_SIZE)
          + '&type=' + $scope.args.type;
        $scope.nextClass="";
      }else{
        $scope.nextEnabled = "disabled";
        $scope.nextLink = '';
        $scope.nextClass = "not-active";  
      }
    }
    
    var updateTable = function(){
      if (args.type == "classes") {
        Classes.then(function(data){
          var classesArray = initArray(data.getClasses(), $scope.filterString);
          // todo: apply filter
          refresh(args, data.getClasses(), classesArray, getClassFromId);
          $scope.content = tableContent;
          $scope.tableHeader = data.classesHeader;
          setPageSelectorScopes();
          $scope.entityCount = classesArray.length;
        });
      }
      if (args.type == "properties") {
          Properties.then(function(data){
          var propertiesArray = initArray(data.getProperties(), $scope.filterString);
          refresh(args, data.getProperties(), propertiesArray, getPropertyFromId);
          $scope.content = tableContent;
          $scope.tableHeader = data.propertiesHeader;
          setPageSelectorScopes();
          $scope.entityCount = propertiesArray.length;
          });
      }
      
    }
    
    // execution part
    Arguments.refreshArgs();
    var args = Arguments.getArgs();
    $scope.tableSize = util.TABLE_SIZE;
    $scope.args=args;
    $scope.filterdata;
    if (!$scope.filterText) {$scope.filterText = ""};
    updateTable();
    //$scope.searchfilter = angular.copy(searchfilter);
    $scope.searchFilter = function(){
      updateTable();
    }
    
  });
