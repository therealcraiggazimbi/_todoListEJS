//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Connect to db

mongoose.connect("<dblink/database>", {
  useNewUrlParser: true,
});

//Creating New Schema

const itemsSchema = {
  name: {
    type: String,
    required: [true, "Please check your items list entry form"],
  },
};

const Item = mongoose.model("Item", itemsSchema);

// default items
const item1 = new Item({
  name: "Welcome to your todo-list",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delet an item.",
});

const _defaultItems = [item1, item2, item3];
//end default items

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, (err, results) => {
    if (results.length == 0) {
      Item.insertMany(_defaultItems, (err) => {
        if (err) return console.log("Huge erro");
        console.log("Items added");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: results });
    }
  });
});

app.get("/:customLisName", (req, res) => {
  const customeListName = req.params.customLisName.toLocaleUpperCase();
  List.findOne({ name: customeListName }, (err, results) => {
    if (!err) {
      if (!results) {
        //Create new list
        const list = new List({
          name: customeListName,
          items: _defaultItems,
        });

        list.save();
        res.redirect("/" + customeListName);
      } else {
        //Show existing list

        res.render("list", {
          listTitle: results.name,
          newListItems: results.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, results) => {
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) return console.log(err);
      console.log("Item deleted");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, results) => {
        if (err) return console.log(err);
        console.log("Item deleted");
        res.redirect("/" + listName);
      }
    );
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

// app.get("/about", function (req, res) {
//   res.render("about");
// });
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
