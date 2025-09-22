const localStorageKey = 'todoTask'; 

// Инициализация приложения
function initApp(){
    const app = document.getElementById('app');
    const card = createSection();
    app.appendChild(card);

    const tasks = loadTasks();
    tasks.forEach(task => createTask(task));
}

// Создание заголовка
function createTitle(text){
    const title = document.createElement('h1');
    title.className = 'title';
    title.textContent = text;
    return title;
}

// Контейнер приложения
function createSection(){
    const section = document.createElement('section');
    section.className = 'todo-section';
    const title = createTitle('Список задач');
    const form = createForm();
    const list = createList();
    section.append(title, form, list); 
    return section;
}

// Создание формы задачи 
function createForm(){
    const form = document.createElement('form');
    form.className = 'todo-form';
    const input = createInput('так...');
    const btn = createAddBtn('Добавить'); 

    form.append(input, btn);

    form.addEventListener('submit', function(e){
        e.preventDefault();      
        const text = input.value.trim();
        if (!text) return;         

        createTask(text);          
        saveTask(text);            
        input.value = "";           
    });

    return form;
}

// Создание ввода
function createInput(placeholder){
    const input = document.createElement('input');
    input.className = 'todo-input';
    input.type = 'text';
    input.placeholder = placeholder;
    return input;
}

// Создание кнопки добавления
function createAddBtn(text){
    const btn = document.createElement('button');
    btn.className = 'todo-button';
    btn.type = 'submit';
    btn.textContent = text;
    return btn;
}

// Создание кнопки удаления
function createDeleteBtn(text){
    const btn = document.createElement('button');
    btn.className = 'todo-button';
    btn.type = 'submit';
    btn.textContent = text;
    return btn;
}

function createTask(text){
    const list = document.querySelector('.todo-list');
    const task = document.createElement('li');
    task.className = 'task';

    const span = document.createElement('span');
    span.textContent = text;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'удалить';
    delBtn.className = 'delete-button';

    delBtn.addEventListener('click', () => {
        task.remove();
        deleteTask(text);
    });

    task.append(span, delBtn);
    list.appendChild(task); 
}

// Создание списка
function createList(){
    const list = document.createElement('ul');
    list.className = 'todo-list';
    return list;
}


// LocalStorage
function loadTasks(){
    const data = localStorage.getItem(localStorageKey);
    if (!data) return [];
    try {
        return JSON.parse(data)
    } catch {
        return [];
    }
}

// LocalStorage сохранение в массив
function saveTask(text){
    const tasks = loadTasks();
    tasks.push(text);
    localStorage.setItem(localStorageKey, JSON.stringify(tasks));
}

// LocalStorage удаление из массива
function deleteTask(text){
    let tasks = loadTasks();
    tasks = tasks.filter(t => t !== text); 
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
}

initApp();




