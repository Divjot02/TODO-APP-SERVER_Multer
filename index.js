const express = require("express");
const fs = require("fs");
const app = express();
const multer = require("multer");
// Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.

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
function readAllTodos(callback) {
  fs.readFile("./store.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    if (data.length === 0) {
      data = "[]";
    }

    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}
function saveTodoInFile(todo, callback) {
  fs.writeFile("./store.json", JSON.stringify(todo), function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null);
  });
}

app.post("/todo", (req, res) => {
  if (req.body.task.trim() !== "") {
    if (!req.file) {
      console.log("nofile");
      return;
    }
    const pic = { filename: req.file.filename, path: req.file.path };
    const todo = {
      todoText: req.body.task,
      id: Date.now().toString(),
      isComplete: false,
      pic: pic,
    };
    // console.log(todo);
    readAllTodos(function (err, data) {
      if (err) {
        res.status(500).send("error");
        return;
      }
      data.push(todo);

      saveTodoInFile(data, function (err) {
        if (err) {
          res.status(500).send("error");
          return;
        }
        //send this object
        res.status(200).json(todo);
        // res.redirect("/");
      });
    });
  }
});

app.get("/todo-data", function (req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(data);
  });
});
app.put("/update", function (req, res) {
  const updId = req.body.id;
  const complete = req.body.isComplete;
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    //find the todo with id to modify its status
    const updateddata = data.find((d) => d.id === updId);

    updateddata.isComplete = complete;
    //save the modified data into file
    saveTodoInFile(data, (err) => {
      if (err) {
        res.status(500).send("error");
        return;
      }

      res.status(200).send("Todo status changed");
    });
  });
});
app.delete("/delete", function (req, res) {
  const delId = req.body.id;
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    //delete from publicfolder as well
    const delRecord = data.find((d) => d.id === delId);
    const path = delRecord.pic.path;
    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("File deleted successfully");
      }
    });
    //get the data after deletion
    const updateddata = data.filter((d) => d.id !== delId);
    //save this into file
    saveTodoInFile(updateddata, (err) => {
      if (err) {
        res.status(500).send("error");
        return;
      }

      res.status(200).send("Todo deleted");
    });
  });
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
