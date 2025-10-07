import { EventLogger } from '../controllers/logger.js';
import { TaskListView } from './taskListView.js';

export class AppView {
  constructor() {
    this.container = document.createElement('div');
    this.initStructure();
  }

  initStructure() {
    this.createHeader();
    this.createControlPanel();
    this.createFormSection();
    this.assembleApplication();
  }

  createHeader() {
    this.header = document.createElement('header');
    
    const title = document.createElement('h1');
    title.textContent = 'To-Do List';
    const name = document.createElement('h3');
    name.textContent = 'Гольцман Глеб 408456 WEB 3.4';
    
    this.themeToggleIcon = this.createThemeToggleIcon();
    
    this.header.append(title, name, this.themeToggleIcon);
  }

  createThemeToggleIcon() {
    const icon = document.createElement('img');
    icon.className = 'theme-toggle-icon';
    icon.src = './img/light.png';
    icon.alt = 'Переключить тему';
    return icon;
  }

  createControlPanel() {
    this.controlPanel = document.createElement('div');
    this.controlPanel.className = 'control-panel';
    
    this.searchInput = this.createSearchInput();
    this.sortSelect = this.createSortSelect();
    this.filterSelect = this.createFilterSelect();
    
    this.controlPanel.append(this.searchInput, this.sortSelect, this.filterSelect);
  }

  createSearchInput() {
    const input = document.createElement('input');
    input.placeholder = 'Поиск...';
    input.type = 'text';
    return input;
  }

  createSortSelect() {
    const select = document.createElement('select');
    const options = [
      { value: 'date', text: 'По дате' },
      { value: 'done', text: 'Выполненные вниз' },
      { value: 'deadline', text: 'По сроку' }
    ];
    
    this.populateSelect(select, options);
    return select;
  }

  createFilterSelect() {
    const select = document.createElement('select');
    const options = [
      { value: 'all', text: 'Все' },
      { value: 'done', text: 'Выполненные' },
      { value: 'favourite', text: 'Избранные' }
    ];
    
    this.populateSelect(select, options);
    return select;
  }

  populateSelect(selectElement, options) {
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.text;
      selectElement.appendChild(opt);
    });
  }

  createFormSection() {
    this.section = document.createElement('section');
    this.section.className = 'todo-section';
    
    this.form = this.createTodoForm();
    this.listView = new TaskListView();
    this.listEl = this.listView.listEl;
    
    this.section.append(this.form, this.listEl);
  }

  createTodoForm() {
    const form = document.createElement('form');
    form.className = 'todo-form';
    
    this.input = this.createTextInput();
    this.dateInput = this.createDateInput();
    this.addBtn = this.createAddButton();
    
    form.append(this.input, this.dateInput, this.addBtn);
    return form;
  }

  createTextInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Новая задача...';
    input.className = 'todo-input';
    return input;
  }

  createDateInput() {
    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'todo-date';
    input.min = new Date().toISOString().split('T')[0];
    return input;
  }

  createAddButton() {
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Добавить';
    button.className = 'todo-button';
    return button;
  }

  assembleApplication() {
    this.container.append(this.header, this.controlPanel, this.section);
  }

  mount(parent) {
    parent.appendChild(this.container);
    this.listView.mount(this.section);
  }

  clearForm() {
    this.input.value = '';
    this.dateInput.value = '';
    this.input.focus();
  }

  getElements() {
    const elements = {
        container: this.container,
        header: this.header,
        controlPanel: this.controlPanel,
        searchInput: this.searchInput,
        sortSelect: this.sortSelect,
        filterSelect: this.filterSelect,
        form: this.form,
        input: this.input,
        dateInput: this.dateInput,
        addBtn: this.addBtn,
        listView: this.listView,
        listEl: this.listEl,
        themeToggleIcon: this.themeToggleIcon
    };

    Object.entries(elements).forEach(([key, element]) => {
        if (!element) {
            EventLogger.log(`AppView: Element '${key}' is null`);
        } else if (element instanceof HTMLElement) {
            if (!document.contains(element) && element !== this.container) {
                EventLogger.log(`AppView: Element '${key}' exists but is not in DOM`);
            }
        }
    });

    return elements;
}
}