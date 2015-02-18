app.controller('PostCtrl',['$scope','QueryService', function($scope,QueryService){

    $scope.posts = [];

    $scope.getDate = function(date){
        return moment().format("MM/DD/YY",date);
    };

    $scope.options = {
        waveColor      : '#c5c1be',
        progressColor  : '#2A9FD6',
        normalize      : true,
        hideScrollbar  : true,
        skipLength     : 15,
        height         : 53,
        cursorColor    : '#2A9FD6'
    };

    $scope.run = function() {
        QueryService.getPosts().then(function(data){
            $scope.posts = data.data;
        });
    };
}]);
