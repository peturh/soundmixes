
var app = require('app');

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");
    // Här lägger vi till routes om det behövs.
    // Här används ui-router
    $stateProvider

        .state('/', {
            url: '/',
            templateUrl: 'parts/listposts.html',
            controller: 'PostCtrl'
        })
        .state('newpost',{
            url : '/newpost',
            templateUrl: 'parts/newpost.html',
            controller: 'PublishCtrl'
        })

}]);
