export class TaskView {
  constructor(task) {
    this.task = task;
    this.element = null;
  }

  createElement() {
    const li = document.createElement('li');
    li.className = 'task-item fade-in';
    li.draggable = true;
    li.dataset.id = this.task.id;

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = this.task.text + (this.task.deadline ? ` (до ${this.task.deadline})` : '');

    const favBtn = document.createElement('img');
    favBtn.className = 'icon-btn fav-btn';
    favBtn.src = this.task.favourite ? './img/icons/favourite.png' : './img/icons/star.png';
    favBtn.alt = 'Избранное';
    favBtn.title = 'Избранное';
    favBtn.loading = 'lazy';

    const doneBtn = document.createElement('img');
    doneBtn.className = 'icon-btn done-btn';
    doneBtn.src = this.task.done ? './img/icons/done.png' : './img/icons/nodone.png';
    doneBtn.alt = 'Выполнено';
    doneBtn.title = 'Выполнено';
    doneBtn.loading = 'lazy';

    const editBtn = document.createElement('img');
    editBtn.className = 'icon-btn edit-btn';
    editBtn.src = './img/icons/edit.png';
    editBtn.alt = 'Редактировать';
    editBtn.title = 'Редактировать';
    editBtn.loading = 'lazy';

    const deleteBtn = document.createElement('img');
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.src = './img/icons/backet.png';
    deleteBtn.alt = 'Удалить';
    deleteBtn.title = 'Удалить';
    deleteBtn.loading = 'lazy';

    li.append(span, favBtn, doneBtn, editBtn, deleteBtn);

    if (this.task.done) li.classList.add('done');
    if (this.task.favourite) li.classList.add('favourite');

    this.element = li;
    return li;
  }

  mount(parent) {
    if (!this.element) this.createElement();
    parent.appendChild(this.element);
  }
}
