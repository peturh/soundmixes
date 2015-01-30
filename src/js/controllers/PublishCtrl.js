app.controller('PublishCtrl',['$scope','QueryService', function($scope, QueryService){

    $scope.publishPost = function(){
        console.log("Denna körs");
        QueryService.putPost("hej lisa");
    };

}]);
