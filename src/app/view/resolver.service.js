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
		'kldb-2010occupationcode': 'P1021',
		'cno-11occupationcode': 'P1022',
		'sbc-2010occupationcode': 'P1023',
		'sbfioccupationcode' : 'P1024',
		'sudoceditions' : 'P1025',
		'zdb' : 'P1042',
		'ideojob' : 'P1043',
		'SWBeditions' : 'P1044',
		'Sycomore' : 'P1045',
		'CatholicHierarchyperson' : 'P1047',
		'NCL' : 'P1048',
		'PSH' : 'P1051',
		'PortugueseJobCodeCPP-2010' : 'P1052',
		'Researcher' : 'P1053',
		'NDLbib' : 'P1054',
		'NLMUnique' : 'P1055',
		'ERAJournal' : 'P1058',
		'CVRnumber' : 'P1059',
		'Thailandcentraladministrativeunitcode' : 'P1067',
		'StatisticsDenmarksclassificationofoccupation' : 'P1069',
		'PlantList-' : 'P1070',
		'ICTVvirus' : 'P1076',
		'EULeditions' : 'P1084',
		'LibraryThingwork' : 'P1085',
		'ATVK' : 'P1115',
		'ELSTATgeographicalcode' : 'P1116',
		'DGO4identifier' : 'P1133',
		'KunstindeksDanmarkArtist' : 'P1138',
		'EHAK' : 'P1140',
		'BNArgentineeditions' : 'P1143',
		'LCOCLCCN' : 'P1144',
		'IAAF' : 'P1146',
		'ScopusAuthor' : 'P1153',
		'ScopusE' : 'P1154',
		'ScopusAffiliation' : 'P1155',
		'ScopusSource' : 'P1156',
		'USCongressBio' : 'P1157',
		'CODEN' : 'P1159',
		'ISO4abbreviation' : 'P1160',
		'USB' : 'P1167',
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
