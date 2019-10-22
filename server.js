var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 3000;
var app = express();

app.use(bodyParser());

// Database configuration
var databaseUrl = process.env.MONGODB_URI || "frogs_db";
var collections = ["frogs"];

// Hook mongojs config to db variable
var db = mongojs(databaseUrl , collections);




// Log any mongojs errors to console
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// frogs Routes
// ======
  //documentation for mongojs:
    //https://github.com/mafintosh/mongojs

  app.get("/frogs", function(req, res) {

    //sort frogs
    // db.frogs.aggregate(
    //    [
    //      { $sort : { votes : -1 } }
    //    ], function(error, frogs){

    //     res.json(frogs);
    });

    // Find all frogs in the frogs collection
      db.frogs.find({}, function(error, frogs) {
        // Log any errors
        if (error) {
          console.log(error);
        }
      //   // Otherwise, send json of the frogs back to user
      //   // This will fire off the success function of the ajax request
      //   else {
      //     //pretend that it takes 5 seconds to get the frogs back
      //     //setTimeout(function(){
      //       res.json(frogs);
      //     //}, 5000)
      //   }
      // });
  });

  //curl -d "name=kermit&species=green" -X POST http://localhost:3000/frogs

  //curl -d "name=crazy&species=brazilian" -X POST http://localhost:3000/frogs

  /*
    db.frogs.updateOne(
            { "_id" : ObjectId("5cc2856ef7426dba8c8e4cda") },
            { $set: { "votes" : 4 } }
         );

    db.frogs.updateOne(
            { "_id" : ObjectId("5cc28583f7426dba8c8e4cdb") },
            { $set: { "votes" : 40 } }
         );  
  */

  // Handle form submission, save submission to mongo
  app.post("/frogs", function(req, res) {
    //validation here
      // req.body.species.length > 1

    // Insert the song into the frogs collection
    db.frogs.insert({votes: req.body.votes, species: req.body.species, name : req.body.name}, function(error, savedSong) {
      // Log any errors
      if (error) {
        console.log(error);
      }else {
        //the reason why we are sending the savedSong back is because we now have an _id to give to the client
        res.json(savedSong);
      }
    });
  });



  // localhost:3000/frogs/beyonce/crazy+in+love
  app.get("/frogs/:name/:species", function(req, res) {

    //one way
      res.json({
      species: req.params.species,
      name: req.params.name})

    //another way
      res.json(req.params)

  });

  //one song
  app.get("/frogs/:id", function(req, res) {
    db.frogs.findOne({
      "_id": mongojs.ObjectId(req.params.id)
    }, function(error, oneSong) {
      if (error) {
        res.send(error);
      }else {
        res.json(oneSong);
      }
    });
  });

  //update a song
  app.put("/frogs/:id", function(req, res) {
    //if we use this then we won't get the updated document back
    /*
      db.frogs.update({
        "_id": mongojs.ObjectId(req.params.id)
      }, {
        $set: {
          "name": req.body.name,
          "species": req.body.species
        }
      }, function(error, edited) {
        if (error) {
          res.send(error);
        }else {
          res.json(edited);
        }
      });
    */

    db.frogs.findAndModify({
      query: {
        "_id": mongojs.ObjectId(req.params.id)
      },
      update: { $set: {
        "name": req.body.name, "species": req.body.species }
      },
      new: true
      }, function (err, edited) {
          res.json(edited);
      });
  });


  /*  
    curl -X PUT http://localhost:3000/frogs/votes/5cc2856ef7426dba8c8e4cda/up 
  */
  // app.put("/frogs/votes/:id/:direction", function(req, res){

  //   var voteChange = 0;

  //   if (req.params.direction == 'up') voteChange = 1;
  //   else voteChange = -1;

  //   //this is wrong I want to grab the current votes and increment by 1
  //   db.frogs.findAndModify({
  //     query: {
  //       "_id": mongojs.ObjectId(req.params.id)
  //     },
  //     update: { $inc: { votes: voteChange} },
  //     new: true
  //     }, function (err, edited) {
  //         res.json(edited);
  //     });
  // });

  /*  
    curl -X DELETE http://localhost:3000/frogs/5cc288d471a416daebc0d4d6/
  */
  app.delete("/frogs/:id", function(req, res) {
    var id = req.params.id;

    db.frogs.remove({
      "_id": mongojs.ObjectID(id)
    }, function(error, removed) {
      if (error) {
        res.send(error);
      }else {
        res.json(id);
      }
    });
  });

// Listen on port 3001
  app.listen(PORT, function() {
    console.log('🌎 ==> Now listening on PORT %s! Visit http://localhost:%s in your browser!', PORT, PORT);
  });
