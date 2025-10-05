export class TaskListView {
    constructor() {
        this.listEl = document.createElement('ul');
        this.listEl.className = 'todo-list';
    }

    mount(parent) {
        parent.appendChild(this.listEl);
    }

    clear() {
        this.listEl.innerHTML = '';
    }
}