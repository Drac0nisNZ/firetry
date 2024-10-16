//Firebase Configuration
//Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const todoRef = firebase.database().ref('todo');
//Select DOM Elements
const addTodoBtn = document.getElementById('add-todo-btn');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const prioritySelect = document.getElementById('priority-select');
const searchInput = document.getElementById('search-input');
const darkToggle = document.getElementById('dark-mode-toggle');

// Event Listener to Add TODO item
addTodoBtn.addEventListener('click', () => {
  const todoText = todoInput.value.trim();
  const priority = prioritySelect.value;
  if (todoText > 0) {
    // Create a new reference in the database for a new todo item
    const newTodoRef = todoRef.push();
    const currentDate = new Date().toLocaleDateString();
    // Set the new todo item's properties in Friebase
    newTodoRef.set({
      text: todoText,
      completed: false,
      date: currentDate,
      priority: priority,
      category: 'General', // Add a default category for now.
    });
    //Clear the input after adding the todo
    todoInput = '';
  }
});

//Add keypress event to add todo with 'Enter' key
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodoBtn.click();
  }
});

// Event Listener to Toggle Dark Mode
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

//Fetch and render TODO items from Firebase
todoRef.on('value', (snapshot) => {
  // Clear the current list to prepare for any updated content
  todoList.innerHTML = '';
  snapshot.forEach((childSnapshot) => {
    const todoItem = childSnapshot.val(); // Retrieve the todo data
    const todoKey = childSnapshot.key; // Unique key for the todo item
    const li = document.createElement('li'); // Create a list item for each todo

    // Create a label to display the category of the todo
    const categoryLabel = document.createElement('div');
    categoryLabel.classList.add('category-label');
    categoryLabel.textContent = todoItem.category;
    li.appendChild(categoryLabel);

    const todoContent = document.createElement('div')
    todoContent.classList.add('todo-content')

    //Create status icon based on task state
    const statusIcon = document.createElement('div')
    statusIcon.classList.add('status-icon')

    if(todoItem.completed) {
      statusIcon.classList.add('completed')
      statusIcon.innerHTML = '<i class="fas fa-check"></i>'
    } else if (todoItem.priority === 'high') {
      statusIcon.classList.add('priority')
      statusIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>'
    } else if (todoItem.priority === 'medium') {
      statusIcon.classList.add('in-progress')
      statusIcon.innerHTML = '<i class="fas fa-hourglass-circle"></i>'
    } else if (todoItem.priority === 'low') {
      statusIcon.classList.add('waiting')
      statusIcon.innerHTML = '<i class="fas fa-pause-circle"></i>'
    } else {
      statusIcon.classList.add('unfinished')
      statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>'
    }
    todoContent.appendChild(statusIcon)

    // Display the todo text
    const todoTextSpan = document.createElement('span')
    todoTextSpan.textContent = `${todoItem.text}`
    if(todoItem.completed) {
      todoTextSpan.classList.add('completed') // Style the text if completed
    }
    todoContent.appendChild(todoTextSpan);
  });
});
