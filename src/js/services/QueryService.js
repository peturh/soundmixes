app.service('QueryService',['$http', function($http){

    var QueryService = {};

    QueryService.putPost = function(){
        console.log("hej i services")
        return $http.post("/post",{msg:'hello lisa!!! :)'}).
            success(function(data, status, headers, config) {
                console.log("success");
            }).
            error(function(data, status, headers, config) {

            });
    };

    QueryService.getPost =function() {
        return $http.get("/posts");
    };

    return QueryService;

}]);