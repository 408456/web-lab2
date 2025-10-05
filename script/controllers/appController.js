import { TaskStorage } from '../model/taskStorage.js';
import { TaskModel } from '../model/taskModel.js';
import { TaskController } from './taskController.js';
import { AppView } from '../view/appView.js';
import { debounce } from '../utils/debounce.js';
import { isValidDeadline } from '../utils/deadLine.js';
import { EventLogger } from './logger.js';

export class AppController {
    constructor(root = document.body) {
        this.storage = new TaskStorage();
        this.view = new AppView();
        this.tasks = [];
        this.taskControllers = [];
        this.root = root;

        this.saveAllDebounced = debounce(() => this.storage.saveAll(this.tasks), 400);
    }

    init() {
        this.view.mount(this.root);
        this.tasks = this.storage.loadAll();
        EventLogger.log('AppLoaded', { tasksCount: this.tasks.length });

        this.renderTasks();

        this._wireForm();
        this._wireControls();
        this._wireDragAndDrop();


        window.addEventListener('beforeunload', () => this.storage.saveAll(this.tasks));
    }

    _wireForm() {
        this.view.form.addEventListener('submit', e => {
            e.preventDefault();
            const text = this.view.input.value.trim();
            const deadline = this.view.dateInput.value || null;
            if (!text) return;
            if (deadline && !isValidDeadline(deadline)) {
                alert('Дата срока не может быть раньше сегодняшней');
                return;
            }
            const task = new TaskModel({ text, deadline });
            this.tasks.push(task);
            this.addTaskController(task);

            this.saveAllDebounced();
            this.view.input.value = '';
            this.view.dateInput.value = '';

            EventLogger.log('TaskAdded', { id: task.id, text: task.text, deadline: task.deadline });
        });
    }

    _wireControls() {
        this.view.searchInput.addEventListener('input', e => {
            this.currentSearch = e.target.value;
            EventLogger.log('Search', { query: this.currentSearch });
            this.renderTasks();
        });

        this.view.sortSelect.addEventListener('change', e => {
            EventLogger.log('SortChanged', { criteria: e.target.value });
            this.renderTasks();
        });

        this.view.filterSelect.addEventListener('change', e => {
            this.currentFilter = e.target.value;
            EventLogger.log('FilterChanged', { filter: this.currentFilter });
            this.renderTasks();
        });

        this.view.themeToggleIcon.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            this.view.themeToggleIcon.src = isDark ? './img/dark.png' : './img/light.png';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            EventLogger.log('ThemeToggled', { theme: isDark ? 'dark' : 'light' });
        });
    }

    addTaskController(task) {
        const tc = new TaskController(task, this.view.listEl, (task, deletedTask = null) => {
            if (deletedTask) {
                this.tasks = this.tasks.filter(t => t.id !== deletedTask.id);
            } else {
                const idx = this.tasks.findIndex(t => t.id === task.id);
                if (idx > -1) this.tasks[idx] = task;
            }
            this.saveAllDebounced();
            this.renderTasks();
        }, this);
        this.taskControllers.push(tc);
    }

    renderTasks() {
        // Очистка списка
        this.view.listEl.innerHTML = '';
        this.taskControllers = [];

        // Фильтры и поиск
        let filtered = this.tasks.slice();

        if (this.currentFilter === 'done') filtered = filtered.filter(t => t.done);
        else if (this.currentFilter === 'favourite') filtered = filtered.filter(t => t.favourite);

        const search = (this.currentSearch || '').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        filtered = filtered.filter(t => t.text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(search));

        filtered.forEach(task => this.addTaskController(task));

        this.moveDoneToEnd();
    }

    moveDoneToEnd() {
        const list = this.view.listEl;
        const doneItems = [];
        const notDoneItems = [];

        this.taskControllers.forEach(tc => {
            if (tc.task.done) doneItems.push(tc.view.element);
            else notDoneItems.push(tc.view.element);
        });

        const allItems = [...notDoneItems, ...doneItems];

        // Плавная анимация
        allItems.forEach(el => {
            el.style.transition = 'transform 0.3s';
        });

        allItems.forEach(el => list.appendChild(el));
    }

    _wireDragAndDrop() {
        const list = this.view.listEl;
        let draggedEl = null;

        list.addEventListener('dragstart', e => {
            draggedEl = e.target;
            e.dataTransfer.effectAllowed = 'move';
            draggedEl.classList.add('dragging');
            EventLogger.log('DragStart', { id: draggedEl.dataset.id });
        });

        list.addEventListener('dragend', e => {
            if (draggedEl) draggedEl.classList.remove('dragging');
            draggedEl = null;
            this.saveAllDebounced();
            EventLogger.log('DragEnd', {});
        });

        list.addEventListener('dragover', e => {
            e.preventDefault();
            const afterEl = this._getDragAfterElement(list, e.clientY);
            window.requestAnimationFrame(() => {
                if (afterEl == null) list.appendChild(draggedEl);
                else list.insertBefore(draggedEl, afterEl);
            });
        });
    }

    _getDragAfterElement(container, y) {
        const draggableEls = [...container.querySelectorAll('.task-item:not(.dragging)')];
        return draggableEls.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}
