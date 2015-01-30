app.controller('PublishCtrl',['$scope','QueryService', function($scope, QueryService){


    $scope.newPost = {
        "title" : "",
        "description" : "",
        "date" :"",
        "password" : ""
    };

    $scope.publishPost = function(){
        console.log($scope.newPost);
        QueryService.putPost($scope.newPost).then(function(){
            QueryService.getPosts().then(function(data){
                $scope.posts = data.data;
            });
        });
    };

}]);
