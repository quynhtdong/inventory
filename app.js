const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var _ = require('lodash');

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({encoded: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://admin-quynh:hwanbob14@cluster0.zkuuy.mongodb.net/todolistDB?retryWrites=true&w=majority', {useNewUrlParser: true});

const taskSchema = {name: String};

const Task = mongoose.model("Task", taskSchema);

const task1 = new Task({
  name: "Reading the book"
});

const task2 = new Task({
  name: "Eat the apples"
});

const task3 = new Task({
  name: "Check the mails"
});

const defaultTasks = [task1, task2, task3];

const listSchema = {
  name: String,
  tasks: [taskSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
Task.find({}, function(err, foundTasks){
  if(foundTasks.length === 0) {
    Task.insertMany(defaultTasks, function(err){
      if(err) console.log(err);
      else console.log("Successfully insert");
      res.redirect("/");
    });
  } else {
  res.render("list", {listTitle: "Today", newTasks: foundTasks});
  console.log(foundTasks); }
});

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err) {
      if(!foundList) {
      const list = new List ({
        name: customListName,
        task: defaultTasks
      });
      list.save();
      res.redirect("/" + customListName);
    }

    else {
    res.render("list", {listTitle: foundList.name, newTasks: foundList.tasks});
  }
}
  });


});

app.post("/", function(req, res){
  const item = req.body.newTask;
  const list = req.body.list;
  const newTask = new Task ({
    name: item
  });
if(list === "Today") {
  newTask.save();
  res.redirect("/");
} else {
  List.findOne({name: list}, function(err, foundList){
    foundList.tasks.push(newTask);
    foundList.save();
    res.redirect("/" + list);
  });

}
});

app.post("/delete", function(req, res){
  const checkedTaskId = req.body.checkbox;
  const list = req.body.list;

  if(list === "Today"){
    Task.findByIdAndRemove(checkedTaskId, function(err){
      if(err) console.log(err);
      else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: list}, {$pull: {tasks: {_id: checkedTaskId}}}, function(err, foundList){
      if(!err) {
        res.redirect("/" + list);
      }
    });
  }

});


app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
