app.controller('MainCtrl',['$scope','$location', 'QueryService',
    function($scope, $location){

    $scope.name = "Sound mixes";

    $scope.isActive = function(viewLocation){
        return viewLocation == $location.path();
    };

    $scope.publishPost = function(){
        console.log("Denna körs");
        QueryService.putPost("hej servern");
    };
}]);
