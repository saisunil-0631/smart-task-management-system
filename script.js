@'
const API_URL = "http://127.0.0.1:8000";
const form = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const message = document.getElementById("message");
const cancelButton = document.getElementById("cancel-button");

let editingTaskId = null;
let tasks = [];

function showMessage(text) {
    message.textContent = text;
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);

        if (!response.ok) {
            throw new Error("Could not load tasks");
        }

        const data = await response.json();
        tasks = data.tasks;
        renderTasks();
    } catch (error) {
        showMessage(error.message);
    }
}

function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        taskList.textContent = "No tasks yet. Add your first task!";
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task";

        if (task.status === "completed") {
            card.classList.add("completed");
        }

        const heading = document.createElement("h3");
        heading.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.description || "No description";

        const details = document.createElement("p");
        details.textContent =
            `Priority: ${task.priority} | Status: ${task.status} | Due: ${task.due_date || "None"}`;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editTask(task.id);

        const completeButton = document.createElement("button");
        completeButton.textContent =
            task.status === "completed" ? "Mark Pending" : "Complete";
        completeButton.onclick = () => toggleStatus(task);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "danger";
        deleteButton.onclick = () => deleteTask(task.id);

        actions.append(editButton, completeButton, deleteButton);
        card.append(heading, description, details, actions);
        taskList.appendChild(card);
    });
}

function getFormData() {
    return {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value,
        due_date: document.getElementById("due-date").value || null
    };
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const task = getFormData();

    const url = editingTaskId === null
        ? `${API_URL}/tasks`
        : `${API_URL}/tasks/${editingTaskId}`;

    const method = editingTaskId === null ? "POST" : "PUT";

    try {
        const response = await fetch(url, {
            method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error("Could not save task");
        }

        resetForm();
        showMessage("Task saved successfully!");
        await loadTasks();
    } catch (error) {
        showMessage(error.message);
    }
});

function editTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;

    editingTaskId = id;

    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description || "";
    document.getElementById("priority").value = task.priority;
    document.getElementById("status").value = task.status;
    document.getElementById("due-date").value = task.due_date || "";

    document.getElementById("form-heading").textContent = "Edit Task";
    document.getElementById("save-button").textContent = "Update Task";
    cancelButton.hidden = false;

    window.scrollTo({top: 0, behavior: "smooth"});
}

async function toggleStatus(task) {
    const updatedTask = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status === "completed" ? "pending" : "completed",
        due_date: task.due_date
    };

    try {
        const response = await fetch(`${API_URL}/tasks/${task.id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) throw new Error("Could not update status");

        await loadTasks();
    } catch (error) {
        showMessage(error.message);
    }
}

async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Could not delete task");

        if (editingTaskId === id) resetForm();

        showMessage("Task deleted successfully!");
        await loadTasks();
    } catch (error) {
        showMessage(error.message);
    }
}

function resetForm() {
    form.reset();
    editingTaskId = null;
    document.getElementById("form-heading").textContent = "Add New Task";
    document.getElementById("save-button").textContent = "Add Task";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", resetForm);

loadTasks();
'@ | Set-Content -Path "frontend\script.js" -Encoding UTF8