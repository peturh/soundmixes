var app = angular.module('soundMixes', ['ngRoute','angularFileUpload','cgBusy','infinite-scroll'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'parts/listposts.tpl.html',
                controller: 'PostCtrl'
            })
            .when('/newpost', {
                templateUrl: 'parts/newpost.tpl.html',
                controller: 'PublishCtrl'
            });
    });

app.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
}).config(function($sceProvider){
    $sceProvider.enabled(false);

});
