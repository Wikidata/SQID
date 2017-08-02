define(['rules/rules.module'
       ],
function() {
    angular.module('rules').factory('references',
    [
    function() {
        function generateReference(query) {
            var bindings = {};

            angular.forEach(query.bindings, function(binding) {
                if (('id' in binding) && ('name' in binding))  {
                    bindings[binding.name] = binding.id;
            });

            var info = { rule: query.rule,
                         query: query.query,
                         bindings: bindings,
                         constraints: query.constraints
            };
            var url = ('#/rules/explain?inference=' +
                       encodeURIComponent(angular.toJson(info, false)));
            var reference = { P854: [{ datatype: 'url',
                                       datavalue: { type: 'string',
                                                    value: url,
                                                    __sqid_display_string_override__: '(explain inference)'
                                                  },
                                       snaktype: 'value',
                                       property: 'P854'
                                     }]
                            };

            return [{ snaks: reference,
                      'snaks-order': ['P854']
                    }];
        }

        return { generateReference: generateReference
               };
    }]);

    return {};
});
