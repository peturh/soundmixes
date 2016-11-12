var angular = require('angular');

var app = angular.module('soundMixes', ['ui.router','angularFileUpload','cgBusy','infinite-scroll']);

app.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
}).config(function($sceProvider){
    $sceProvider.enabled(false);
});
module.exports = app;
