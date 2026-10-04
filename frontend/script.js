
const API_URL = "https://YOUR-RENDER-URL.onrender.com/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

// Get and display all tasks
async function getTasks() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load tasks");
    }

    const tasks = await response.json();
    taskList.innerHTML = "";

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-card";

      const title = document.createElement("h3");
      title.textContent = task.title;

      const description = document.createElement("p");
      description.className = "task-description";
      description.textContent = task.description || "";

      const status = document.createElement("p");
      status.textContent = task.completed ? "Completed" : "Pending";
      status.className = task.completed ? "completed" : "pending";

      taskElement.appendChild(title);
      taskElement.appendChild(description);
      taskElement.appendChild(status);

      // Edit button
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "edit-button";

      editButton.addEventListener("click", () => {
        showEditForm(task, taskElement);
      });

      taskElement.appendChild(editButton);

      // Mark as Completed button
      if (!task.completed) {
        const completeButton = document.createElement("button");
        completeButton.textContent = "Mark as Completed";
        completeButton.className = "complete-button";

        completeButton.addEventListener("click", () => {
          markAsCompleted(task._id);
        });

        taskElement.appendChild(completeButton);
      }

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-button";

      deleteButton.addEventListener("click", () => {
        deleteTask(task._id);
      });

      taskElement.appendChild(deleteButton);
      taskList.appendChild(taskElement);
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

// Show the edit form for a task
function showEditForm(task, taskElement) {
  // Avoid showing multiple edit forms in one card
  if (taskElement.querySelector(".edit-form")) {
    return;
  }

  const editForm = document.createElement("form");
  editForm.className = "edit-form";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = task.title;
  titleInput.placeholder = "Task title";
  titleInput.required = true;

  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.value = task.description || "";
  descriptionInput.placeholder = "Task description";

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.textContent = "Save Changes";
  saveButton.className = "save-button";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.className = "cancel-button";

  cancelButton.addEventListener("click", () => {
    editForm.remove();
  });

  editForm.appendChild(titleInput);
  editForm.appendChild(descriptionInput);
  editForm.appendChild(saveButton);
  editForm.appendChild(cancelButton);

  taskElement.appendChild(editForm);

  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedTitle = titleInput.value.trim();
    const updatedDescription = descriptionInput.value.trim();

    if (!updatedTitle) {
      titleInput.focus();
      return;
    }

    await updateTask(task._id, {
      title: updatedTitle,
      description: updatedDescription,
      completed: task.completed
    });
  });
}

// Update a task
async function updateTask(taskId, updatedData) {
  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      throw new Error("Could not update task");
    }

    await getTasks();
  } catch (error) {
    console.error("Error updating task:", error);
    alert("Could not update task. Please try again.");
  }
}

// Add a new task
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title) return;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error("Could not add task");
    }

    taskForm.reset();
    await getTasks();
  } catch (error) {
    console.error("Error adding task:", error);
    alert("Could not add task. Please try again.");
  }
});

// Mark a task as completed
async function markAsCompleted(taskId) {
  await updateTask(taskId, { completed: true });
}

// Delete a task
async function deleteTask(taskId) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Could not delete task");
    }

    await getTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
    alert("Could not delete task. Please try again.");
  }
}

// Load tasks when the page opens
getTasks();
