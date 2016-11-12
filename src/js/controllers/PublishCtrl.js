var app = require('app')
app.controller('PublishCtrl',['$scope','QueryService','$upload', function($scope, QueryService,$upload){

    $scope.pushed = false;
    $scope.progressPercentage = 0;
    $scope.newPost = {
        "fileName" : "",
        "title" : "",
        "description" : "",
        "date" :"",
        "password" : ""
    };

    $scope.mySong = "";

    $scope.publishPost = function() {
        console.log("file",$scope.file);
        if(typeof $scope.file !== "undefined"){
            $scope.newPost.fileName = "/music/"+$scope.newPost.title+".mp3";
            $scope.pushed =! $scope.pushed;
         /*   QueryService.uploadFile($scope.file,$scope.newPost).then(function(data){
                console.log(data);
            });*/

            $upload.upload({

                url: 'uploadfile',
                data: {myObj: $scope.newPost},
                file: $scope.file
            }).progress(function(evt) {
                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function(data, status, headers, config) {
                $scope.progressPercentage = 0;

                window.alert("Upload successfull!");
                $scope.newPost = {
                    "fileName" : "",
                    "title" : "",
                    "description" : "",
                    "date" :"",
                    "password" : ""
                };
                $scope.file = "";

            }).error(function(data,status,headers,config){
                $scope.progressPercentage = 0;
                window.alert("Wrong password or the server fucked up, whad'ya know?");
            });
        }
        else{
            window.alert("No file selected!");
        }
    };




    $scope.getPercentage = function() {
        if ($scope.progressPercentage === 0) {
            return "Submit";
        }
        else{
            return $scope.progressPercentage + "%";
        }
    };
}]);
