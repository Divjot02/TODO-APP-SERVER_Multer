const formNode = document.getElementById("task-form");
const inputNode = document.getElementById("task-input");
const showNode = document.getElementById("show-item");

//when item is submitted

formNode.addEventListener("submit", (e) => {
  e.preventDefault();
  const todoText = inputNode.value;
  if (todoText.trim() == "") {
    alert("Please enter a TODO");
    return;
  }

  //key/value pairs, keys will be the names of the form fields
  const formData = new FormData(formNode);
  inputNode.value = "";
  //send a POST request
  fetch("/todo", {
    method: "POST",
    body: formData,
  })
    .then(function (response) {
      if (response.status === 200) {
        //the received object
        return response.json();
      } else {
        alert("something weird happened");
      }
    })
    .then(function (todo) {
      showTodoInUI(todo);
    });
  // }
});
//make request to get data when page refreshes
//get request is made without specifying the method
fetch("/todo-data")
  .then(function (response) {
    if (response.status === 200) {
      //the received object
      return response.json();
    } else {
      alert("something weird happened");
    }
  })
  .then(function (todos) {
    //hrr todo ke liye call hoga function
    todos.forEach(function (todo) {
      showTodoInUI(todo);
    });
  });

//create the DOM structure and add desired event listeners
function showTodoInUI(todo) {
  const todoDiv = document.createElement("div");
  todoDiv.setAttribute("id", todo._id);
  todoDiv.classList.add("items");
  const todoTextNode = document.createElement("span");
  const todoImgNode = document.createElement("img");
  const checkbox = document.createElement("input");
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn");

  checkbox.type = "checkbox";
  if (todo.isComplete) {
    todoTextNode.classList.add("complete");
    checkbox.checked = true;
  }
  todoTextNode.innerText = todo.todoText;
  todoImgNode.setAttribute("src", todo.pic.filename);
  todoImgNode.setAttribute("height", "50px");
  todoImgNode.setAttribute("width", "50px");
  deleteButton.innerText = "x";
  // when click on checkbox
  checkbox.addEventListener("click", function (e) {
    //PUT request bhjenge
    const checkId = e.target.parentElement.id;
    const isComplete = false;
    if (checkbox.checked) {
      //if after clicking the checkbox is CHECKED means we want to mark it as COMPLETED
      updateById(checkId, !isComplete); // pass id and true
    } else {
      //if after clicking the checkbox is NOT CHECKED means we want to mark it as NOT COMPLETED
      updateById(checkId, isComplete); // pass id and false
    }
  });
  // when click on delete button
  deleteButton.addEventListener("click", function (e) {
    const deleteId = e.target.parentElement.id;
    //DELETE request bhjenge
    deleteById(deleteId);
  });

  todoDiv.appendChild(todoTextNode);
  todoDiv.appendChild(todoImgNode);
  todoDiv.appendChild(checkbox);
  todoDiv.appendChild(deleteButton);
  showNode.appendChild(todoDiv);
}

function updateById(checkId, isComplete) {
  fetch("/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: checkId, isComplete }),
  })
    .then(function (response) {
      if (response.status !== 200) {
        throw new Error("failed to modify status");
      }
    })
    .then(function () {
      const item = document.getElementById(checkId);
      const itemText = item.querySelector("span");
      itemText.classList.toggle("complete");
    })
    .catch(function (err) {
      alert(err);
    });
}
function deleteById(deleteId) {
  fetch("/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: deleteId }),
  })
    .then(function (response) {
      if (response.status !== 200) {
        throw new Error("failed to delete");
      }
    })
    .then(function () {
      const item = document.getElementById(deleteId);
      item.remove();
    })
    .catch(function (err) {
      alert(err);
    });
}
