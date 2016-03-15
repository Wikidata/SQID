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
          if (filterfunc(entry, json)) {
              ret.push(entry);
          }
      }
      return ret;
    };

    var getClassFromId = function(id, data){
      return ['<a href="' + data.getUrl(id) + '">' + data.getLabel(id) +  ' (Q' + id + ')</a>',   '<div class="text-right">' + data.getAllInstanceCount(id).toString() + '</div>', '<div class="text-right">' + data.getAllSubclassCount(id).toString()  + '</div>'];
    };
    
    var getPropertyFromId = function(id, data){
      return ['<a href="' + data.getUrl(id) + '">' + data.getLabel(id) + ' (P' + id + ')</a>', data.getDatatype(id), '<div class="text-right">' +  data.getStatementCount(id).toString()  + '</div>', '<div class="text-right">' + data.getQualifierCount(id).toString()  + '</div>', '<div class="text-right">' + data.getReferenceCount(id).toString()  + '</div>'];
    };
    
    var refreshTableContent = function(args, idArray, content, entityConstructor){
      tableContent = [];
      for (var i = args.from; i < Math.min(args.to, (idArray.length )); i++){
        tableContent.push(entityConstructor(idArray[i], content));
      }
    };
    
    var refresh = function(args, content, idArray, entityConstructor){
      //console.log("CALL");
      paginationControl.refreshPageSelectorData(args, idArray);
      if (status.entityType == "classes"){
        $scope.filterLabels = status.classesFilter.label;
      }else{
        $scope.filterLabels = status.propertiesFilter.label;
      }
      refreshTableContent(args, idArray, content, entityConstructor);
    };
    
    var labelFilter = function(entry){
      var filter;
      if (status.entityType == "classes"){
        filter = status.classesFilter.label;
      }else{
        filter = status.propertiesFilter.label;
      }

      if (!filter){
        return true;
      }
      if ((filter == "") ) {
        return true;
      }
      if (!entry[jsonData.JSON_LABEL]) {
        return false;
      }
      if (entry[jsonData.JSON_LABEL].indexOf(filter) > -1) {
        return true;
      }else{
        return false;
      }
    }

    var datatypeFilter = function(entry){
      var filter;
      if (status.entityType == "classes"){
        return true;
      }else{
        filter = status.propertiesFilter.datatypes; 
      }

      if (!filter){
        return true;
      }
      if (filter == "All"){
        return true;
      }
      if (filter == entry[jsonData.JSON_DATATYPE]){
        return true;
      }else{
        return false;
      }
    }

    var applyFilter = function(entry, json){
      if (!datatypeFilter(json[entry])){
        return false;
      }else{
        if (!labelFilter(json[entry])){
          return false;
        }else{
          if (status.entityType == "classes"){
            var filter = status.classesFilter;
            if (!((json[entry][jsonData.JSON_INSTANCES] >= filter.instances[0])&&(json[entry][jsonData.JSON_INSTANCES] <= filter.instances[1]))){
              return false;
            }
            if (!((json[entry][jsonData.JSON_SUBCLASSES] >= filter.subclasses[0])&&(json[entry][jsonData.JSON_SUBCLASSES] <= filter.subclasses[1]))){
              return false;
            }
            return true;
          }else{
            var filter = status.propertiesFilter;
            if (!((json[entry][jsonData.JSON_USES_IN_STATEMENTS] >= filter.statements[0])&&(json[entry][jsonData.JSON_USES_IN_STATEMENTS] <= filter.statements[1]))){
              return false;
            }
            if (!((json[entry][jsonData.JSON_USES_IN_QUALIFIERS] >= filter.qualifiers[0])&&(json[entry][jsonData.JSON_USES_IN_QUALIFIERS] <= filter.qualifiers[1]))){
              return false;
            }
            if (!((json[entry][jsonData.JSON_USES_IN_REFERENCES] >= filter.references[0])&&(json[entry][jsonData.JSON_USES_IN_REFERENCES] <= filter.references[1]))){
              return false;
            }
            return true;
          }

        }
      }
    }

    var initSlider = function(sliderData){
      //result = [];
      //for 
      //resu.add()
    }

    var updateTable = function(){
      // TODO: check if form and to are out of the table length
      if (args.type == "classes") {
        Classes.then(function(data){
          $scope.slider = [ // TODO replace numbers with constants
            {name: "Number of direct instances", from: 0, 
              to: 4000000,
              startVal: status.classesFilter.instances[0], 
              endVal: status.classesFilter.instances[1]},
            {name: "number of direct subclasses", from: 0,
              to: 200000,
              startVal: status.classesFilter.subclasses[0], 
              endVal: status.classesFilter.subclasses[1]}];
          // todo: apply filter
          var classesArray = initArray(data.getClasses(), applyFilter);
          refresh(args, data, classesArray, getClassFromId);
          $scope.content = tableContent;
          $scope.tableHeader = data.classesHeader;
          paginationControl.setPageSelectorScopes();
          $scope.entityCount = classesArray.length;
          
        });
      }
      if (args.type == "properties") {
          Properties.then(function(data){
          $scope.slider = [ // TODO replace numbers with constants
            {name: "Uses in statements", from: 0,
              to: 20000000,
              startVal: status.propertiesFilter.statements[0],
              endVal: status.propertiesFilter.statements[1]},
            {name: "Uses in qualifiers", from: 0,
              to: 100000,
              startVal: status.propertiesFilter.qualifiers[0],
              endVal: status.propertiesFilter.qualifiers[1]},
            {name: "Uses in references", from: 0,
              to: 100000,
              startVal: status.propertiesFilter.references[0],
              endVal: status.propertiesFilter.references[1]}];

          var propertiesArray = initArray(data.getProperties(), applyFilter);
          refresh(args, data, propertiesArray, getPropertyFromId);
          $scope.content = tableContent;
          $scope.tableHeader = data.propertiesHeader;
          paginationControl.setPageSelectorScopes();
          $scope.entityCount = propertiesArray.length;
          });
      }
      
    }
    // $scope.slider = []; // TODO: init slider in refreshArgs()
    // execution part
    Arguments.refreshArgs();
    var args = Arguments.getArgs();
    var status = Arguments.getStatus();
    $scope.tableSize = jsonData.TABLE_SIZE;
    $scope.args=args;
    $scope.filterdata;

    $scope.datatypeOptions = [{id: 1, name: "All"},
      {id: 2, name: "WikibaseItem"},
      {id: 3, name: "WikibaseProperty"},
      {id: 4, name: "String"},
      {id: 5, name: "Url"},
      {id: 6, name: "CommonsMedia"},
      {id: 7, name: "ExternalId"},
      {id: 8, name: "Time"},
      {id: 9, name: "GlobeCoordinate"},
      {id: 10, name: "Quantity"},
      {id: 11, name: "MonolingualText"}];

    $scope.datatypeSelector = {id: 1, name: "All", $$hashKey: "object:14"};
    console.log("got here");
    if (!$scope.filterText) {$scope.filterText = ""};
    updateTable();
    //$scope.searchfilter = angular.copy(searchfilter);
    $scope.searchFilter = function(){
      if (status.entityType == "classes"){
        status.classesFilter.label = $scope.filterLabels;
      }else{
        status.propertiesFilter.label = $scope.filterLabels;
      }

      updateTable();
    }

    $scope.setDatatypeFilter = function(data){
      // console.log("Call");
      status.propertiesFilter.datatypes = data.name;
      console.log(data);
      updateTable();
    }

    $scope.updateStatus = function(){
      if (status.entityType == "classes"){
        status.classesFilter.instances[0] = $scope.slider[0].startVal;
        status.classesFilter.instances[1] = $scope.slider[0].endVal;
        status.classesFilter.subclasses[0] = $scope.slider[1].startVal;
        status.classesFilter.subclasses[1] = $scope.slider[1].endVal;
      }else{
        status.propertiesFilter.statements[0] = $scope.slider[0].startVal;
        status.propertiesFilter.statements[1] = $scope.slider[0].endVal;
        status.propertiesFilter.qualifiers[0] = $scope.slider[1].startVal;
        status.propertiesFilter.qualifiers[1] = $scope.slider[1].endVal;
        status.propertiesFilter.references[0] = $scope.slider[2].startVal;
        status.propertiesFilter.references[1] = $scope.slider[2].endVal;
      }
      updateTable();
    }
    
  });