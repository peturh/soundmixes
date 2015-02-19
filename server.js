var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var mongoose = require("mongoose");
var formidable = require('formidable');
var bodyparser = require('body-parser');
var jsonParser = bodyparser.json();
var Schema = mongoose.Schema;
var dir = "src";
var uploadDir ="./"+dir+"/music";
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
app.listen('9099',"192.168.0.6",function(){console.log("App listening on port 9099");});

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

app.post('/delete', jsonParser, function(req,res){

    console.log("trying to delete");
    console.log(req.body._id);
    postModel.remove({_id : req.body._id}, function(err){
        if(err){
            throw err;
        }
        else{
            res.setHeader('Content-Type', 'application/json');
            res.send()
        }
    });

});

app.post('/uploadfile', function(req, res) {

    var form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.parse(req, function(err, fields, files) {
        var object = JSON.parse(fields.myObj);
        var original = object.title;
        var newly = files.file.path;
        renameFile(newly,original);

        if(object.password !== password){
            fs.unlink("./src/music/"+original+".mp3",function(err) {
                if (err) throw err;
                console.log("Wrong password, file deleted.");
                res.writeHead(405, "Failure", {'Content-Type': 'text/html'});
                res.end();
            })
        }
        else{
            saveToDb(fields.myObj);
            res.writeHead(200, "OK", {'Content-Type': 'text/html'});
            res.end();
         }
    });
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


