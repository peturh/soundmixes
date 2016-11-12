/**
 * Created by petur on 2015-02-18.
 */
var app = require('app')
app.controller('MainCtrl',['$scope','$location', 'QueryService','$state',
    function($scope, $location, QueryService,$state){

        $scope.name = "Sound mixes";

        $scope.isActive = function(viewLocation){
            return viewLocation == $location.path();
        };

        $scope.newPost = function(){
              $state.go('newpost');
        };

        $scope.publishPost = function(){
            console.log("Denna körs");
            QueryService.putPost("hej servern");
        };


        $scope.posts = [];

    }]);