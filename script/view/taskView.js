export class TaskView {
    constructor(task) {
        this.task = task;
        this.element = null;
    }

    createElement() {
        const li = document.createElement('li');
        li.className = 'task-item fade-in';
        li.dataset.id = this.task.id;
        li.draggable = true;

        const span = document.createElement('span');
        span.textContent = this.task.text + (this.task.deadline ? ` (до ${this.task.deadline})` : '');
        if (this.task.done) span.style.textDecoration = 'line-through';

        const favBtn = document.createElement('img');
        favBtn.className = 'icon-btn fav-btn';
        favBtn.src = this.task.favourite ? './img/icons/favourite.png' : './img/icons/star.png';
        favBtn.alt = 'Избранное';
        favBtn.loading = 'lazy';

        const doneBtn = document.createElement('img');
        doneBtn.className = 'icon-btn done-btn';
        doneBtn.src = this.task.done ? './img/icons/done.png' : './img/icons/nodone.png';
        doneBtn.alt = 'Выполнено';
        doneBtn.loading = 'lazy';

        const editBtn = document.createElement('img');
        editBtn.className = 'icon-btn edit-btn';
        editBtn.src = './img/icons/edit.png';
        editBtn.alt = 'Редактировать';
        editBtn.loading = 'lazy';

        const deleteBtn = document.createElement('img');
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.src = './img/icons/backet.png';
        deleteBtn.alt = 'Удалить';
        deleteBtn.loading = 'lazy';

        li.append(span, favBtn, doneBtn, editBtn, deleteBtn);
        this.element = li;
        return li;
    }

    mount(parent) {
        if (!this.element) this.createElement();
        parent.appendChild(this.element);
    }

    update() {
        if (!this.element) return;
        const span = this.element.querySelector('span');
        span.textContent = this.task.text + (this.task.deadline ? ` (до ${this.task.deadline})` : "");
        span.style.textDecoration = this.task.done ? 'line-through' : 'none';
        span.style.color = this.task.favourite ? '#ffcc00' : '#333';

        // Иконки
        const doneBtn = this.element.querySelector('.done-btn');
        doneBtn.src = this.task.done ? './img/icons/done.png' : './img/icons/nodone.png';

        const favBtn = this.element.querySelector('.fav-btn');
        favBtn.src = this.task.favourite ? './img/icons/favourite.png' : './img/icons/star.png';

        // Blur для выполненных задач
        if (this.task.done) {
            this.element.style.filter = 'blur(1px)';
            this.element.style.opacity = '0.6';
        } else {
            this.element.style.filter = '';
            this.element.style.opacity = '1';
        }
    }


    remove() {
        if (!this.element) return;
        this.element.classList.add('fade-out');
        this.element.addEventListener('animationend', () => this.element.remove(), { once: true });
    }
}