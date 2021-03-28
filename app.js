
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = {
    name: String
}
const Item =  mongoose.model("Item", itemSchema);

const item1 = new Item({name: "<-- remove Item"});
const item2 = new Item( {name: "Add Item v"});
const defaultItems = [item1, item2];

const listSchema = {
    name: String,
    items: [itemSchema]
}
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
    const listNames = [];
    List.find({}, function(err, foundLists){
        if (err){
            console.log(err);
        } else {
            if (foundLists.length){
                for (let i = 0; i < foundLists.length; i++){
                    listNames.push(foundLists[i].name);
                }
            }
        }
        completedTask(function(){
            const items = []
            Item.find({}, function(err, foundItems){
                if (foundItems.length === 0){
                    Item.insertMany(defaultItems, function(err){
                        if (err){
                            console.log(err);
                        } else{
                            console.log("Successfully saved items to DB.");
                        }
                    });
                    res.redirect("/");
                } else {
                    res.render("list", {listTitle: "Today", newListItems: foundItems, lists: listNames});
                }

            });
        });
    });
});


app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({name: itemName});

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save(function(err, result){
                res.redirect("/" + listName);
            });
        });
    }
});


app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if (!err){
                console.log("Item successfully removed!");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
            if (!err){
                res.redirect("/" + listName);
            }
        });
    }
});


function completedTask(_callback){
    _callback();
}


app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    const listNames = [];

    List.find({}, function(err, foundLists){
        if (err){
            console.log(err);
        } else {
            if (foundLists.length){
                for (let i = 0; i < foundLists.length; i++){
                    listNames.push(foundLists[i].name);
                }
            }
        }
        completedTask(function(){
            if (!(req.params.customListName === "favicon.ico")) {
                List.findOne({name: customListName}, function(err, foundList){
                    if (!err){
                        if (!foundList){
                            const list = new List({
                            name: customListName,
                            items: defaultItems
                            });
                            list.save(function(err, result){
                                res.redirect("/" + customListName);
                            });
                        } else {
                            res.render("list", {listTitle: foundList.name, newListItems: foundList.items, lists: listNames});
                        }
                    }
                });
            }
        });
    });

});


app.post("/gotolist", function(req, res) {
    const listName = req.body.searchBar;
    if (listName === "Today"){
        res.redirect("/");
    } else{
        res.redirect("/"+listName);
    }
});


app.listen(3000, function() {
    console.log("server running on port 3000");
});
