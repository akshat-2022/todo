//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
var port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://akshatsharma851:test123@cluster0.47ckhe1.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Cook Food"
});
const item2 = new Item({
  name: "Read Book"
});
const item3 = new Item({
  name: "Play GTA V"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems);
async function getItems(){
const items = await Item.find({});
return items;
}

app.get("/", function(req, res) {

  getItems().then(function(items){
      if(items.length === 0){

      Item.insertMany(defaultItems);
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
  // Item.find(function(err, items){
  //   if(items.length === 0){
  //   console.log(items);
  //   Item.insertMany(defaultItems);
  //   res.redirect("/");
  // } else{
  //   res.render("list", {listTitle: "Today", newListItems: items});
  // }
  // });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save()
      res.redirect("/" + listName);

    });
  }



});

app.post("/delete", function(req,res){
  const itemChecked = req.body.box;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(itemChecked, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Done!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemChecked}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else{
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
  });



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
