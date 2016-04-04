classBrowser.controller('TableController', function($scope, Arguments, Classes, Properties, jsonData, util){



    var tableContent = [];

    var initArray = function(idArray, json, filterfunc, sortfunc){
      var ret = [];
      for (var i = 0; i < idArray.length; i++){
          if (filterfunc(idArray[i], json)) {
              ret.push(idArray[i]);
          }
      }
      return ret;
    };

    var getClassFromId = function(id, data){
      return ['<a href="' + data.getUrl(id) + '">' + data.getLabel(id) +  ' (Q' + id + ')</a>',   '<div class="text-right">' + data.getDirectInstanceCount(id).toString() + '</div>', '<div class="text-right">' + data.getDirectSubclassCount(id).toString()  + '</div>'];
    };
    
    var getPropertyFromId = function(id, data){
      return ['<a href="' + data.getUrl(id) + '">' + data.getLabel(id) + ' (P' + id + ')</a>', data.getDatatype(id), '<div class="text-right">' +  data.getStatementCount(id).toString()  + '</div>', '<div class="text-right">' + data.getQualifierCount(id).toString()  + '</div>', '<div class="text-right">' + data.getReferenceCount(id).toString()  + '</div>'];
    };
    
    var refreshTableContent = function(args, idArray, content, entityConstructor){
      tableContent = [];
      for (var i = 0; i < idArray.length; i++){
        tableContent.push(entityConstructor(idArray[i], content));
      }
    };
    
    var labelFilter = function(entry){
      var filter;
      if (status.entityType == "classes"){
        filter = status.classesFilter.label.toLowerCase();
      }else{
        filter = status.propertiesFilter.label.toLowerCase();
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
      if (entry[jsonData.JSON_LABEL].toLowerCase().indexOf(filter) > -1) {
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
        filter = status.propertiesFilter.datatypes.name; 
      }

      if (!filter){
        return true;
      }
      if (filter == "Any property type"){
        return true;
      }
      if (filter == entry[jsonData.JSON_DATATYPE]){
        return true;
      }else{
        return false;
      }
    }

    var relatedPropertyFilter = function(entry){
      var filter = status.classesFilter.relatedProperty;
      if (status.entityType == "properties"){
        return true;
      }
      if (!filter){
        return true;
      }
      if (filter == ""){
        return true;
      }
      if (!entry[jsonData.JSON_RELATED_PROPERTIES]){
        return false;
      }
      if (entry[jsonData.JSON_RELATED_PROPERTIES][filter]){
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
        }else{if(!relatedPropertyFilter(json[entry])){
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
    }

    var initPaginations = function(){
      if (!$scope.content){
        $scope.content = [];
      }
      $scope.pagination = {
        index: $scope.content,
        activePage: $scope.args.activePage || 1,
        onPageChange: function(){
          status.activePage = $scope.pagination.activePage;
          $scope.filterPermalink =Arguments.getUrl();
        }
      }
    }

    var initPropertyIndex = function(){
      var result = [{name: "No Filter", idName: "", id:0}]; 
      Properties.then(function(data){
        $scope.relatedProperty = {name: "No Filter", idName: "", id:0};
        var idArray = data.getIdArray();
        for (var i = 0; i < idArray.length; i++){
          var elem = {
            name: data.getLabel(idArray[i]),
            idName: "P" + idArray[i],
            id: idArray[i].toString()
          }
          result.push(elem);
          if (idArray[i].toString() == status.classesFilter.relatedProperty.toString()){
            $scope.relatedProperty = elem;
          }
        }
        relatedPropertyFilterInit = true;
        $scope.$broadcast('angucomplete-alt:changeInput', 'related-properties', $scope.relatedProperty);
      });
      return result;
    }

    var initClassesSlider = function(){
      $scope.slider = [ // TODO replace numbers with constants
        {name: "Number of direct instances", from: 0, 
          to: 4000000,
          startVal: status.classesFilter.instances[0], 
          endVal: status.classesFilter.instances[1]},
        {name: "number of direct subclasses", from: 0,
          to: 200000,
          startVal: status.classesFilter.subclasses[0], 
          endVal: status.classesFilter.subclasses[1]}];
    }

    var initPropertiesSlider = function(){
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
    }

    var updateTable = function(){
      if (args.type == "classes") {
        Classes.then(function(data){
          initClassesSlider();
          var classesArray = initArray(data.getIdArray(), data.getClasses(), applyFilter, sortfunc);
          refreshTableContent(args, classesArray, data, getClassFromId);
          $scope.content = tableContent;
          $scope.tableHeader = data.classesHeader;
          $scope.pagination.setIndex($scope.content, null);
        });
      }
      if (args.type == "properties") {
          Properties.then(function(data){
            initPropertiesSlider();
            var propertiesArray = initArray(data.getIdArray(), data.getProperties(), applyFilter, sortfunc);
            refreshTableContent(args, propertiesArray, data, getPropertyFromId);
            $scope.content = tableContent;
            $scope.tableHeader = data.propertiesHeader;
            $scope.pagination.setIndex($scope.content, null);
          });
      }
    }

    var updateTableLazy = function(){
      if (!timeoutIsSet){
        timeoutIsSet = true;
        setTimeout(function(){
          timeoutIsSet = false;
          updateTable();
          }, 300);
      }
    }

    // execution part
    Arguments.refreshArgs();
    var args = Arguments.getArgs();
    var status = Arguments.getStatus();
    var relatedPropertyFilterInit = false;
    var timeoutIsSet = false;
    var sortfunc = function(x){return function(a, b){return 0;};};

    $scope.propertyIndex = initPropertyIndex();
    $scope.relatedProperty = {name: "No Filter", idName: "", id:0};
    
    $scope.tableSize = jsonData.TABLE_SIZE;
    $scope.args=args;
    if (args.entityType == "classes"){
      $scope.filterLabels = args.classesFilter.label;
    }else{
      $scope.filterLabels = args.propertiesFilter.label;
    }
    initPaginations();

    $scope.datatypeSelector = {
      options: [{id: 1, name: "Any property type"},
      {id: 2, name: "WikibaseItem"},
      {id: 3, name: "WikibaseProperty"},
      {id: 4, name: "String"},
      {id: 5, name: "Url"},
      {id: 6, name: "CommonsMedia"},
      {id: 7, name: "ExternalId"},
      {id: 8, name: "Time"},
      {id: 9, name: "GlobeCoordinate"},
      {id: 10, name: "Quantity"},
      {id: 11, name: "Monolingualtext"}],
      selected: status.propertiesFilter.datatypes
    }

    $scope.filterPermalink =Arguments.getUrl();
    if (!$scope.filterText) {$scope.filterText = ""};
    
    updateTable();
    
    $scope.searchFilter = function(){
      if (status.entityType == "classes"){
        status.classesFilter.label = $scope.filterLabels;
      }else{
        status.propertiesFilter.label = $scope.filterLabels;
      }
      updateTableLazy();
    }

    $scope.setDatatypeFilter = function(data){
      status.propertiesFilter.datatypes = data;
      $scope.filterPermalink =Arguments.getUrl();
      updateTable();
    }

    $scope.resetFilters = function(){
      status.classesFilter = Arguments.getStatusStartValues().classesFilter;
      status.propertiesFilter = Arguments.getStatusStartValues().propertiesFilter;
      $scope.relatedProperty = {name: "No Filter", idName: "", id:0};
      $scope.$broadcast('angucomplete-alt:changeInput', 'related-properties', $scope.relatedProperty);
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
      $scope.filterPermalink =Arguments.getUrl();
      updateTableLazy();
    }
    
    $scope.copyToClipboard = function(){
      var textField = document.getElementById("permalink");
      var oSelectionStart = textField.SelectionStart;
      var oSelectionEnd = textField.SelectionEnd;
      var currentFocus = document.activeElement;
      textField.focus();
      textField.setSelectionRange(0, textField.value.length);
      document.execCommand("copy");
      if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
      }
      textField.setSelectionRange(oSelectionStart, oSelectionEnd);
    }

    $scope.sortElement = function(element, header){
      var direction = 0;
      switch(element[2]){
        case "fa fa-sort":
          element[2] = "fa fa-sort-desc";
          direction = (-1);
          break;
        case "fa fa-sort-desc":
          element[2] = "fa fa-sort-asc";
          direction = 1;
          break;
        case "fa fa-sort-asc":
          element[2] = "fa fa-sort-desc";
          direction = (-1);
          break;
        default:
          console.log("Unknown sort style " + element[2]);
      }
      for (var i=0; i < header.length; i++){
        if (header[i] != element){
          header[i][2] = "fa fa-sort"; 
        }
      }
      if (status.entityType == "classes"){
        Classes.then(function(data){
          data.sortClasses(util.getSortComparator(element[3], direction));
          updateTable();
        });
      }else{
        Properties.then(function(data){
          data.sortProperties(util.getSortComparator(element[3], direction));
          updateTable();
        });
      }
    }

    $scope.selectedRelatedProperty = function(selected){
      var oldProperty = $scope.relatedProperty.id;
      if (!selected){
        $scope.relatedProperty = {name: "No Filter", idName: "", id:0};
        if (relatedPropertyFilterInit){
          status.classesFilter.relatedProperty = "";
        }
      }else{
        $scope.relatedProperty = selected.originalObject;
        if (relatedPropertyFilterInit){
          status.classesFilter.relatedProperty = selected.originalObject.id;
        }
      }
      if (oldProperty != $scope.relatedProperty.id){
        updateTable();
      }
    }

  });
