const baseUrl = 'http://localhost:5000';
let token = '';

// Login function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${baseUrl}/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
        token = result.token;
        document.querySelector('.auth-section').style.display = 'none';
        document.querySelector('.todo-section').style.display = 'block';
        fetchTodos();
    } else {
        alert(result.message);
    }
}

// Sign up function
async function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = prompt('Enter your name:');

    const response = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
    });

    const result = await response.json();
    alert(result.message);
}

// Fetch all todos
async function fetchTodos() {
    const response = await fetch(`${baseUrl}/todos`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    result.todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <span>${todo.title} (${todo.done ? 'Done' : 'Pending'})</span>
            <button onclick="markAsDone('${todo._id}')">Mark as Done</button>
        `;
        todoList.appendChild(todoItem);
    });
}

// Add new todo
async function addTodo() {
    const title = document.getElementById('new-todo-title').value;
    const dueDate = document.getElementById('new-todo-dueDate').value;

    const response = await fetch(`${baseUrl}/todo`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, dueDate, done: false })
    });

    const result = await response.json();
    alert(result.msg);
    fetchTodos();
}

// Mark todo as done once it is done
async function markAsDone(todoId) {
    const response = await fetch(`${baseUrl}/todoFinish/${todoId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();
    alert(result.message);
    fetchTodos();
}
