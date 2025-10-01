class Component {
    constructor() {
        this.element = null;
    }

    render() {
        throw new Error("Метод render() должен быть реализован в наследнике");
    }

    mount(parent) {
        if (!this.element) {
            this.element = this.render();
        }
        parent.appendChild(this.element);
    }

    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

class Task extends Component {
    constructor({id, text, done=false, created=Date.now()}) {
        super();
        this.id = id || Date.now().toString();
        this.text = text;
        this.done = done;
        this.created = created;
    }

    toggleDone() {
        this.done = !this.done;
        if (this.element) {
            const span = this.element.querySelector("span");
            span.style.textDecoration = this.done ? "line-through" : "none";

            const doneBtn = this.element.querySelector(".done-btn");
            doneBtn.src = this.done ? './img/icons/done.png' : './img/icons/nodone.png';
        }
    }

    edit() {
        const newText = prompt("Редактировать задачу", this.text);
        if (newText !== null && newText.trim() !== "") {
            this.text = newText;
            this.element.querySelector("span").textContent = this.text;
        }
    }

    render() {
        const li = document.createElement("li");
        li.className = "task-item";
        li.dataset.id = this.id;

        const span = document.createElement("span");
        span.textContent = this.text;
        if (this.done) span.style.textDecoration = "line-through";

        // кнопка выполнено
        const doneBtn = document.createElement("img");
        doneBtn.className = "icon-btn done-btn";
        doneBtn.src = this.done ? './img/icons/done.png' : './img/icons/nodone.png';
        doneBtn.alt = "Выполнено";
        doneBtn.addEventListener("click", () => this.toggleDone());

        // кнопка редактирования
        const editBtn = document.createElement("img");
        editBtn.className = "icon-btn edit-btn";
        editBtn.src = './img/icons/edit.png';
        editBtn.alt = "Редактировать";
        editBtn.addEventListener("click", () => this.edit());

        // кнопка удаления
        const deleteBtn = document.createElement("img");
        deleteBtn.className = "icon-btn delete-btn";
        deleteBtn.src = './img/icons/backet.png';
        deleteBtn.alt = "Удалить";
        deleteBtn.addEventListener("click", () => {
            this.unmount();
            if (this.onDelete) this.onDelete(this);
        });

        li.append(span, doneBtn, editBtn, deleteBtn);
        this.element = li;
        return li;
    }
}
class TaskStorage {
    constructor(key) {
        this.key = key;
    }

    saveTasks(tasks) {
        const data = tasks.map(t => ({
            id: t.id,
            text: t.text,
            done: t.done,
            created: t.created
        }));
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    loadTasks() {
        const data = localStorage.getItem(this.key);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }
}

class TaskList extends Component {
    constructor(storage) {
        super();
        this.tasks = [];
        this.storage = storage;
    }

    addTask(task) {
        task.onDelete = (t) => this.removeTask(t);
        this.tasks.push(task);
        task.mount(this.element);
        this.save();
    }

    removeTask(task) {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.save();
    }

    sortTasks() {
        // сортируем по дате создания
        this.tasks.sort((a, b) => a.created - b.created);
        this.renderTasks();
        this.save();
    }

    renderTasks() {
        if (!this.element) return;
        this.element.innerHTML = "";
        this.tasks.forEach(task => task.mount(this.element));
    }

    render() {
        const ul = document.createElement("ul");
        ul.className = "todo-list";
        this.element = ul;
        return ul;
    }

    save() {
        this.storage.saveTasks(this.tasks);
    }

    load() {
        const data = this.storage.loadTasks();
        this.tasks = data.map(d => new Task(d));
    }
}
class App extends Component {
    constructor() {
        super();
        this.storage = new TaskStorage("todoTasks");
        this.taskList = new TaskList(this.storage);
    }

    render() {
        const section = document.createElement("section");
        section.className = "todo-section";

        const title = document.createElement("h1");
        title.textContent = "Список задач";

        // форма добавления
        const form = document.createElement("form");
        form.className = "todo-form";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Новая задача";
        input.className = "todo-input";

        const addBtn = document.createElement("button");
        addBtn.type = "submit";
        addBtn.textContent = "Добавить";
        addBtn.className = "todo-button";

        form.append(input, addBtn);

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            const task = new Task({text});
            this.taskList.addTask(task);
            input.value = "";
        });

        // сортировка кнопка
        const sortBtn = document.createElement("button");
        sortBtn.textContent = "Сортировать по дате";
        sortBtn.type = "button";
        sortBtn.addEventListener("click", () => this.taskList.sortTasks());

        section.append(title, form, sortBtn);
        this.taskList.mount(section);

        // загружаем задачи из localStorage
        this.taskList.load();
        this.taskList.renderTasks();

        this.element = section;
        return section;
    }
}

// запускаем приложение
const app = new App();
document.addEventListener("DOMContentLoaded", () => app.mount(document.body));
