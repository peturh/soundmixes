var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

mongoose.connect("mongodb://localhost:27017/cedricMusic");

var postSchema = new Schema({
    title : String,
    description : String,
});

var postModel = mongoose.model('post', postSchema);


app.use(express.static(path.join(__dirname, '/src/')));
app.listen('9099',function(){console.log("App listening on port 9099");});


app.get('/posts', function(req,res){
    postModel.find({},null,function(err,data){
        if(err){
            console.log("error retrieving posts",err);
        }
        else{
            console.log("Sending");
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
            console.log(data);
        }
    }).exec();
});

app.post('/post', jsonParser, function(req,res){
    var password = req.body.password;
    if(password == "hej"){
        console.log(req.body);
        var newPost = new postModel(req.body);
        console.log(newPost);
        newPost.save(function(err){
            if (err) {
                return err;
            }
            else {
                console.log("Post saved");
            }    })
    }

});

