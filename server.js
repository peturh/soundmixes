var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty({uploadDir : "./src/music"});
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var password = "hej";

mongoose.connect("mongodb://localhost:27017/cedricMusic");

var postSchema = new Schema({
    fileName : String,
    title : String,
    description : String,
    date: {type : Date,
          default: Date.now
    }
});

var postModel = mongoose.model('post', postSchema);

app.use(express.static(path.join(__dirname, '/src/')));
app.listen('9099',function(){console.log("App listening on port 9099");});

app.get('/posts', function(req,res){
    postModel.find({},null,function(err,data){
        if(err){
            console.log("Error retrieving posts",err);
        }
        else{
            console.log("Sending all posts from database to: " + req.connection.remoteAddress);
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
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
            }}
        )
    }
});

app.post('/uploadfile', multipartyMiddleware, function(req, res) {
    var object = JSON.parse(req.body.myObj);
    var newly = req.files.file.path;
    var orignal = object.title;
    console.log("the file orignal",orignal);
    console.log("Retrieving file...");
    renameFile(newly,orignal);

    if(object.password !== password){
        fs.unlink(orignal,function(err){
            if(err) throw err;
            console.log("Wrong password, file deleted.");
        })
    }
    else{
        console.log("Correct password, saving to DB.");
        saveToDb(req.body.myObj);
    }
});

var renameFile = function(newly,orignal){
    console.log("Renaming file...");
    console.log("Done!");
    fs.rename(newly,"./src/music/"+orignal+".mp3",function(err){
        if(err) throw err;
    });
};

var saveToDb = function(object){
    console.log("Saving post to database...");

    var newPost = new postModel(JSON.parse(object));
    console.log(newPost);
    newPost.save(function(err){
            if (err) {
                return err;
            }
            else {
                console.log("Saved post:",newPost);
            }
        }
    )
};

