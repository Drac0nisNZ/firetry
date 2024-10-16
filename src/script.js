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
    const todoTextSpan = document.createElement('span');
    todoTextSpan.textContent = `${todoItem.text}`;
    if(todoItem.completed) {
      todoTextSpan.classList.add('completed'); // Style the text if completed
    }
    todoContent.appendChild(todoTextSpan);

    // Create an edit button
    const editBtn = document.createElement('i');
    editBtn.classList.add('fas', 'fa-edit', 'edit-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from toggling completion
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.classList.add('todo-input-edit');
      editInput.value = todoItem.text
      todoContent.replaceChild(editInput, todoTextSpan); // REplace text with input field
      editInput.focus();

      // When editing is complete (on losing focus)
      editInput.addEventListener('blur', () => {
        const updatedText = editInput.value.trim()
        if(updatedText.length > 0) {
          //Update the todo text and date in firebase
          todoRef.child(todoKey).update({
            text: updatedText,
            date: new Date().toLocaleDateString()
          }) 
        } else {
          //revert to original text if no valid input
          todoContent.replaceChild(todoTextSpan, editInput)
        }
      })
    })
  });

  // Create complete button
  const completeBtn = document.createElement('i')
  completeBtn.classList.add('fas', 'fa-check', 'complete')
  completeBtn.addEventListener('click', (e) => {
    e.stopPropagation() //Prevents click from triggering other actions
    //Toggle the comletion status of the todo item
    todoRef.child(todoKey).update({
      complete: !todoItem.completed,
    });
  });

  //Create an undo button for completed tasks
  const undoBtn = document.createElement('i')
  undoBtn.classList.add('fas', 'fa-undo', 'undo-btn')
  undoBtn.addEventListener('click', (e) => {
    e.stopPropagation() // Prevent click from triggering any other actions
    //Set task as incomplete
    todoRef.child(todoKey).update({
      complete: false
    });
  })
  
  // Create a delete button
  const deleteBtn = document.createElement('i')
  deleteBtn.classList.add('fas', 'fa-delete', 'delete-btn')
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation() //Prevents click from triggering other actions
    // Remove the todo itrm from firebase
    todoRef.child(todoKey).remove()
  })

  //append all created elements to the list item
  li.appendChild(todoContent)
  if(todoItem.completed) {
    li.appendChild(undoBtn) //add undo button only if the task is complete
  } else {
    li.appendChild(completeBtn) //add complete button only if the task is not complete
  }
  li.appendChild(editBtn)
  li.appendChild(deleteBtn)
  todoList.appendChild(li); // add the list item to the UI
});

// event listener for search functionality
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase()
  const todos = document.querySelectorAll('#todo-list li')
  todos.forEach((todo) => {
    const text = todo.querySelector('span').textContent.toLowerCase()
    if(text.includes(filter)) {
      todo.style.display = ''
    } else {
      todo.style.display = 'none';
    }
  })
})