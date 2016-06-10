//////// Module Definition ////////////
define([
  'app/app', // pulls angular, ngroute and utilties
  'app/classes',
  'app/properties',
  'util/util',
  'util/i18n',
  'util/pagination'
], function() {
///////////////////////////////////////

angular.module('classBrowserApp')


  .factory('Arguments', ['$http', '$route', 'util', 'i18n', function($http, $route, util, i18n){
      var args = {}; 
      var statusStartValues = {
        entityType: "classes",
        activePage: 1,
        lang: i18n.getLanguage(),
        sortCriteria: {
          classes: {
            label: "fa fa-sort",
            instances: "fa fa-sort-desc",
            subclasses: "fa fa-sort"
          },
          properties: {
            label: "fa fa-sort",
            datatype: "fa fa-sort",
            statements: "fa fa-sort-desc",
            qualifiers: "fa fa-sort",
            references: "fa fa-sort"
          }
        },
        classesFilter: {
          label: "",
          relatedProperty: "",
          superclass: "",
          instances: [0, 4000000],
          subclasses: [0, 2000000]
        },
        propertiesFilter: {
          label: "",
          relatedProperty: "",
          relatedQualifier: "",
          directInstanceOf: {id: 1, name: "Any property class", qId: 0},
          statements: [0, 20000000],
          qualifiers: [0, 10000000],
          references: [0, 10000000],
          datatypes: {id: 1, name: "Any property type"}

        }
      };

      var serializeDatatype = function(type){
        return type.id + ":" + type.name;
      }

      var deserializeDatatype = function(typeString){
        if (!typeString){
          return typeString;
        }
        var splits = typeString.split(":");
        return {id: splits[0], name: splits[1]};
      }

      var serializePropertyClass = function(c){
        return c.id + ":" + c.name + ":" + c.qId;
      }

      var deserializePropertyClass = function(classString){
        if (!classString){
          return classString;
        }
        var splits = classString.split(":");
        return {id: splits[0], name: splits[1], qId: splits[2]};
      }

      var status = util.cloneObject(statusStartValues);
      return {
        refreshArgs: function(){
          args = {
            type: ($route.current.params.type) ? ($route.current.params.type) : status.entityType,
            activePage: ($route.current.params.activepage) ? parseInt(($route.current.params.activepage)) : status.activePage,
            lang : ($route.current.params.lang) ? ($route.current.params.lang) : i18n.getLanguage(),
            sortCriteria: {
              classes: {
                label: ($route.current.params.sortclasslabel) ? ($route.current.params.sortclasslabel) : status.sortCriteria.classes.label,
                instances: ($route.current.params.sortclassinstances) ? ($route.current.params.sortclassinstances) : status.sortCriteria.classes.instances,
                subclasses: ($route.current.params.sortclasssubclasses) ? ($route.current.params.sortclasssubclasses) : status.sortCriteria.classes.subclasses
              },
              properties: {
                label: ($route.current.params.sortpropertylabel) ? ($route.current.params.sortpropertylabel) : status.sortCriteria.properties.label,
                datatype: ($route.current.params.sortpropertydatatype) ? ($route.current.params.sortpropertydatatype) : status.sortCriteria.properties.datatype,
                statements: ($route.current.params.sortpropertystatements) ? ($route.current.params.sortpropertystatements) : status.sortCriteria.properties.statements,
                qualifiers: ($route.current.params.sortpropertyqualifiers) ? ($route.current.params.sortpropertyqualifiers) : status.sortCriteria.properties.qualifiers,
                references: ($route.current.params.sortpropertyreferences) ? ($route.current.params.sortpropertyreferences) : status.sortCriteria.properties.references
              }
            },
            classesFilter: {
              label:  ($route.current.params.classlabelfilter) ? ($route.current.params.classlabelfilter) : status.classesFilter.label,
              relatedProperty: ($route.current.params.rpcfilter) ? ($route.current.params.rpcfilter) : status.classesFilter.relatedProperty,
              superclass: ($route.current.params.supercfilter) ? ($route.current.params.supercfilter) : status.classesFilter.superclass,
              instances: [ ($route.current.params.instancesbegin) ? ($route.current.params.instancesbegin) : status.classesFilter.instances[0], ($route.current.params.instancesend) ? ($route.current.params.instancesend) : status.classesFilter.instances[1]],
              subclasses: [ ($route.current.params.subclassesbegin) ? ($route.current.params.subclassesbegin) : status.classesFilter.subclasses[0], ($route.current.params.subclassesend) ? ($route.current.params.subclassesend) : status.classesFilter.subclasses[1]],
            },
            propertiesFilter: {
              label: ($route.current.params.propertylabelfilter) ? ($route.current.params.propertylabelfilter) : status.propertiesFilter.label,
              relatedProperty: ($route.current.params.rppfilter) ? ($route.current.params.rppfilter) : status.propertiesFilter.relatedProperty,
              relatedQualifier: ($route.current.params.rqualifierfilter) ? ($route.current.params.rqualifierfilter) : status.propertiesFilter.relatedQualifier,
              directInstanceOf: ($route.current.params.dInstancefilter) ? deserializePropertyClass($route.current.params.dInstancefilter) : status.propertiesFilter.directInstanceOf,
              statements: [ ($route.current.params.statementsbegin) ? ($route.current.params.statementsbegin) : status.propertiesFilter.statements[0], ($route.current.params.statementsend) ? ($route.current.params.statementsend) : status.propertiesFilter.statements[1]],
              qualifiers: [ ($route.current.params.qualifiersbegin) ? ($route.current.params.qualifiersbegin) : status.propertiesFilter.qualifiers[0], ($route.current.params.qualifiersend) ? ($route.current.params.qualifiersend) : status.propertiesFilter.qualifiers[1]],
              references: [ ($route.current.params.referencesbegin) ? ($route.current.params.referencesbegin) : status.propertiesFilter.references[0], ($route.current.params.referencesend) ? ($route.current.params.referencesend) : status.propertiesFilter.references[1]],
              datatypes: ($route.current.params.datatypes) ? deserializeDatatype($route.current.params.datatypes) : status.propertiesFilter.datatypes
            }
          }
          status.entityType = args.type;
          status.activePage = args.activePage;
          status.lang = args.lang;
          status.sortCriteria = args.sortCriteria;
          status.classesFilter = args.classesFilter;
          status.propertiesFilter = args.propertiesFilter;
        },
        getArgs: function(){
          return args;
        },
        getStatus: function(){
          return status;
        },
        getStatusStartValues:function(){
          return util.cloneObject(statusStartValues);
        },
        getUrl: function(){
          var result =  location.origin + location.pathname + "#/browse" 
            + "?activepage=" + status.activePage
            + "&type=" + status.entityType
            + "&lang=" + status.lang;
          if (status.entityType == "classes"){
            result += (status.classesFilter.label ? "&classlabelfilter=" + status.classesFilter.label : "")
              + (status.classesFilter.relatedProperty ? "&rpcfilter=" + status.classesFilter.relatedProperty : "")
              + (status.classesFilter.superclass ? "&supercfilter=" + status.classesFilter.superclass : "")
              + (status.classesFilter.instances[0] != 0 ? "&instancesbegin=" + status.classesFilter.instances[0] : "")
              + (status.classesFilter.instances[1] != 4000000 ? "&instancesend=" + status.classesFilter.instances[1] : "")
              + (status.classesFilter.subclasses[0] != 0 ? "&subclassesbegin=" + status.classesFilter.subclasses[0] : "")
              + (status.classesFilter.subclasses[1] != 2000000 ? "&subclassesend=" + status.classesFilter.subclasses[1] : "")
              + (status.sortCriteria.classes.label != "fa fa-sort" ? "&sortclasslabel=" + status.sortCriteria.classes.label : "")
              + (status.sortCriteria.classes.instances != "fa fa-sort-desc" ? "&sortclassinstances=" + status.sortCriteria.classes.instances : "")
              + (status.sortCriteria.classes.subclasses != "fa fa-sort" ? "&sortclasssubclasses=" + status.sortCriteria.classes.subclasses : "")
            
          }else{
            result += (status.propertiesFilter.label ? "&propertylabelfilter=" + status.propertiesFilter.label : "") 
              + (status.propertiesFilter.relatedProperty ? "&rppfilter=" + status.propertiesFilter.relatedProperty : "")
              + (status.propertiesFilter.relatedQualifier ? "&rqualifierfilter=" + status.propertiesFilter.relatedQualifier : "")
              + (status.propertiesFilter.directInstanceOf.id != 1 ? "&dInstancefilter=" + serializePropertyClass(status.propertiesFilter.directInstanceOf) : "")
              + (status.propertiesFilter.statements[0] != 0 ? "&statementsbegin=" + status.propertiesFilter.statements[0] : "")
              + (status.propertiesFilter.statements[1] != 20000000 ? "&statementsend=" + status.propertiesFilter.statements[1] : "")
              + (status.propertiesFilter.qualifiers[0] != 0 ? "&qualifiersbegin=" + status.propertiesFilter.qualifiers[0] : "")
              + (status.propertiesFilter.qualifiers[1] != 10000000 ? "&qualifiersend=" + status.propertiesFilter.qualifiers[1] : "")
              + (status.propertiesFilter.references[0] != 0 ? "&referencesbegin=" + status.propertiesFilter.references[0] : "")
              + (status.propertiesFilter.references[1] != 10000000   ? "&referencesend=" + status.propertiesFilter.references[1] : "")
              + (status.propertiesFilter.datatypes.id != 1 ? "&datatypes=" + serializeDatatype(status.propertiesFilter.datatypes) : "")
              + (status.sortCriteria.properties.label != "fa fa-sort" ? "&sortpropertylabel=" + status.sortCriteria.properties.label : "")
              + (status.sortCriteria.properties.datatype != "fa fa-sort" ? "&sortpropertydatatype=" + status.sortCriteria.properties.datatype : "")
              + (status.sortCriteria.properties.statements != "fa fa-sort-desc" ? "&sortpropertystatements=" + status.sortCriteria.properties.statements : "")
              + (status.sortCriteria.properties.qualifiers != "fa fa-sort" ? "&sortpropertyqualifiers=" + status.sortCriteria.properties.qualifiers : "")
              + (status.sortCriteria.properties.references != "fa fa-sort" ? "&sortpropertyreferences=" + status.sortCriteria.properties.references : "");
          }
          return result;
        }
      }
  }])

.controller('TableController', ['$scope', '$translate', 'i18n', 'Arguments', 'Classes', 'Properties', 'util',
  function($scope, $translate, i18n, Arguments, Classes, Properties, util){

    var tableContent = [];

    var tableSize = 15;

    var initArray = function(idArray, data, filterfunc){
      var ret = [];
      for (var i = 0; i < idArray.length; i++){
          if (filterfunc(idArray[i], data)) {
              ret.push(idArray[i]);
          }
      }
      return ret;
    };

    var translateItems = function(items){
      if (i18n.getLanguage() != 'en'){
        var toTranslate = [];
        for (var i=0; i<items.length; i++){
          toTranslate.push(items[i].id);
        }
        i18n.waitForTerms(toTranslate).then(function(){
          for (var i = 0; i < items.length; i++){
            var label = i18n.getEntityTerms(items[i].id).label;
            if (label){
              items[i].content[0] = items[i].template[0] + label + items[i].template[1];
            }
          }
        });
      }
    };

    var getClassFromId = function(id, data){
      var label = data.getLabel(id);
      label = label ? label + ' (Q' + id + ')': 'Q' + id;
      return { 
        content: ['<a href="' + data.getUrl(id, i18n.getLanguage()) + '">' + label + '</a>', '<div class="text-right">' + data.getDirectInstanceCount(id).toString() + '</div>', '<div class="text-right">' + data.getDirectSubclassCount(id).toString()  + '</div>'],
        id: 'Q' + String(id),
        template: ['<a href="' + data.getUrl(id, i18n.getLanguage()) + '">', ' (Q' + id + ')</a>']
      };
    };
    
    var getPropertyFromId = function(id, data){
      var label = data.getLabel(id);
      label = label ? label + ' (P' + id + ')': 'P' + id;
      return {
        content: ['<a href="' + data.getUrl(id, i18n.getLanguage()) + '">' + label + '</a>', data.getDatatype(id), '<div class="text-right">' +  data.getStatementCount(id).toString()  + '</div>', '<div class="text-right">' + data.getQualifierCount(id).toString()  + '</div>', '<div class="text-right">' + data.getReferenceCount(id).toString()  + '</div>'],
        id: 'P' + String(id),
        template: ['<a href="' + data.getUrl(id, i18n.getLanguage()) + '">', ' (P' + id + ')</a>']
      };
    };
    
    var refreshTableContent = function(args, idArray, content, entityConstructor){
      tableContent = [];
      for (var i = 0; i < idArray.length; i++){
        tableContent.push(entityConstructor(idArray[i], content));
      }
    };
    
    var entityFilters = {
      labelFilter: function(entry, data){
        var filter;
        var id;
        if (status.entityType == "classes"){
          filter = status.classesFilter.label.toLowerCase();
          id = "q" + entry;
        }else{
          filter = status.propertiesFilter.label.toLowerCase();
          id = 'p' + entry;
        }
        if (!filter){
          return true;
        }
        if ((filter == "") ) {
          return true;
        }
        if (id.indexOf(filter) > -1){
          return true;
        }
        var label = data.getLabel(entry);
        if (!label){
          return false;
        }
        if (label.toLowerCase().indexOf(filter) > -1){
          return true;
        }else{
          return false;
        }
      },
      datatypeFilter: function(entry, data){
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
        if (filter == data.getDatatype(entry)){
          return true;
        }else{
          return false;
        }
      },
      propertyClassFilter: function(entry, data){
        var filter;
        if (status.entityType == "classes"){
          return true;
        }else{
          filter = status.propertiesFilter.directInstanceOf.qId;
        }
        if (filter == 0){
          return true;
        }else{
          if (data.getClasses(entry).indexOf(filter) != -1){
            return true;
          }else{
            return false;
          }
        }
      },
      suggestFilters: function(entry, data){
        var suggestFiltersHelper = function(entry, getter, value){
          if (!value){
            return true;
          }
          if (value == ""){
            return true;
          }
          var attr = getter(entry);
          if (!attr){
            return false;
          }
          if (attr.constructor === Array){
            if (attr.indexOf(value) != -1){
              return true;
            }else{
              return false;
            }
          }else{
            if (attr[value]){
              return true;
            }else{
              return false;
            }
          }
        };
        if (status.entityType == "classes"){
          return suggestFiltersHelper(entry, data.getRelatedProperties, status.classesFilter.relatedProperty)
            && suggestFiltersHelper(entry, data.getSuperClasses, status.classesFilter.superclass)
        }else{
            return suggestFiltersHelper(entry, data.getRelatedProperties, status.propertiesFilter.relatedProperty)
              && suggestFiltersHelper(entry, data.getQualifiers, status.propertiesFilter.relatedQualifier)
        }
      },
      sliderFilter: function(entry, data){
        if (status.entityType == "classes"){
          var filter = status.classesFilter,
            dic = data.getDirectInstanceCount(entry),
            dsc = data.getDirectSubclassCount(entry);
          if (!(((dic >= filter.instances[0])&&(dic <= filter.instances[1]))||((!dic) && (filter.instances[0] == 0)))){
            return false;
          }
          
          if (!(((dsc >= filter.subclasses[0])&&(dsc <= filter.subclasses[1]))||((!dsc) && (filter.subclasses[0] == 0)))){
            return false;
          }
          return true;
        }else{
          var filter = status.propertiesFilter;
            sc = data.getStatementCount(entry),
            qc = data.getQualifierCount(entry),
            rc = data.getReferenceCount(entry); 
          if (!(((sc >= filter.statements[0])&&(sc <= filter.statements[1]))||((!sc) && (filter.statements[0] == 0)))){
            return false;
          }
          if (!(((qc >= filter.qualifiers[0])&&(qc <= filter.qualifiers[1]))||((!qc) && (filter.qualifiers[0] == 0)))){
            return false;
          }
          if (!(((rc >= filter.references[0])&&(rc <= filter.references[1]))||((!rc) && (filter.references[0] == 0)))){
            return false;
          }
          return true;
        }
      }
    }

    var applyFilter = function(entry, data){
      for (var key in entityFilters){
        if (entityFilters.hasOwnProperty(key)) {
          if (!entityFilters[key](entry, data)){
            return false;
          }
        }
      }
      return true;
    }

    var refreshAngucompleteInputFields = function(){
      $scope.$broadcast('angucomplete-alt:changeInput', 'related-properties-classes', $scope.suggestFilters.classes.relatedProperty); // evt. für properties kopieren
      $scope.$broadcast('angucomplete-alt:changeInput', 'direct-superclass-of-class', $scope.suggestFilters.classes.superclass);
      $scope.$broadcast('angucomplete-alt:changeInput', 'related-properties-properties', $scope.suggestFilters.properties.relatedProperty);
      $scope.$broadcast('angucomplete-alt:changeInput', 'related-qualifiers', $scope.suggestFilters.properties.relatedQualifier);
    };

    var initPaginations = function(){
      if (!$scope.content){
        $scope.content = [];
      }
      $scope.pagination = {
        index: $scope.content,
        activePage: $scope.args.activePage || 1,
        onPageChange: function(items){
          status.activePage = $scope.pagination.activePage;
          $scope.filterPermalink =Arguments.getUrl();
          translateItems(items);
        },
      }
    };

    var initPropertyIndex = function(){
      var result = []; 
      Properties.then(function(data){
        $scope.suggestFilters.classes.relatedProperty = "";
        var idArray = data.getIdArray();
        for (var i = 0; i < idArray.length; i++){
          var elem = {
            name: data.getLabel(idArray[i]),
            idName: "P" + idArray[i],
            id: idArray[i].toString()
          }
          result.push(elem);

          if (idArray[i].toString() == status.classesFilter.relatedProperty.toString()){
            $scope.suggestFilters.classes.relatedProperty = elem;
          }
          if (idArray[i].toString() == status.propertiesFilter.relatedProperty.toString()){
            $scope.suggestFilters.properties.relatedProperty = elem;
          }
          if (idArray[i].toString() == status.propertiesFilter.relatedQualifier.toString()){
            $scope.suggestFilters.properties.relatedQualifier = elem;
          }

        }
        propertyIndexInitialized = true;
        refreshAngucompleteInputFields();
      });
      return result;
    };

    var initClassIndex = function(){
      var result = [];
      Classes.then(function(data){
        var idArray = data.getIdArray();
        for (var i = 0; i < idArray.length; i++){
          var elem = {
            name: data.getLabel(idArray[i]),
            idName: "Q" + idArray[i],
            id: idArray[i].toString()
          }
          result.push(elem);
          if (idArray[i].toString() == status.classesFilter.superclass.toString()){
            $scope.suggestFilters.classes.superclass = elem;
          }

        }

        classIndexInitialized = true;
        refreshAngucompleteInputFields();
      });
      return result;
    };

    var initPropertyClassIndex = function(){
      var result = [{id: 1, name: "Any property class"}];
      Properties.then(function(propertyData){
        Classes.then(function(classData){
          var propertyClassIds = [];
          var idArray = propertyData.getIdArray();
          for (var i = 0; i < idArray.length; i++){
            propertyClassIds = util.unionArrays(propertyClassIds, propertyData.getClasses(i));
          }
          for (var i = 0; i < propertyClassIds.length; i++){
            var elem = {
              id: (i+2),
              name: classData.getLabel(propertyClassIds[i]) + " (Q" + propertyClassIds[i].toString() + ")",
              qId: propertyClassIds[i]
            }
            result.push(elem);

            if (propertyClassIds[i].toString() == status.propertiesFilter.directInstanceOf.toString()){
              $scope.suggestFilters.properties.directInstanceOf  = elem;
            }

          }
          result.sort(function(a, b){
            if (a.id == 1){
              return -1;
            }
            if (b.id == 1){
              return 1;
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()){
              return 1;
            }else{
              return -1;  
            }
          });
          propertyClassIndexInitialized = true;
          refreshAngucompleteInputFields();
        });
      });
      return result;
    }

    var initClassesSlider = function(){
      $scope.slider = [ // TODO replace numbers with constants
        {name: "FILTER_MENUE.FILTER_DIRECT_INS", from: 0, 
          to: 4000000,
          startVal: status.classesFilter.instances[0], 
          endVal: status.classesFilter.instances[1]},
        {name: "FILTER_MENUE.FILTER_DIRECT_SUBCL", from: 0,
          to: 2000000,
          startVal: status.classesFilter.subclasses[0], 
          endVal: status.classesFilter.subclasses[1]}];
    };

    var initPropertiesSlider = function(){
      $scope.slider = [ // TODO replace numbers with constants
        {name: "FILTER_MENUE.FILTER_USE_STMTS", from: 0,
          to: 20000000,
          startVal: status.propertiesFilter.statements[0],
          endVal: status.propertiesFilter.statements[1]},
        {name: "FILTER_MENUE.FILTER_USE_QUALS", from: 0,
          to: 10000000,
          startVal: status.propertiesFilter.qualifiers[0],
          endVal: status.propertiesFilter.qualifiers[1]},
        {name: "FILTER_MENUE.FILTER_USE_REFS", from: 0,
          to: 10000000,
          startVal: status.propertiesFilter.references[0],
          endVal: status.propertiesFilter.references[1]}]; 
    };

    var updateTable = function(){
      if (args.type == "classes") {
        Classes.then(function(data){
          $scope.tableHeader = data.getClassesHeader(status);
          initClassesSlider();
          var classesArray = initArray(data.getIdArray(), data, applyFilter);
          refreshTableContent(args, classesArray, data, getClassFromId);
          $scope.content = tableContent;
          $scope.pagination.setIndex($scope.content, null);
        });
      }
      if (args.type == "properties") {
          Properties.then(function(data){
            $scope.tableHeader = data.getPropertiesHeader(status);
            initPropertiesSlider();
            var propertiesArray = initArray(data.getIdArray(), data, applyFilter);
            refreshTableContent(args, propertiesArray, data, getPropertyFromId);
            $scope.content = tableContent;
            $scope.pagination.setIndex($scope.content, null);
          });
      }
    };

    var updateTableLazy = function(){
      if (!timeoutIsSet){
        timeoutIsSet = true;
        setTimeout(function(){
          timeoutIsSet = false;
          updateTable();
          }, 300);
      }
    };

    var selectElementForSuggestFilter = function(selected, statusElement, scopeElement){
      // TODO more elements for oldProperty
      var oldProperty = scopeElement.id;
      if (!selected){
        scopeElement = "";
        if (propertyIndexInitialized){
          statusElement = "";
        }
      }else{
        scopeElement = selected.originalObject;
        if (propertyIndexInitialized){
          statusElement = selected.originalObject.id;
        }
      }
      if (oldProperty != scopeElement.id){
        updateTable();
      }
      return [statusElement, scopeElement];
    };

    // execution part
    Arguments.refreshArgs();
    var args = Arguments.getArgs();
    var status = Arguments.getStatus();
    
    var propertyIndexInitialized = false;
    var classIndexInitialized = false;
    var propertyClassIndexInitialized = false;
    
    var timeoutIsSet = false;

    i18n.setLanguage(status.lang);



    $scope.suggestFilters = {
      data: {
        propertyIndex: initPropertyIndex(),
        classIndex: initClassIndex()
      },
      classes: {
        relatedProperty: "",
        superclass: ""
      },
      properties: {
        relatedProperty: "",
        relatedQualifier: "",
        directInstanceOf: ""
      }
    };

    $scope.propertyClassFilter = {
      options: initPropertyClassIndex(),
      selected: status.propertiesFilter.directInstanceOf
    }


    $scope.tableSize = tableSize;
    $scope.args=args;
    if (status.entityType == "classes"){
      $scope.filterLabels = status.classesFilter.label;
    }else{
      $scope.filterLabels = status.propertiesFilter.label;
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

    $scope.translations = {};

    $translate(['TABLE_HEADER.LABEL', 'TABLE_HEADER.DATATYPE', 'TABLE_HEADER.USES_IN_STMTS', 
        'TABLE_HEADER.USES_IN_QUALS', 'TABLE_HEADER.USES_IN_REFS', 'TABLE_HEADER.INSTATNCES', 
        'TABLE_HEADER.SUBCLASSES']).then(function(translations){
      translations.LABEL = translations['TABLE_HEADER.LABEL'];
      translations.DATATYPE = translations['TABLE_HEADER.DATATYPE'];
      translations.USES_IN_STMTS = translations['TABLE_HEADER.USES_IN_STMTS'];
      translations.USES_IN_QUALS = translations['TABLE_HEADER.USES_IN_QUALS'];
      translations.USES_IN_REFS = translations['TABLE_HEADER.USES_IN_REFS'];
      translations.INSTATNCES = translations['TABLE_HEADER.INSTATNCES'];
      translations.SUBCLASSES = translations['TABLE_HEADER.SUBCLASSES'];

    });

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

    $scope.setPropertyClassFilter = function(data){
      status.propertiesFilter.directInstanceOf = data;
      $scope.filterPermalink = Arguments.getUrl();
      updateTable();
    }

    $scope.resetFilters = function(){
      status.classesFilter = Arguments.getStatusStartValues().classesFilter;
      status.propertiesFilter = Arguments.getStatusStartValues().propertiesFilter;
      $scope.suggestFilters.classes.relatedProperty = "";
      $scope.$broadcast('angucomplete-alt:changeInput', 'related-properties', $scope.suggestFilters.classes.relatedProperty);
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
          header[i][3](status, header[i][2]);
        }
      }
      element[3](status, element[2]);
      if (status.entityType == "classes"){
        Classes.then(function(data){
          data.sortClasses(status);
          updateTable();
        });
      }else{
        Properties.then(function(data){
          data.sortProperties(status);
          updateTable();
        });
      }
    }

    $scope.suggestSelectFunctions = {
      classes:{
        relatedProperty : function(selected){
          var result = selectElementForSuggestFilter(selected, 
          status.classesFilter.relatedProperty, $scope.suggestFilters.classes.relatedProperty);
          status.classesFilter.relatedProperty = result[0];
          $scope.suggestFilters.classes.relatedProperty = result[1];
        },
        superclass : function(selected){
          var result = selectElementForSuggestFilter(selected, 
          status.classesFilter.superclass, $scope.suggestFilters.classes.superclass);
          status.classesFilter.superclass = result[0];
          $scope.suggestFilters.classes.superclass = result[1];
        },
      },
      properties: {
        relatedProperty : function(selected){
          var result = selectElementForSuggestFilter(selected, 
          status.propertiesFilter.relatedProperty, $scope.suggestFilters.properties.relatedProperty);
          status.propertiesFilter.relatedProperty = result[0];
          $scope.suggestFilters.properties.relatedProperty = result[1];
        },
        relatedQualifier : function(selected){
          var result = selectElementForSuggestFilter(selected, 
          status.propertiesFilter.relatedQualifier, $scope.suggestFilters.properties.relatedQualifier);
          status.propertiesFilter.relatedQualifier = result[0];
          $scope.suggestFilters.properties.relatedQualifier = result[1];
        }
      }
    };

    var localSearch = function(str, data){
      var matches = [];
      var exactMatches = [];
      var str = str.toLowerCase();
      for (var i=0; i < data.length; i++){
        var elem = data[i];
        if (elem.idName != null){
          if (elem.idName.toLowerCase() == str){
            exactMatches.push(elem);
            continue;
          }
        }
        if (elem.name != null){
          if (elem.name.toLowerCase() == str){
            exactMatches.push(elem);
            continue;
          }
        }
        if (elem.idName != null){
          if (elem.idName.toLowerCase().indexOf(str) != -1){
            matches.push(elem);
            continue;
          }
        }
        if (elem.name != null){
          if (elem.name.toLowerCase().indexOf(str) != -1){
            matches.push(elem);
            continue;
          }
        }
      }
      matches.sort(function(a, b){
        if (a.name > b.name){
          return 1;
        }
        if (a.name < b.name){
          return -1;
        }
        return 0;
      });
      matches.length = Math.min(matches.length, 10 - exactMatches.length)
      return exactMatches.concat(matches);
    };

    $scope.localSearchProperties = function(str){
      return localSearch(str, $scope.suggestFilters.data.propertyIndex);
    };

    $scope.localSearchClasses = function(str){
      return localSearch(str, $scope.suggestFilters.data.classIndex);
    };


  }]);
  
  return {}; // module
});         // definition end