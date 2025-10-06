import { TaskListView } from './taskListView.js';

export class AppView {
  constructor() {
    this.container = document.createElement('div');

    this.header = document.createElement('header');
    const title = document.createElement('h1');
    title.textContent = 'To-Do List';
    this.themeToggleIcon = document.createElement('img');
    this.themeToggleIcon.className = 'theme-toggle-icon';
    this.themeToggleIcon.src = './img/light.png';
    this.themeToggleIcon.alt = 'Переключить тему';
    this.header.append(title, this.themeToggleIcon);

    this.controlPanel = document.createElement('div');
    this.controlPanel.className = 'control-panel';
    this.searchInput = document.createElement('input');
    this.searchInput.placeholder = 'Поиск...';
    this.sortSelect = document.createElement('select');
    [
      { v: 'date', t: 'По дате' },
      { v: 'done', t: 'Выполненные вниз' },
      { v: 'deadline', t: 'По сроку' }
    ].forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.v;
      opt.textContent = o.t;
      this.sortSelect.appendChild(opt);
    });
    this.filterSelect = document.createElement('select');
    [
      { v: 'all', t: 'Все' },
      { v: 'done', t: 'Выполненные' },
      { v: 'favourite', t: 'Избранные' }
    ].forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.v;
      opt.textContent = o.t;
      this.filterSelect.appendChild(opt);
    });
    this.controlPanel.append(this.searchInput, this.sortSelect, this.filterSelect);

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

    this.listView = new TaskListView();
    this.listEl = this.listView.listEl;
    this.section.append(this.form, this.listEl);

    this.container.append(this.header, this.controlPanel, this.section);
  }

  mount(parent) {
    parent.appendChild(this.container);
    this.listView.mount(this.section);
  }

  clearForm() {
    this.input.value = '';
    this.dateInput.value = '';
  }
}
