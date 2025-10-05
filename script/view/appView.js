// import { TaskListView } from "./taskListView";
import { TaskListView } from '../view/taskListView.js';
export class AppView {
    constructor() {
        this.container = document.createElement('div');

        // Header
        this.header = document.createElement('header');
        const title = document.createElement('h1');
        title.textContent = 'To-Do List';

        // Иконка темы
        this.themeToggleIcon = document.createElement('img');
        this.themeToggleIcon.className = 'theme-toggle-icon';
        this.themeToggleIcon.src = './img/light.png';
        this.themeToggleIcon.alt = 'Переключить тему';
        this.themeToggleIcon.loading = 'lazy';
        this.header.append(title, this.themeToggleIcon);

        // Панель управления
        this.controlPanel = document.createElement('div');
        this.controlPanel.className = 'control-panel';
        this.searchInput = document.createElement('input');
        this.searchInput.placeholder = 'Поиск...';
        this.sortSelect = document.createElement('select');
        ['date', 'done', 'deadline'].forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt === 'date' ? 'По дате' : opt === 'done' ? 'Выполненные' : 'По сроку';
            this.sortSelect.appendChild(o);
        });
        this.filterSelect = document.createElement('select');
        ['all', 'done', 'favourite'].forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt === 'all' ? 'Все' : opt === 'done' ? 'Выполненные' : 'Избранные';
            this.filterSelect.appendChild(o);
        });
        this.controlPanel.append(this.searchInput, this.sortSelect, this.filterSelect);

        // Section + Form
        this.section = document.createElement('section');
        this.section.className = 'todo-section';
        this.form = document.createElement('form');
        this.form.className = 'todo-form';
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Новая задача...';
        this.input.className = 'todo-input';
        this.dateInput = document.createElement('input');
        this.dateInput.type = 'date';
        this.dateInput.className = 'todo-date';
        this.addBtn = document.createElement('button');
        this.addBtn.type = 'submit';
        this.addBtn.textContent = 'Добавить';
        this.addBtn.className = 'todo-button';
        this.form.append(this.input, this.dateInput, this.addBtn);

        // Список задач
        this.listView = new TaskListView();
        this.listEl = this.listView.listEl;
        this.section.append(this.form, this.listEl);

        this.container.append(this.header, this.controlPanel, this.section);
    }

    mount(parent) {
        parent.appendChild(this.container);
        this.listView.mount(this.section);
    }
}
