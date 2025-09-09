// ✅ Backend API base
const API_BASE = "/api";  // works since index.html is served by Spring Boot

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...options.headers,
  };
  const res = await fetch(API_BASE + path, { ...options, headers });
  return res.json();
}

// ✅ Login
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API_BASE + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    showTodoSection();
  } else {
    document.getElementById("auth-message").innerText = "Invalid login!";
  }
}

// ✅ Register
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API_BASE + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    document.getElementById("auth-message").innerText = "User registered! Please login.";
  } else {
    const err = await res.text();
    document.getElementById("auth-message").innerText = err;
  }
}

// ✅ Show Todo Section
function showTodoSection() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("todo-section").style.display = "block";
  document.getElementById("user-name").innerText = localStorage.getItem("username");
  loadTasks();
}

// ✅ Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.clear();
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("todo-section").style.display = "none";
});

// ✅ Add Task
document.getElementById("add-task-btn").addEventListener("click", async () => {
  const task = document.getElementById("task-input").value;
  if (!task) return;

  await fetch(API_BASE + "/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title: task }),
  });

  document.getElementById("task-input").value = "";
  loadTasks();
});

// ✅ Load Tasks (Updated with Edit functionality)
async function loadTasks() {
  const res = await fetch(API_BASE + "/todos", { headers: authHeaders() });
  if (res.ok) {
    const tasks = await res.json();
    const list = document.getElementById("task-list");
    list.innerHTML = "";
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="task-content">
          <span class="task-title" id="title-${task.id}">${task.title}</span>
          <input type="text" class="edit-input" id="edit-${task.id}" value="${task.title}" style="display:none;">
        </div>
        <div class="task-actions">
          <button class="edit-btn" onclick="toggleEdit(${task.id})">Edit</button>
          <button class="save-btn" id="save-${task.id}" onclick="saveTask(${task.id})" style="display:none;">Save</button>
          <button class="cancel-btn" id="cancel-${task.id}" onclick="cancelEdit(${task.id})" style="display:none;">Cancel</button>
          <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      `;
      li.className = "task-item";
      list.appendChild(li);
    });
  }
}

// ✅ Toggle Edit Mode
function toggleEdit(id) {
  const titleSpan = document.getElementById(`title-${id}`);
  const editInput = document.getElementById(`edit-${id}`);
  const editBtn = document.querySelector(`li:has(#title-${id}) .edit-btn`);
  const saveBtn = document.getElementById(`save-${id}`);
  const cancelBtn = document.getElementById(`cancel-${id}`);

  // Hide title and edit button, show input and save/cancel buttons
  titleSpan.style.display = "none";
  editInput.style.display = "inline-block";
  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
  cancelBtn.style.display = "inline-block";

  // Focus on the input and select all text
  editInput.focus();
  editInput.select();
}

// ✅ Cancel Edit Mode
function cancelEdit(id) {
  const titleSpan = document.getElementById(`title-${id}`);
  const editInput = document.getElementById(`edit-${id}`);
  const editBtn = document.querySelector(`li:has(#title-${id}) .edit-btn`);
  const saveBtn = document.getElementById(`save-${id}`);
  const cancelBtn = document.getElementById(`cancel-${id}`);

  // Reset input to original value
  editInput.value = titleSpan.textContent;

  // Show title and edit button, hide input and save/cancel buttons
  titleSpan.style.display = "inline";
  editInput.style.display = "none";
  editBtn.style.display = "inline-block";
  saveBtn.style.display = "none";
  cancelBtn.style.display = "none";
}

// ✅ Save Task (Updated)
async function saveTask(id) {
  const newTitle = document.getElementById(`edit-${id}`).value.trim();

  if (!newTitle) {
    alert("Task title cannot be empty!");
    return;
  }

  const res = await fetch(API_BASE + `/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title: newTitle })
  });

  if (res.ok) {
    loadTasks(); // Reload tasks to reflect changes
  } else {
    alert("Error updating task");
  }
}

// ✅ Delete Task
async function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    await fetch(API_BASE + `/todos/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadTasks();
  }
}

// ✅ Event Listeners
document.getElementById("login-btn").addEventListener("click", (e) => {
  e.preventDefault();
  login();
});

document.getElementById("register-btn").addEventListener("click", (e) => {
  e.preventDefault();
  register();
});

// ✅ Handle Enter key for edit inputs (optional enhancement)
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList.contains("edit-input")) {
    const id = e.target.id.replace("edit-", "");
    saveTask(id);
  }
  if (e.key === "Escape" && e.target.classList.contains("edit-input")) {
    const id = e.target.id.replace("edit-", "");
    cancelEdit(id);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (token && username) {
    // User is already logged in, show todo section directly
    showTodoSection();
  }
});