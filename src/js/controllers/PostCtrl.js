app.controller('PostCtrl',['$scope','QueryService', function($scope,QueryService){

    $scope.posts = [];

    $scope.limit = 3;


    $scope.loadMore = function() {
        console.log("loaded more");
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


    $scope.deletePost = function(post){
        QueryService.deletePost(post).then(function(data){
            $scope.run();
            window.alert("Song deleted");
        });
    };
}]);
