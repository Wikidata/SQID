define(['rules/rules.module',
        'rules/ast.service',
        'rules/rules.service',
        'rules/parser.service',
        'rules/matcher.service',
        'rules/provider.service',
        'rules/references.service',
        'rules/instantiator.service',
        'rules/browse.controller',
        'rules/explain.controller'
       ],
function() {
    angular.module('rules').config(
        ['$routeProvider', '$filterProvider',
        function($routeProvider, $filterProvider) {
            $routeProvider
                .when('/rules/explain', {templateUrl: 'app/rules/explain.html'})
                .when('/rules/browse', {templateUrl: 'app/rules/browse.html'});
            $filterProvider
                .register('formatRule', ['ast', function(ast) {
                    return ast.print;
                }]);
    }]);

    return {};
});
