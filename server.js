const express = require("express");
const app = express()
const PORT = 3000;
const path = require("path")
const hbs = require('express-handlebars');

let toEdit = ""

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ 
    defaultLayout: 'main.hbs',
    helpers: { 
        isToEdit: (id) =>{
            return (toEdit == id && toEdit !="" )? false : true
        },
        isEditingRn:(text) =>{
            return  (text = "true" )? true : false
        }
    },
    extname: '.hbs',
    partialsDir: "views/partials"
}));   
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
  }));

const Datastore = require('nedb');
const coll = new Datastore({
    filename: 'data/nosql.db',
    autoload: true
});


app.get("/", function (req, res) {
    res.render('index.hbs',{title:"CAR SERVICE"});   
})

app.get("/add", function (req, res) {
    res.render('add.hbs',{isSumbited:false});   
})
app.get("/edit", function (req, res) {
    toEdit = ""
    coll.find({ }, function (err, docs) {
        res.render('edit.hbs',{list: docs, title:"edit / upgrade cars",isEditing:1});   
    });
})

app.get("/list", function (req, res) {
    coll.find({ }, function (err, docs) {
        res.render('list.hbs',{list: docs, title:"cars list"});   
    });

})

app.post("/sumbitEditing",function (req, res) {
    coll.findOne({ _id:req.body["submitEd"]}, function (err, doc) {
        toEdit = ""
        let obj = {
            "insured": req.body["ubezpieczony"],
            "petrol": req.body["benzyna"],
            "damaged": req.body["uszkodzony"],
            "drive": req.body["naped"]
        }
        coll.update({_id:req.body["submitEd"]}, {$set: obj}, {}, function (err, numReplaced) {
            coll.find({ }, function (err, docs) {
                res.render('edit.hbs',{list: docs, title:"edit / upgrade cars",isEditing:1});   
            });
        });

    })


})
app.post("/editInList",function (req, res) {
    coll.findOne({ _id:req.body["toEdit"]}, function (err, doc) {
        toEdit = doc._id
        coll.find({ }, function (err, docs) {
            res.render('edit.hbs',{list: docs, title:"edit / upgrade cars",isEditing:0});   
        });
    });
 
})
app.post("/removeFromList",function (req, res) {
    coll.remove({ _id:req.body["toDel"] }, {}, function (err, numRemoved) {
        coll.find({ }, function (err, docs) {
            res.render('list.hbs',{list: docs, title:"cars list"});  
        });
    });

})

app.post("/addToElements", function (req, res) {
    let obj = {
        "insured": (Object.keys(req.body).includes("ubezpieczony")) ? "TAK" : "NIE",
        "petrol": (Object.keys(req.body).includes("benzyna")) ? "TAK" : "NIE",
        "damaged": (Object.keys(req.body).includes("uszkodzony")) ? "TAK" : "NIE",
        "drive":(Object.keys(req.body).includes("4x4")) ? "TAK" : "NIE",
    }

    coll.insert(obj, function (err, doc) {
        res.render('add.hbs',{isSumbited:true, value: doc._id });  
    });
})

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})
