const express = require("express");
const fs = require("fs");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/tododb", { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
//creating a schema
const todoSchema = new mongoose.Schema({
  todoText: String,
  pic: { filename: String, path: String },
  isComplete: Boolean,
});
// create a model for schema
const TodoModel = mongoose.model("TodoList", todoSchema);

//dest:or storage: where to upload the files
// const upload = multer({ dest: "public/" });
const storage = multer.diskStorage({
  // The disk storage engine gives full control on storing files to disk
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
app.use(express.json());
app.use(upload.single("todoImg"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/styles.css", (req, res) => {
  res.sendFile(__dirname + "/styles.css");
});
app.get("/script.js", (req, res) => {
  res.sendFile(__dirname + "/script.js");
});
//POST request
app.post("/todo", async (req, res) => {
  if (!req.file) {
    console.log("no file");
    return;
  }
  pic = { filename: req.file.filename, path: req.file.path };
  const todo = new TodoModel({
    todoText: req.body.task,
    pic: pic,
    isComplete: false,
  });
  try {
    await todo.save();
    res.status(200).json(todo);
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.get("/todo-data", async function (req, res) {
  //read the data from database and send data as res
  try {
    const data = await TodoModel.find({});
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.put("/update", async function (req, res) {
  try {
    const updId = req.body.id;
    const complete = req.body.isComplete;
    //find the todo with updId to modify its status
    await TodoModel.updateOne({ _id: updId }, { isComplete: complete });
    res.status(200).send("Todo status changed");
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.delete("/delete", async function (req, res) {
  try {
    const delId = req.body.id;
    //read the db to FIND the path of pic to be deleted in order to delete from public folder as well
    const delRecord = await TodoModel.findOne({ _id: delId });
    const path = delRecord.pic.path;
    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("File deleted successfully");
      }
    });
    //delete the todo from db
    await TodoModel.deleteOne({ id: delId });
    res.status(200).json({ msg: "Deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
