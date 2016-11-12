var app = require('app')
app.service('QueryService',['$http','$upload', function($http,$upload){

    var QueryService = {};


    QueryService.getPosts =function() {
        return $http.get("/posts")
            .success(function(data,status,headers,config){
                return data;
            }

        ).error(function(data,status,headers,config){
                console.log("Error",data);
            });
    };

    QueryService.deletePost =function(theObject) {
        return $http.post("/delete",theObject)
            .success(function(data,status,headers,config){
                return data;
            }
        ).error(function(data,status,headers,config){
                return data;
            });
    };

/*
    QueryService.uploadFile = function(file,post){
        console.log(post);
        return $upload.upload({
            url: 'uploadfile',
            data: {myObj: post},
            file: file
        }).progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file);
        }).success(function(data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            console.log("this runs")
        });
    };*/

    return QueryService;

}]);