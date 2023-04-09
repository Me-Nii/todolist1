const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const port = process.env.PORT || 3000;
const _ = require("lodash");
const app = express();

require('dotenv').config({path:'vars/.env'});

const USER_INFO = process.env.USER_INFO;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Middleware to handle requests for favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// Run main function and catch error
main().catch((err) => console.log(err));
async function main() {
  //localhost ain't working because in config it's binding to 127.0.0.1 
  const url = "mongodb+srv://"+USER_INFO+"@cluster0.setymgl.mongodb.net"; 
  const dbPath = "/todolistDB";
  await mongoose.connect(url + dbPath, {
    useNewUrlParser: true,
})};

const itemsSchema = new mongoose.Schema ({
   name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
   name: "Eat"
})

const item2 = new Item ({
   name: "Sleep"
})

const item3 = new Item ({
   name: "Repeat"
})

const defaultItems = [item1, item2, item3];

// New Schema //

const listSchema = {
   name: String,
   items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

   Item.find({})
   .then(foundItem => {
     if (foundItem.length === 0) {
       return Item.insertMany(defaultItems);
     } else {
       return foundItem;
     }
   })
   .then(savedItem => {
     res.render("list", {
       listTitle: "Today",
       newListItems: savedItem
     });
   })
   .catch(err => console.log(err));
 });

app.post("/", async (req, res) => {
   try {
     const itemName = req.body.newItem;
     const listName = req.body.list;
 
     const item = new Item({
       name: itemName
     });

     if (listName === "Today") {
       await item.save();
       console.log("Item added successfully to the database.");
       res.redirect("/");
     } else {
       const foundList = await List.findOne({ name: listName });
       foundList.items.push(item);
       await foundList.save();
       console.log("Item added successfully to the custom list.");
       res.redirect("/" + listName);
     }
   } catch (err) {
     console.log(err);
   }
 });

app.get('/:customListName', async (req, res) => {
   const customListName = _.capitalize(req.params.customListName);
   try {
     const foundList = await List.findOne({ name: customListName });
     if (!foundList) {
       const list = new List({
         name: customListName,
         items: defaultItems
       });
       await list.save();
       res.redirect("/" + customListName);
     } else {
       res.render("list", {
         listTitle: foundList.name,
         newListItems: foundList.items
       });
     }
   } catch (err) {
     console.log(err);
   }
 });

app.post("/delete", async (req, res)=>{
   try {
     const checkedItemId = req.body.checkbox;
     const listName = req.body.listName;
 
     if(listName === "Today"){
       await Item.findByIdAndRemove(checkedItemId);
       console.log("Successfully deleted checked item from the database");
       res.redirect("/");
     } else {
       await List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}});
       res.redirect("/" + listName);
     }
   } catch (err) {
     console.log(err);
     res.status(500).send("An error occurred while deleting the item.");
   }
 });
 
app.get("/about", (req, res)=>{

 res.render("about");
});


// app.listen(port)
// console.log(`Listening on port ${port}.`);

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
console.log(`Listening on port ${port}.`)});