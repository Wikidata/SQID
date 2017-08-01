define(['rules/rules.module',
        'rules/ast.service',
        'rules/rules.service',
        'rules/parser.service',
        'rules/matcher.service',
        'rules/provider.service',
        'rules/references.service',
        'rules/instantiator.service'
       ],
function() {
    angular.module('rules').config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/rules/explain', {templateUrl: 'app/rules/explain.html'})
            .when('/rules/browse', {templateUrl: 'app/rules/browse.html'});
    }]);

    return {};
});
