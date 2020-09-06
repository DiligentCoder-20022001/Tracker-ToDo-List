//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

mongoose.connect("mongodb+srv://admin-Siddharth:Siddharth@123@cluster0.uubdj.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Competitve coding"
});

const item2 = new Item({
  name: "Web development"
});

const item3 = new Item({
  name: "Android development"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List = mongoose.model("List", listSchema);

/*Item.insertMany(defaultItems, function(err){
  if(err)
    console.log(err);
  else
    console.log("Success!!");
});*/

app.get("/", function(req, res) {




  Item.find({}, function(err, foundItems){//for finding all
    

    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
      if(err)
        console.log(err);
      else
        console.log("Success!!");
      });
      res.redirect("/");//after adding the elements it redirects so that the control block is now in else statement
    }
    else{
      res.render("list",{listTitle: "Today", newListItems: foundItems});
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    //defaultlist
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


  item.save();
  //res.redirect("/"); // to redirect to the home route


});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
//while deleting it goes back to home page. We need to prevent it
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err)
      console.log("Successfully deleted checcked item");
      res.redirect("/");
    });
  }
  else
  {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
})


//the user can dynamically create his own lists
app.get("/:customListName", function(req, res){
  const customListName =_.capitalize(req.params.customListName);
//to prevent repetition of lists on loading them again and again
  List.findOne({name: customListName}, function(err, foundList){
    if(!err)
    {
      if(!foundList){
        //creating a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //show an existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



  

})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port== null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on hte port");
});
