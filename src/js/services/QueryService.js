app.service('QueryService',['$http', function($http){

    var QueryService = {};

    QueryService.putPost = function(thePost){
        return $http.post("/post",thePost).
            success(function(data, status, headers, config) {
                console.log("success");
            }).
            error(function(data, status, headers, config) {
                console.log("error");
            });
    };

    QueryService.getPosts =function() {
        return $http.get("/posts")
            .success(function(data,status,headers,config){
                return data;
            }

        ).error(function(data,status,headers,config){
                console.log("Error",data);
            });
    };

    return QueryService;

}]);