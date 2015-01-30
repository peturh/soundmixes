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
    Id: Number,
    Title : String,
    Content : String,
    Date: {
        type: Date,
        default: Date.now
    },
    Path : String,
    MetaData : String
});

var postModel = mongoose.model('post', postSchema);


app.use(express.static(path.join(__dirname, '/src/')));
app.listen('9099',function(){console.log("App listening on port 9099");});


app.get('/posts', function(req,res){
    console.log("hej hej");
    postModel.find({},null,function(err,data){
        if(err){
            console.log("error retrieving posts",err);
        }
        else{
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    }).exec();
});

app.post('/post', jsonParser, function(req,res){
    console.log(req.body);
    console.log("denna körs");
});

