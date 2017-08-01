define(['rules/rules.module'
       ],
function() {
    angular.module('rules').factory('references',
    [
    function() {
        function generateReference(query) {
            var url = ('#/rules/explain?inference=' +
                       encodeURIComponent(angular.toJson(query, false)));
            var reference = { P854: [{ datatype: 'url',
                                       datavalue: { type: 'string',
                                                    value: url
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
