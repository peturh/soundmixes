var app = angular.module('soundMixes', ['ngRoute','angularFileUpload','wavesurfer.angular'])
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
