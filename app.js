
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const items = ["Buy food", "Cook food", "Skip gym", "Eat food"];
const workItems = ["Do Udemy", "Class", "More Udemy", "More Class"];

app.get("/", function(req, res) {


    const day = date.getDay();

    res.render("list", {
        listTitle: day,
        newListItems: items
    });
});

app.post("/", function(req, res) {

    const item = req.body.newItem;
    console.log(req.body);
    if (req.body.list === "Work"){
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }


});

app.get("/work", function(req,res){
    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems
    });
});

app.get("/about", function(req,res){
    res.render("about");
})


app.listen(3000, function() {
    console.log("server running on port 3000");
});
