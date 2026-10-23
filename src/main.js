import "./style.css";
document.querySelector("#app").innerHTML = `
  <main class="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
    <header class="mb-8 flex items-start justify-between gap-4">
      <div>
        <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-700">
          Your study space
        </p>
        <h1 class="text-4xl font-bold tracking-tight text-slate-900">StudySprint</h1>
        <p class="mt-2 text-slate-600">Make room for focused work.</p>
      </div>
      <button
        id="theme-toggle"
        type="button"
        class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        aria-label="Switch color theme"
      >
        Dark mode
      </button>
    </header>

    <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      aria-labelledby="tasks-heading">
      <h2 id="tasks-heading" class="text-xl font-semibold text-slate-900">Your tasks</h2>

      <form id="task-form" class="mt-5 flex flex-col gap-3 sm:flex-row">
        <label class="sr-only" for="task-input">New study task</label>
        <input
          id="task-input"
          name="task"
          type="text"
          placeholder="e.g. Review biology notes"
          class="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 focus-visible:outline-2 focus-visible:outline-indigo-600"
        />
        <button class="min-h-12 rounded-xl bg-indigo-700 px-5 font-semibold text-white hover:bg-indigo-800">
          Add task
        </button>
      </form>
      <p id="form-message" class="mt-2 min-h-5 text-sm text-rose-700" aria-live="polite"></p>

      <label class="sr-only" for="search-input">Search tasks</label>
      <input
        id="search-input"
        type="search"
        placeholder="Search your tasks"
        class="mt-5 min-h-12 w-full rounded-xl border border-slate-300 px-4 focus-visible:outline-2 focus-visible:outline-indigo-600"
      />

      <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <nav class="flex gap-2" aria-label="Filter tasks">
          <button type="button" data-filter="all" aria-pressed="true">All</button>
          <button type="button" data-filter="active" aria-pressed="false">Active</button>
          <button type="button" data-filter="completed" aria-pressed="false">Completed</button>
        </nav>
        <p id="task-count" class="text-sm text-slate-600">0 tasks left</p>
      </div>

      <ul id="task-list" class="mt-2 divide-y divide-slate-100" aria-label="Study tasks"></ul>
      <p id="empty-state" class="py-10 text-center text-slate-500">
        A clear desk, a clear mind. Add your first study task to get started.
      </p>

      <div class="mt-4 flex justify-end">
        <button id="clear-completed" type="button" class="text-sm font-semibold underline underline-offset-4">
          Clear completed
        </button>
      </div>
    </section>
  </main>
`;
const TASKS_STORAGE_KEY = 'studySprint.tasks';
const FILTER_STORAGE_KEY = 'studySprint.filter';
let tasks = loadTasks();
let editingTaskId = null;
let activeFilter = loadFilter();

const filterNav = document.querySelector('nav[aria-label="Filter tasks"]');
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const formMessage = document.querySelector("#form-message");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const clearCompletedButton = document.querySelector('#clear-completed');

// Load saved tasks, or use an empty array if nothing has been saved yet.
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

    if (savedTasks === null) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch {
    return [];
  }
}

// Save the current tasks in the browser.
function saveTasks() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
// Load the saved filter, or use All if it is missing or invalid.
function loadFilter() {
  const savedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
  const validFilters = ['all', 'active', 'completed'];

  return validFilters.includes(savedFilter) ? savedFilter : 'all';
}

// Save the currently selected filter in the browser.
function saveFilter() {
  localStorage.setItem(FILTER_STORAGE_KEY, activeFilter);
}


// Draw the task list and count from the current state.
function render() {
  taskList.replaceChildren();
  const visibleTasks = getVisibleTasks();

  for (const task of visibleTasks) {
    const item = document.createElement("li");
    item.className = "flex items-center gap-3 py-4";

    if (task.id === editingTaskId) {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = task.text;
      editInput.dataset.action = "edit-input";
      editInput.dataset.id = task.id;
      editInput.setAttribute("aria-label", `Edit "${task.text}"`);
      editInput.className =
        "min-h-11 min-w-0 flex-1 rounded-xl border border-indigo-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600";

      item.append(editInput);
      taskList.append(item);
      editInput.focus();
      continue;
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";
    checkbox.dataset.id = task.id;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" complete`);

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.className = task.completed
      ? "text-slate-500 line-through"
      : "text-slate-800";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.dataset.id = task.id;
    editButton.setAttribute("aria-label", `Edit "${task.text}"`);
    editButton.className =
      "rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = task.id;
    deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
    deleteButton.className =
      "rounded-lg px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-indigo-600";

    item.append(checkbox, taskText, editButton, deleteButton);
    taskList.append(item);
  }

  const baseClasses =
  'rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

for (const button of filterNav.querySelectorAll('[data-filter]')) {
  const isSelected = button.dataset.filter === activeFilter;

  button.setAttribute('aria-pressed', String(isSelected));
  button.className = isSelected
    ? `${baseClasses} bg-indigo-100 text-indigo-800`
    : `${baseClasses} text-slate-600 hover:bg-slate-100`;
}

  emptyState.hidden = visibleTasks.length > 0;

if (visibleTasks.length === 0) {
  emptyState.textContent =
    tasks.length === 0
      ? 'A clear desk, a clear mind. Add your first study task to get started.'
      : `No ${activeFilter} tasks right now.`;
}

  const remaining = tasks.filter((task) => !task.completed).length;
  const noun = remaining === 1 ? "task" : "tasks";
  taskCount.textContent = `${remaining} ${noun} left`;
}

// Validate the form and add a new task to state.
function addTask(event) {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (text.length === 0) {
    formMessage.textContent = "Please enter a task.";
    return;
  }

  if (text.length > 100) {
    formMessage.textContent = "Tasks must be 100 characters or fewer.";
    return;
  }

  tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });
  saveTasks();

  formMessage.textContent = "";
  taskForm.reset();
  render();
}
// Update the task's completion state when its checkbox changes.
function handleTaskChange(event) {
  const checkbox = event.target;

  if (!(checkbox instanceof HTMLInputElement)) {
    return;
  }

  if (checkbox.dataset.action !== "toggle") {
    return;
  }

  const task = tasks.find((item) => item.id === checkbox.dataset.id);

  if (!task) {
    return;
  }

  task.completed = checkbox.checked;
  saveTasks()
  render();
}

// Handle Edit and Delete button clicks for the task list.
function handleTaskClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const task = tasks.find((item) => item.id === button.dataset.id);

  if (!task) {
    return;
  }

  if (button.dataset.action === 'edit') {
    editingTaskId = task.id;
    render();
    return;
  }

  if (button.dataset.action !== 'delete') {
    return;
  }

  if (!window.confirm(`Delete "${task.text}"?`)) {
    return;
  }

  tasks = tasks.filter((item) => item.id !== task.id);
  saveTasks()
  render();
}

// Save an edit with Enter or cancel it with Escape.
function handleTaskKeydown(event) {
  const editInput = event.target;

  if (
    !(editInput instanceof HTMLInputElement) ||
    editInput.dataset.action !== 'edit-input'
  ) {
    return;
  }

  if (event.key === 'Escape') {
    editingTaskId = null;
    formMessage.textContent = '';
    render();
    return;
  }

  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();

  const text = editInput.value.trim();

  if (text.length === 0) {
    formMessage.textContent = 'Task text cannot be empty.';
    editInput.focus();
    return;
  }

  if (text.length > 100) {
    formMessage.textContent = 'Tasks must be 100 characters or fewer.';
    editInput.focus();
    return;
  }

  const task = tasks.find((item) => item.id === editInput.dataset.id);

  if (!task) {
    return;
  }

  task.text = text;
  editingTaskId = null;
  formMessage.textContent = '';
  saveTasks()
  render();
}

// Return tasks that match the selected filter.
function getVisibleTasks() {
  if (activeFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (activeFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

// Change the selected filter when a filter button is clicked.
function handleFilterClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest('[data-filter]');

  if (!button) {
    return;
  }

  activeFilter = button.dataset.filter;
  saveFilter()
  render();
}

// Remove completed tasks from state, then redraw the list.
function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks()
  render();
}

// Listen for form submissions, including pressing Enter.
taskForm.addEventListener("submit", addTask);
taskList.addEventListener("change", handleTaskChange);
taskList.addEventListener("click", handleTaskClick);
taskList.addEventListener('keydown', handleTaskKeydown);
filterNav.addEventListener('click', handleFilterClick);
clearCompletedButton.addEventListener('click', clearCompleted);
render();
