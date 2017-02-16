//////// Module Definition ////////////
define([
	'view/view.module',
	'util/sparql.service'
], function() {
///////////////////////////////////////

angular.module('view').factory('resolver', ['sparql',
function(sparql) {
	var idNames = {
		'viaf': 'P214',
		'gnd': 'P227',
		'nlr': 'P1003',
		'musicbrainzplace': 'P1004',
		'nationalthesaurusforauthornames': 'P1006',
		'lattesplatformnumber': 'P1007',
		'iranstatistics': 'P1010',
		'aat': 'P1014',
		'bibsys': 'P1015',
		'bav': 'P1017',
		'kldb2010occupationcode': 'P1021',
		'cno11occupationcode': 'P1022',
		'sbc2010occupationcode': 'P1023',
		'sbfioccupationcode' : 'P1024',
		'sudoceditions' : 'P1025',
		'zdb' : 'P1042',
		'ideojob' : 'P1043',
		'swbeditions' : 'P1044',
		'sycomore' : 'P1045',
		'catholichierarchyperson' : 'P1047',
		'ncl' : 'P1048',
		'psh' : 'P1051',
		'portuguesejobcodecpp2010' : 'P1052',
		'researcher' : 'P1053',
		'ndlbib' : 'P1054',
		'nlmunique' : 'P1055',
		'erajournal' : 'P1058',
		'cvrnumber' : 'P1059',
		'thailandcentraladministrativeunitcode' : 'P1067',
		'statisticsdenmarksclassificationofoccupation' : 'P1069',
		'plantlist' : 'P1070',
		'ictvvirus' : 'P1076',
		'euleditions' : 'P1084',
		'librarythingwork' : 'P1085',
		'atvk' : 'P1115',
		'elstatgeographicalcode' : 'P1116',
		'dgo4identifier' : 'P1133',
		'kunstindeksdanmarkartist' : 'P1138',
		'ehak' : 'P1140',
		'bnargentineeditions' : 'P1143',
		'lcoclccn' : 'P1144',
		'iaaf' : 'P1146',
		'scopusauthor' : 'P1153',
		'scopuse' : 'P1154',
		'scopusaffiliation' : 'P1155',
		'scopussource' : 'P1156',
		'uscongressbio' : 'P1157',
		'coden' : 'P1159',
		'iso4abbreviation' : 'P1160',
		'usb' : 'P1167',
		'municipalitycode' : 'P1168'
	};

	var getQId = function(exId){
		var idName, value;
		if (exId){
			var splits = exId.split(':');
			if (splits.length == 2){
				idName = splits[0];
				value = splits[1];
			}else{
				return null;
			}
		}else{
			return null;
		}
		var prop = idNames[idName.toLowerCase()];
		if (prop){
			var promise = sparql.getIdFromLiteral(prop, value).then(function(uri){
				if (uri){
					var newId = uri.split('/').pop();
					return newId;
				}
				return null;
			});

			return promise;
		}else{
			return null;
		}
	};
	// TODO implement
	return {
		getQId: getQId
	};
}]);

return {};}); // module definition end
