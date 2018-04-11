define(['rules/rules.module',
		'i18n/i18n.service',
		'util/dataFormatter.service',
		'rules/rules.service',
		'rules/labels.service',
		'rules/provider.service',
		'rules/instantiator.service',
		'util/entitydata.service'
	   ],
function() {
	angular.module('rules').controller('ExplainController',
	['$scope', '$location', '$sce', '$translate', '$q',
	'i18n', 'dataFormatter', 'labels', 'provider', 'instantiator', 'entitydata', 'rules', 'matcher',
	function($scope, $location, $sce, $translate, $q, i18n, dataFormatter, labels, provider, instantiator, entitydata, rules, matcher) {
		var search = $location.search();

		if (angular.isUndefined(search.item) ||
			angular.isUndefined(search.origin) ||
			angular.isUndefined(search.offset)) {
			// error out
			return;
		}

		provider.lookupRule(search.origin, search.offset)
			.then(function(rule) {
				console.log(rule)

				entitydata.getEntityData(search.item)
					.then(function(entityData) {
						return entitydata.getInlinkData(search.item)
						.then(function(entityInData) {
							return rules.tryCandidateRule(rule, entityData, entityInData, search.item);
						}).then(function(inst) {
							console.log(inst)
						});
					});
			});

		return;

		try {
			var inference = angular.fromJson(
				$route.current.params.inference
			);
			$scope.explanation = inference;
		} catch (e) {
			if (!(e instanceof SyntaxError)) {
				throw e;
			} else {
				$scope.explanation = 'error.';
				return;
			}
		}

		if (angular.isUndefined(inference)) {
			// something went wrong. do something clever;
			$scope.explanation = 'error.';
			return;
		}

		var bounds = [];
		angular.forEach(inference.bindings, function(binding) {
			if (angular.isObject(binding)) {
				if ('id' in binding) {
					bounds.push(binding.id.split('$', 1)[0]);
				}
			} else {
				bounds.push(binding.split('$', 1)[0]);
			}
		});

		var promise = labels.labelPromiseForRule(
			inference.rule,
			bounds
		).then(function() {
			var theLabels = {};
			var bindings = {};
			angular.forEach(labels.literalsInRule(inference.rule), function(literal) {
				theLabels[literal] = labels.labelForLiteral(literal);
			});
			angular.forEach(inference.bindings, function(binding, variable) {
				if (angular.isObject(binding)) {
					if (('id' in binding) &&
						(!('type' in binding) || (binding.type !== 'set-variable'))) {
						bindings[variable] = labels.labelForLiteral(binding.id);
					} else if ('item' in binding) {
						bindings[variable] = $sce.trustAsHtml(
							binding.item.map(function(value) {
								return dataFormatter.getSnakHtml(value);
							}).join('<br>')
						);
					}
				} else {
					bindings[variable] = labels.labelForLiteral(binding);
				}
			});

			$scope.explanation.labels = theLabels;
			$scope.explanation.bounds = bindings;
			$scope.explanation.statement = {
				statements: instantiator.instantiateRuleHead(inference, undefined, true),
				waitForPropertyLabels: function() {
					return promise;
					   },
					   waitForTerms: function() {
						   return promise;
					   }
			};

			var subject = inference.rule.head.arguments[0];
			var item = inference.bindings[subject.name].id;
			var term = i18n.getEntityTerms(item);
			var label = ('<a href="' + i18n.getEntityUrl(item) +
						 '">' + term.label + '</a>');
			if (term.description !== '') {
				label += (' <span class="smallnote">(' +
						  i18n.autoLinkText(term.description) +
						  ')</span>');
			}
			$scope.explanation.title = label;
		});
	}]);

	return {};
});
