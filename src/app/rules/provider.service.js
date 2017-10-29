//////// Module Definition ////////////
define([
'rules/rules.module',
'rules/parser.service'
], function() {
///////////////////////////////////////

angular.module('rules').factory('provider', [
	'parser',
	function(parser) {

		var rules = [
// 			{ // x inverseOf y -> y inverseOf x
// 				rule: '(?x.P1696 = ?y) -> (?y.P1696 = ?x)',
// 				kind: 'materialise'
// 			},
			{
				desc: 'spouse is symmetric',
				rule: '(?x.P26 = ?y)@?S -> (?y.P26 = ?x)@?S',
				kind: 'materialise'
			},
			{
				desc: 'A male parent is a father',
				rule: '(?father.P40 = ?child)@?X, (?father.P21 = Q6581097)@?Y -> (?child.P22 = ?father)@[]',
				kind: 'materialise'
			},
			{
				desc: 'A female parent is a mother',
				rule: '(?mother.P40 = ?child)@?X, (?mother.P21 = Q6581072)@?Y -> (?child.P25 = ?mother)@[]',
				kind: 'materialise'
			},
			{ // grandfather
				desc: 'a male parent of a parent is a grandfather',
				rule: '(?grandfather.P21 = Q6581097)@?X, (?grandfather.P40 = ?parent)@?Y, (?parent.P40 = ?child)@?Z -> (?child.P1038 = ?grandfather)@[P1039 = Q9238344]',
				kind: 'informational'
			},
			{ // grandson
				desc: 'a male child of a child is a grandson',
				rule: '(?son.P21 = Q6581097)@?X, (?grandparent.P40 = ?parent)@?Y, (?parent.P40 = ?son)@?Z -> (?grandparent.P1038 = ?son)@[P1039 = Q11921506]',
				kind: 'informational'
			},
			{ // grandmother
				desc: 'a female parent of a parent is a grandmother',
				rule: '(?grandmother.P21 = Q6581072)@?X, (?grandmother.P40 = ?parent)@?Y, (?parent.P40 = ?child)@?Z -> (?child.P1038 = ?grandmother)@[P1039 = Q9235758]',
				kind: 'informational'
			},
			{ // granddaughter
				desc: 'a female child of a child is a granddaughter',
				rule: '(?daughter.P21 = Q6581072)@?X, (?grandparent.P40 = ?parent)@?Y, (?parent.P40 = ?daughter)@?Z -> (?grandparent.P1038 = ?daughter)@[P1039 = Q19756330]',
				kind: 'informational'
			},
			{ // country's head of state holds this position
				desc: 'a country\'s head of state holds this position',
				rule: '(?country.P35 = ?headOfState)@?X, (?country.P1906 = ?headOffice)@?Y -> (?headOfState.P39 = ?headOffice)@[]',
				kind: 'materialise'
			},
			{ // anyone holding a country's head of state position is its head of state
				desc: 'anyone holding a country\'s head of state position is its head of state',
				rule: '(?headOfState.P39 = ?headOffice)@?X, (?country.P1906 = ?headOffice)@?Y -> (?country.P35 = ?headOfState)@[P580=?X.P580, P582=?X.P582]',
				kind: 'materialise'
			},
			{ // head of government
				rule: '(?country.P6 = ?headOfGov)@?X, (?country.P1313 = ?headOffice)@?Y -> (?headOfGov.P39 = ?headOffice)@[]',
				kind: 'materialise'
			},
			{ // currency is inverse of cound
				desc: 'currencies that have a country are the currency of that country',
				rule: '(?currency.P31 = Q8142)@?X, (?currency.P17 = ?country)@?Y -> (?country.P38 = ?currency)@[]',
				kind: 'materialise'
			},
			{
				desc: 'A body of water whose mouth of watercourse is another river, is a tributary',
				rule: '(?tributary.P403 = ?river)@?X, (?river.P31 = Q4022)@?Y -> (?river.P974 = ?tributary)@[]',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3148/P2568
				desc: 'repeals is inverse of repealed by',
				rule: '(?x.P3148 = ?y)@?S -> (?y.P2568 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2579/P2578
				desc: 'studied by is inverse of studies',
				rule: '(?x.P2579 = ?y)@?S -> (?y.P2578 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2578/P2579
				desc: 'studies is inverse of studied by',
				rule: '(?x.P2578 = ?y)@?S -> (?y.P2579 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2674/P2673
				desc: 'next crossing downstream is inverse of next crossing upstream',
				rule: '(?x.P2674 = ?y)@?S -> (?y.P2673 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2673/P2674
				desc: 'next crossing upstream is inverse of next crossing downstream',
				rule: '(?x.P2673 = ?y)@?S -> (?y.P2674 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2682/P2681
				desc: 'is verso of is inverse of is recto of',
				rule: '(?x.P2682 = ?y)@?S -> (?y.P2681 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2681/P2682
				desc: 'is recto of is inverse of is verso of',
				rule: '(?x.P2681 = ?y)@?S -> (?y.P2682 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2822/P2821
				desc: 'by-product of is inverse of by-product',
				rule: '(?x.P2822 = ?y)@?S -> (?y.P2821 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2821/P2822
				desc: 'by-product is inverse of by-product of',
				rule: '(?x.P2821 = ?y)@?S -> (?y.P2822 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P425/P3095
				desc: 'field of this occupation is inverse of practiced by',
				rule: '(?x.P425 = ?y)@?S -> (?y.P3095 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2568/P3148
				desc: 'repealed by is inverse of repeals',
				rule: '(?x.P2568 = ?y)@?S -> (?y.P3148 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3190/P3189
				desc: 'innervates is inverse of innervated by',
				rule: '(?x.P3190 = ?y)@?S -> (?y.P3189 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3189/P3190
				desc: 'innervated by is inverse of innervates',
				rule: '(?x.P3189 = ?y)@?S -> (?y.P3190 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3262/P3261
				desc: 'has anatomical branch is inverse of anatomical branch of',
				rule: '(?x.P3262 = ?y)@?S -> (?y.P3261 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3261/P3262
				desc: 'anatomical branch of is inverse of has anatomical branch',
				rule: '(?x.P3261 = ?y)@?S -> (?y.P3262 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3730/P3729
				desc: 'next higher rank is inverse of next lower rank',
				rule: '(?x.P3730 = ?y)@?S -> (?y.P3729 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3729/P3730
				desc: 'next lower rank is inverse of next higher rank',
				rule: '(?x.P3729 = ?y)@?S -> (?y.P3730 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3781/P3780
				desc: 'has active ingredient is inverse of active ingredient in',
				rule: '(?x.P3781 = ?y)@?S -> (?y.P3780 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3780/P3781
				desc: 'active ingredient in is inverse of has active ingredient',
				rule: '(?x.P3780 = ?y)@?S -> (?y.P3781 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P767/P3919
				desc: 'contributor(s) to the subject is inverse of contributed to published work',
								rule: '(?x.P767 = ?y)@?S -> (?y.P3919 = ?x)@?S',
				kind: 'materialise'
			},
// 			{ // generated inverse rule for P40/P22
// 				desc: 'child is inverse of father',
// 				rule: '(?x.P40 = ?y)@?S -> (?y.P22 = ?x)@?S',
// 				kind: 'materialise'
// 			},
// 			{ // generated inverse rule for P40/P25
// 				desc: 'child is inverse of mother',
// 				rule: '(?x.P40 = ?y)@?S -> (?y.P25 = ?x)@?S',
// 				kind: 'materialise'
// 			},
			{ // generated inverse rule for P1376/P36
				desc: 'capital of is inverse of capital',
				rule: '(?x.P1376 = ?y)@?S -> (?y.P36 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1308/P39
				desc: 'officeholder is inverse of position held',
				rule: '(?x.P1308 = ?y)@?S -> (?y.P39 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P22/P40
				desc: 'father is inverse of child',
				rule: '(?x.P22 = ?y)@?S -> (?y.P40 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P25/P40
				desc: 'mother is inverse of child',
				rule: '(?x.P25 = ?y)@?S -> (?y.P40 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P47/P47
				desc: 'shares border with is inverse of shares border with',
				rule: '(?x.P47 = ?y)@?S -> (?y.P47 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P137/P121
				desc: 'operator is inverse of item operated',
				rule: '(?x.P137 = ?y)@?S -> (?y.P121 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1830/P127
				desc: 'owner of is inverse of owned by',
				rule: '(?x.P1830 = ?y)@?S -> (?y.P127 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P150/P131
				desc: 'contains administrative territorial entity is inverse of located in the administrative territorial entity',
				rule: '(?x.P150 = ?y)@?S -> (?y.P131 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P121/P137
				desc: 'item operated is inverse of operator',
				rule: '(?x.P121 = ?y)@?S -> (?y.P137 = ?x)@?S',
				kind: 'materialise'
			},
// 			{ // generated inverse rule for P131/P150
// 				desc: 'located in the administrative territorial entity is inverse of contains administrative territorial entity',
// 				rule: '(?x.P131 = ?y)@?S -> (?y.P150 = ?x)@?S',
// 				kind: 'materialise'
// 			},
			{ // generated inverse rule for P156/P155
				desc: 'followed by is inverse of follows',
				rule: '(?x.P156 = ?y)@?S -> (?y.P155 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P155/P156
				desc: 'follows is inverse of followed by',
				rule: '(?x.P155 = ?y)@?S -> (?y.P156 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1056/P176
				desc: 'product or material produced is inverse of manufacturer',
				rule: '(?x.P1056 = ?y)@?S -> (?y.P176 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1299/P180
				desc: 'depicted by is inverse of depicts',
				rule: '(?x.P1299 = ?y)@?S -> (?y.P180 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P185/P184
				desc: 'doctoral student is inverse of doctoral advisor',
				rule: '(?x.P185 = ?y)@?S -> (?y.P184 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P184/P185
				desc: 'doctoral advisor is inverse of doctoral student',
				rule: '(?x.P184 = ?y)@?S -> (?y.P185 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P910/P301
				desc: 'topic\'s main category is inverse of category\'s main topic',
				rule: '(?x.P910 = ?y)@?S -> (?y.P301 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P749/P355
				desc: 'parent organization is inverse of subsidiary',
				rule: '(?x.P749 = ?y)@?S -> (?y.P355 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2354/P360
				desc: 'has list is inverse of is a list of',
				rule: '(?x.P2354 = ?y)@?S -> (?y.P360 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P527/P361
				desc: 'has part is inverse of part of',
				rule: '(?x.P527 = ?y)@?S -> (?y.P361 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P398/P397
				desc: 'child astronomical body is inverse of parent astronomical body',
				rule: '(?x.P398 = ?y)@?S -> (?y.P397 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P397/P398
				desc: 'parent astronomical body is inverse of child astronomical body',
				rule: '(?x.P397 = ?y)@?S -> (?y.P398 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P974/P403
				desc: 'tributary is inverse of mouth of the watercourse',
				rule: '(?x.P974 = ?y)@?S -> (?y.P403 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3095/P425
				desc: 'practiced by is inverse of field of this occupation',
				rule: '(?x.P3095 = ?y)@?S -> (?y.P425 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1029/P450
				desc: 'crew member is inverse of astronaut mission',
				rule: '(?x.P1029 = ?y)@?S -> (?y.P450 = ?x)@?S',
				kind: 'materialise'
			},
// 			{ // generated inverse rule for P159/P466
// 				desc: 'headquarters location is inverse of occupant',
// 				rule: '(?x.P159 = ?y)@?S -> (?y.P466 = ?x)@?S',
// 				kind: 'materialise'
// 			},
			{ // generated inverse rule for P361/P527
				desc: 'part of is inverse of has part',
				rule: '(?x.P361 = ?y)@?S -> (?y.P527 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P568/P567
				desc: 'overlies is inverse of underlies',
				rule: '(?x.P568 = ?y)@?S -> (?y.P567 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P567/P568
				desc: 'underlies is inverse of overlies',
				rule: '(?x.P567 = ?y)@?S -> (?y.P568 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P747/P629
				desc: 'edition(s) is inverse of edition or translation of',
								rule: '(?x.P747 = ?y)@?S -> (?y.P629 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1441/P674
				desc: 'present in work is inverse of characters',
				rule: '(?x.P1441 = ?y)@?S -> (?y.P674 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P702/P688
				desc: 'encoded by is inverse of encodes',
				rule: '(?x.P702 = ?y)@?S -> (?y.P688 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P688/P702
				desc: 'encodes is inverse of encoded by',
				rule: '(?x.P688 = ?y)@?S -> (?y.P702 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1344/P710
				desc: 'participant of is inverse of participant',
				rule: '(?x.P1344 = ?y)@?S -> (?y.P710 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P629/P747
				desc: 'edition or translation of is inverse of edition(s)',
								rule: '(?x.P629 = ?y)@?S -> (?y.P747 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P355/P749
				desc: 'subsidiary is inverse of parent organization',
				rule: '(?x.P355 = ?y)@?S -> (?y.P749 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P3919/P767
				desc: 'contributed to published work is inverse of contributor(s) to the subject',
								rule: '(?x.P3919 = ?y)@?S -> (?y.P767 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1066/P802
				desc: 'student of is inverse of student',
				rule: '(?x.P1066 = ?y)@?S -> (?y.P802 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1542/P828
				desc: 'cause of is inverse of has cause',
				rule: '(?x.P1542 = ?y)@?S -> (?y.P828 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P301/P910
				desc: 'category\'s main topic is inverse of topic\'s main category',
				rule: '(?x.P301 = ?y)@?S -> (?y.P910 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P926/P925
				desc: 'postsynaptic connection is inverse of presynaptic connection',
				rule: '(?x.P926 = ?y)@?S -> (?y.P925 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P925/P926
				desc: 'presynaptic connection is inverse of postsynaptic connection',
				rule: '(?x.P925 = ?y)@?S -> (?y.P926 = ?x)@?S',
				kind: 'materialise'
			},
// 			{ // generated inverse rule for P403/P974
// 				desc: 'mouth of the watercourse is inverse of tributary',
// 				rule: '(?x.P403 = ?y)@?S -> (?y.P974 = ?x)@?S',
// 				kind: 'materialise'
// 			},
			{ // generated inverse rule for P1011/P1012
				desc: 'excluding is inverse of including',
				rule: '(?x.P1011 = ?y)@?S -> (?y.P1012 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P450/P1029
				desc: 'astronaut mission is inverse of crew member',
				rule: '(?x.P450 = ?y)@?S -> (?y.P1029 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P802/P1066
				desc: 'student is inverse of student of',
				rule: '(?x.P802 = ?y)@?S -> (?y.P1066 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1204/P1151
				desc: 'Wikimedia portal\'s main topic is inverse of topic\'s main Wikimedia portal',
				rule: '(?x.P1204 = ?y)@?S -> (?y.P1151 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1151/P1204
				desc: 'topic\'s main Wikimedia portal is inverse of Wikimedia portal\'s main topic',
				rule: '(?x.P1151 = ?y)@?S -> (?y.P1204 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P180/P1299
				desc: 'depicts is inverse of depicted by',
				rule: '(?x.P180 = ?y)@?S -> (?y.P1299 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P39/P1308
				desc: 'position held is inverse of officeholder',
				rule: '(?x.P39 = ?y)@?S -> (?y.P1308 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1678/P1312
				desc: 'has vertex figure is inverse of has facet polytope',
				rule: '(?x.P1678 = ?y)@?S -> (?y.P1312 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P710/P1344
				desc: 'participant is inverse of participant of',
				rule: '(?x.P710 = ?y)@?S -> (?y.P1344 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2522/P1346
				desc: 'victory is inverse of winner',
				rule: '(?x.P2522 = ?y)@?S -> (?y.P1346 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1366/P1365
				desc: 'replaced by is inverse of replaces',
				rule: '(?x.P1366 = ?y)@?S -> (?y.P1365 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1365/P1366
				desc: 'replaces is inverse of replaced by',
				rule: '(?x.P1365 = ?y)@?S -> (?y.P1366 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P36/P1376
				desc: 'capital is inverse of capital of',
				rule: '(?x.P36 = ?y)@?S -> (?y.P1376 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1424/P1423
				desc: 'topic\'s main template is inverse of template\'s main topic',
				rule: '(?x.P1424 = ?y)@?S -> (?y.P1423 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1423/P1424
				desc: 'template\'s main topic is inverse of topic\'s main template',
				rule: '(?x.P1423 = ?y)@?S -> (?y.P1424 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1445/P1434
				desc: 'fictional universe described in is inverse of takes place in fictional universe',
				rule: '(?x.P1445 = ?y)@?S -> (?y.P1434 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P674/P1441
				desc: 'characters is inverse of present in work',
				rule: '(?x.P674 = ?y)@?S -> (?y.P1441 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1434/P1445
				desc: 'takes place in fictional universe is inverse of fictional universe described in',
				rule: '(?x.P1434 = ?y)@?S -> (?y.P1445 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1536/P1478
				desc: 'immediate cause of is inverse of has immediate cause',
				rule: '(?x.P1536 = ?y)@?S -> (?y.P1478 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1537/P1479
				desc: 'contributing factor of is inverse of has contributing factor',
				rule: '(?x.P1537 = ?y)@?S -> (?y.P1479 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2283/P1535
				desc: 'uses is inverse of used by',
				rule: '(?x.P2283 = ?y)@?S -> (?y.P1535 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P828/P1536
				desc: 'has cause is inverse of immediate cause of',
				rule: '(?x.P828 = ?y)@?S -> (?y.P1536 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1478/P1536
				desc: 'has immediate cause is inverse of immediate cause of',
				rule: '(?x.P1478 = ?y)@?S -> (?y.P1536 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1479/P1537
				desc: 'has contributing factor is inverse of contributing factor of',
				rule: '(?x.P1479 = ?y)@?S -> (?y.P1537 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P828/P1542
				desc: 'has cause is inverse of cause of',
				rule: '(?x.P828 = ?y)@?S -> (?y.P1542 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1074/P1557
				desc: 'fictional analog of is inverse of manifestation of',
				rule: '(?x.P1074 = ?y)@?S -> (?y.P1557 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1672/P1582
				desc: 'this taxon is source of is inverse of natural product of taxon',
				rule: '(?x.P1672 = ?y)@?S -> (?y.P1582 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1606/P1605
				desc: 'natural reservoir of is inverse of has natural reservoir',
				rule: '(?x.P1606 = ?y)@?S -> (?y.P1605 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1605/P1606
				desc: 'has natural reservoir is inverse of natural reservoir of',
				rule: '(?x.P1605 = ?y)@?S -> (?y.P1606 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1687/P1629
				desc: 'Wikidata property is inverse of subject item of this property',
				rule: '(?x.P1687 = ?y)@?S -> (?y.P1629 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1643/P1642
				desc: 'departure transaction is inverse of acquisition transaction',
				rule: '(?x.P1643 = ?y)@?S -> (?y.P1642 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1642/P1643
				desc: 'acquisition transaction is inverse of departure transaction',
				rule: '(?x.P1642 = ?y)@?S -> (?y.P1643 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1677/P1660
				desc: 'index case of is inverse of has index case',
				rule: '(?x.P1677 = ?y)@?S -> (?y.P1660 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1582/P1672
				desc: 'natural product of taxon is inverse of this taxon is source of',
				rule: '(?x.P1582 = ?y)@?S -> (?y.P1672 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1660/P1677
				desc: 'has index case is inverse of index case of',
				rule: '(?x.P1660 = ?y)@?S -> (?y.P1677 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1312/P1678
				desc: 'has facet polytope is inverse of has vertex figure',
				rule: '(?x.P1312 = ?y)@?S -> (?y.P1678 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1629/P1687
				desc: 'subject item of this property is inverse of Wikidata property',
				rule: '(?x.P1629 = ?y)@?S -> (?y.P1687 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1704/P1703
				desc: 'is pollinator of is inverse of is pollinated by',
				rule: '(?x.P1704 = ?y)@?S -> (?y.P1703 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1703/P1704
				desc: 'is pollinated by is inverse of is pollinator of',
				rule: '(?x.P1703 = ?y)@?S -> (?y.P1704 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1754/P1753
				desc: 'category related to list is inverse of list related to category',
				rule: '(?x.P1754 = ?y)@?S -> (?y.P1753 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1753/P1754
				desc: 'list related to category is inverse of category related to list',
				rule: '(?x.P1753 = ?y)@?S -> (?y.P1754 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P127/P1830
				desc: 'owned by is inverse of owner of',
				rule: '(?x.P127 = ?y)@?S -> (?y.P1830 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1344/P1923
				desc: 'participant of is inverse of participating teams',
				rule: '(?x.P1344 = ?y)@?S -> (?y.P1923 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2176/P2175
				desc: 'drug used for treatment is inverse of medical condition treated',
				rule: '(?x.P2176 = ?y)@?S -> (?y.P2175 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2175/P2176
				desc: 'medical condition treated is inverse of drug used for treatment',
				rule: '(?x.P2175 = ?y)@?S -> (?y.P2176 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1535/P2283
				desc: 'used by is inverse of uses',
				rule: '(?x.P1535 = ?y)@?S -> (?y.P2283 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2289/P2286
				desc: 'venous drainage is inverse of arterial supply',
				rule: '(?x.P2289 = ?y)@?S -> (?y.P2286 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2286/P2289
				desc: 'arterial supply is inverse of venous drainage',
				rule: '(?x.P2286 = ?y)@?S -> (?y.P2289 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2389/P2388
				desc: 'organisation directed from the office is inverse of office held by head of the organisation',
				rule: '(?x.P2389 = ?y)@?S -> (?y.P2388 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2388/P2389
				desc: 'office held by head of the organisation is inverse of organisation directed from the office',
				rule: '(?x.P2388 = ?y)@?S -> (?y.P2389 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2500/P2499
				desc: 'league level below is inverse of league level above',
				rule: '(?x.P2500 = ?y)@?S -> (?y.P2499 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2499/P2500
				desc: 'league level above is inverse of league level below',
				rule: '(?x.P2499 = ?y)@?S -> (?y.P2500 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2502/P2501
				desc: 'classification of cycling race is inverse of results',
				rule: '(?x.P2502 = ?y)@?S -> (?y.P2501 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P2501/P2502
				desc: 'results is inverse of classification of cycling race',
				rule: '(?x.P2501 = ?y)@?S -> (?y.P2502 = ?x)@?S',
				kind: 'materialise'
			},
			{ // generated inverse rule for P1346/P2522
				desc: 'winner is inverse of victory',
				rule: '(?x.P1346 = ?y)@?S -> (?y.P2522 = ?x)@?S',
				kind: 'materialise'
			}
		];

		var getRules = function() {
			return rules.map(function(rule) {
				return angular.extend(
					{
						kind: rule.kind,
						desc: rule.desc,
					},
					parser.parse(rule.rule, true)
				);
			});
		};

return {
		getRules: getRules
	};
}]);

return {}; }); // module definition end
