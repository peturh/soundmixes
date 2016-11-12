var app = require('app');
var moment = require('moment');
app.controller('PostCtrl',['$scope','QueryService', function($scope,QueryService){

    $scope.posts = [];

    $scope.limit = 3;


    $scope.loadMore = function() {
        $scope.limit = $scope.limit+1;
    };

    $scope.run = function() {
        QueryService.getPosts().then(function(data){
            $scope.posts = data.data;
        });
    };

    $scope.getDate = function(date){
        return moment().format("MM/DD/YY",date);
    };


    $scope.deletePost = function(post,password){
        var theRequest = {
            "password" : password,
            "_id" : post._id
        };

        QueryService.deletePost(theRequest).then(function(data){
            $scope.run();
            window.alert("Song successfully deleted");
            console.log(data);
        },function(err){
            window.alert("You are doing something you shouldn't aren't you?");
        });
    };
}]);
