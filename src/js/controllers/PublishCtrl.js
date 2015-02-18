app.controller('PublishCtrl',['$scope','QueryService','$upload', function($scope, QueryService,$upload){

    $scope.pushed = false;

    $scope.newPost = {
        "fileName" : "",
        "title" : "",
        "description" : "",
        "date" :"",
        "password" : ""
    };

    $scope.mySong = "";

    $scope.publishPost = function() {
        $scope.newPost.fileName = "http://localhost:9099/music/"+$scope.newPost.title+".mp3";
        $scope.pushed =! $scope.pushed;
        QueryService.uploadFile($scope.file,$scope.newPost);
    };

}]);
