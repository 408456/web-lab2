// Центральный контроллер приложения
import { TaskModel } from '../model/taskModel.js';
import { TaskStorage } from '../model/taskStorage.js';
import { AppView } from '../view/appView.js';
import { debounce } from '../utils/debounce.js';
import { isValidDeadline } from '../utils/deadLine.js';
import { EventLogger } from './logger.js';

export class AppController {
    constructor(root = document.body) {
        this.root = root;
        this.view = new AppView();
        this.storage = new TaskStorage();
        this.tasks = [];
        this.saveDebounced = debounce(() => this.storage.saveAll(this.tasks), 500); // пакетное сохранение
        this.autoBackupInterval = null;
        this.state = {
            search: '',
            filter: 'all',
            sort: 'date'
        };
    }

    init() {
        this.view.mount(this.root);
        this.tasks = this.storage.loadAll();
        EventLogger.log('AppLoaded', { count: this.tasks.length });

        this._renderListInitial();

        this._wireForm();
        this._wireControls();
        this._wireListDelegation();
        this._wireDragAndDrop();

        // Автосохранение раз в 10s 
        this.autoBackupInterval = setInterval(() => this.storage.saveAll(this.tasks), 10000);
        window.addEventListener('beforeunload', () => this.storage.saveAll(this.tasks));
    }

    _renderListInitial() {
        const list = this._getProcessedTasks();
        this.view.listView.render(list);
    }

    _getProcessedTasks() {
        let arr = this.tasks.slice();


        if (this.state.filter === 'done') arr = arr.filter(t => t.done);
        else if (this.state.filter === 'favourite') arr = arr.filter(t => t.favourite);

        const q = (this.state.search || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (q) {
            arr = arr.filter(t => t.text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q));
        }

        if (this.state.sort === 'date') {
            arr.sort((a, b) => b.created - a.created);
        } else if (this.state.sort === 'done') {
            arr.sort((a, b) => (a.done === b.done) ? 0 : (a.done ? 1 : -1));
        } else if (this.state.sort === 'deadline') {
            arr.sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline.localeCompare(b.deadline);
            });
        }

        return arr;
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

            this.view.listView.appendTask(task);
            this.saveDebounced();
            this.view.clearForm();
            EventLogger.log('TaskAdded', { id: task.id });
        });
    }

    _wireControls() {

        this.view.searchInput.addEventListener('input', e => {
            this.state.search = e.target.value;
            this._refreshListPartial();
            EventLogger.log('Search', { q: this.state.search });
        });

        this.view.sortSelect.addEventListener('change', e => {
            this.state.sort = e.target.value;
            this._refreshListPartial();
            EventLogger.log('SortChanged', { sort: this.state.sort });
        });

        this.view.filterSelect.addEventListener('change', e => {
            this.state.filter = e.target.value;
            this._refreshListPartial();
            EventLogger.log('FilterChanged', { filter: this.state.filter });
        });

        this.view.themeToggleIcon.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            this.view.themeToggleIcon.src = isDark ? './img/dark.png' : './img/light.png';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            EventLogger.log('ThemeToggled', { theme: isDark ? 'dark' : 'light' });
        });
    }

    _wireListDelegation() {
        const listEl = this.view.listEl;

        listEl.addEventListener('click', e => {
            const btn = e.target.closest('.icon-btn');
            const itemEl = e.target.closest('.task-item');
            if (!itemEl) return;
            const id = itemEl.dataset.id;
            const task = this.tasks.find(t => t.id === id);
            if (!task) return;

            if (btn && btn.classList.contains('done-btn')) {
                this._toggleDone(task, itemEl);
                return;
            }
            if (btn && btn.classList.contains('fav-btn')) {
                this._toggleFav(task, itemEl);
                return;
            }
            if (btn && btn.classList.contains('delete-btn')) {
                this._removeTask(task, itemEl);
                return;
            }
            if (btn && btn.classList.contains('edit-btn')) {
                this._startInlineEdit(task, itemEl);
                return;
            }
        });

        listEl.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const editWrapper = e.target.closest('.inline-edit-wrapper');
                if (editWrapper) this.view.listView.cancelInlineEdit(editWrapper);
            }
        });
    }

    _wireDragAndDrop() {
        const list = this.view.listEl;
        let draggingEl = null;

        list.addEventListener('dragstart', e => {
            const el = e.target.closest('.task-item');
            if (!el) return;
            draggingEl = el;
            el.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            EventLogger.log('DragStart', { id: el.dataset.id });
        });

        list.addEventListener('dragover', e => {
            e.preventDefault();
            const after = this._getDragAfterElement(list, e.clientY);
            window.requestAnimationFrame(() => {
                if (!draggingEl) return;
                if (after == null) list.appendChild(draggingEl);
                else list.insertBefore(draggingEl, after);
            });
        });

        list.addEventListener('dragend', () => {
            if (draggingEl) draggingEl.classList.remove('dragging');
            
            const ids = [...list.children].map(ch => ch.dataset.id);
            this.tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
            this.saveDebounced();
            draggingEl = null;
            EventLogger.log('DragEnd', {});
        });
    }

    _getDragAfterElement(container, y) {
        const draggable = [...container.querySelectorAll('.task-item:not(.dragging)')];
        return draggable.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element || null;
    }

    _toggleDone(task, itemEl) {
        task.done = !task.done;
        this.view.listView.updateTaskElement(task, itemEl);
        this.saveDebounced();
        this._ensureDoneAtEnd(itemEl, task.done);
        EventLogger.log('TaskToggledDone', { id: task.id, done: task.done });
    }

    _ensureDoneAtEnd(itemEl, isDone) {
        if (isDone) this.view.listEl.appendChild(itemEl);
        else {
            const firstDone = this.view.listEl.querySelector('.task-item.done');
            if (firstDone) this.view.listEl.insertBefore(itemEl, firstDone);
            else this.view.listEl.insertBefore(itemEl, this.view.listEl.firstChild);
        }
    }

    _toggleFav(task, itemEl) {
        task.favourite = !task.favourite;
        this.view.listView.updateTaskElement(task, itemEl);
        this.saveDebounced();
        EventLogger.log('TaskToggledFavourite', { id: task.id, fav: task.favourite });
    }

    _removeTask(task, itemEl) {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.view.listView.removeTaskElement(itemEl);
        this.saveDebounced();
        EventLogger.log('TaskDeleted', { id: task.id });
    }

    _startInlineEdit(task, itemEl) {
        if (itemEl.querySelector('.inline-edit-wrapper')) return;
        const wrapper = this.view.listView.startInlineEdit(task, itemEl);

        const textInput = wrapper.querySelector('.task-edit-input');
        const dateInput = wrapper.querySelector('.task-edit-date');

        const save = () => {
            const newText = textInput.value.trim();
            const newDeadline = dateInput.value || null;
            if (!newText) { 
                this.view.listView.cancelInlineEdit(wrapper);
                return;
            }
            if (newDeadline && !isValidDeadline(newDeadline)) {
                alert('Дата срока не может быть раньше сегодняшней');
                return;
            }
            task.text = newText;
            task.deadline = newDeadline;
            this.view.listView.finishInlineEdit(task, itemEl, wrapper);
            this.saveDebounced();
            EventLogger.log('TaskEdited', { id: task.id });
        };

        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') this.view.listView.cancelInlineEdit(wrapper);
        });
        dateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') this.view.listView.cancelInlineEdit(wrapper);
        });

        textInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (!dateInput.matches(':focus')) save();
            }, 150);
        });
        dateInput.addEventListener('blur', () => setTimeout(save, 0));
    }

    _refreshListPartial() {
        const processed = this._getProcessedTasks();
        this.view.listView.render(processed);
    }
}
