/**
 * Created by petur on 2015-02-18.
 */
app.controller('MainCtrl',['$scope','$location', 'QueryService',
    function($scope, $location, QueryService){

        $scope.name = "Sound mixes";

        $scope.isActive = function(viewLocation){
            return viewLocation == $location.path();
        };

        $scope.publishPost = function(){
            console.log("Denna körs");
            QueryService.putPost("hej servern");
        };


        $scope.posts = [];


        $scope.run = function() {
            QueryService.getPosts().then(function(data){
                console.log(data);
                $scope.posts = data.data;
            });
        };
    }]);