classBrowser.controller('TableController', function($scope, Arguments, Classes, Properties){

    // definition part
  
    var pageSelectorData = {};
    var classesArray = [];
    var tableContent = [];

    var initArray = function(json){
      var ret = []
      for (var entry in json) {
          ret.push(entry);
        }
      return ret;
    };

    var getEntityFromId = function(id, data){
      return {
        id: id,
        label: data[id][util.JSON_LABEL],
        numberOfInstances: data[id][util.JSON_INSTANCES],
        numberOfSubclasses: data[id][util.JSON_SUBCLASSES],
        relatedProperties: data[id][util.JSON_RELATED_PROPERTIES]
      }
    };
    
    var refreshTableContent = function(args, classes){
      tableContent = [];
      for (var i = args.from; i < args.to; i++){
        tableContent.push(getEntityFromId(classesArray[i], classes));
      }
    };

    var refreshPageSelectorData = function(args){
      var from;
      var to;
      var active = Math.floor(args.from / util.TABLE_SIZE) + 1;
      var prev;
      var next;

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
          if ((2*util.TABLE_SIZE) < (classesArray.length - args.from)){
            from = active - 2;
            to = from + 2*2;
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
        enabled: true,
        prevEnabled: (from != active),
        nextEnabled: (to != active)
      }
    };
    
    var refresh = function(args, content){
      refreshPageSelectorData(args);
      refreshTableContent(args, content);
    };
    
    // execution part
    Arguments.refreshArgs();
    var args = Arguments.getArgs();
    if (Arguments.getArgs().type == "classes") {
      Classes.then(function(data){
        classesArray = initArray(data.getClasses());
        refresh(args, data.getClasses());
        $scope.content = tableContent;
        $scope.tableHeader = data.classesHeader;
        
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
        $scope.args=args;
        $scope.pagination = array;
        $scope.tableSize = util.TABLE_SIZE;
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
      });
      
    }
  });
