var app = angular.module('cedricMusic', ['ngResource', 'ngRoute'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'index.html',
                controller: 'PostCtrl'
            })
            .when('/newpost', {
                templateUrl: 'parts/newpost.tpl.html',
                controller: 'PostPublishCtrl'
            });
    });
;app.service('QueryService',['$http', function($http, $q){




}]);