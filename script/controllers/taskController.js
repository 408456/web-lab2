import { TaskView } from '../view/taskView.js';
import { isValidDeadline } from '../utils/deadLine.js';
import { EventLogger } from './logger.js';

export class TaskController {
    constructor(task, parent, saveCallback, parentApp) {
        this.task = task;
        this.view = new TaskView(task);
        this.parent = parent;
        this.parentApp = parentApp;
        this.saveCallback = saveCallback;

        this.view.mount(this.parent);
        this._bindEvents();

        EventLogger.log('TaskCreated', { id: task.id, text: task.text });
    }

    _bindEvents() {
        const el = this.view.element;
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('done-btn')) this.toggleDone();
            if (e.target.classList.contains('fav-btn')) this.toggleFav();
            if (e.target.classList.contains('edit-btn')) this.editInline();
            if (e.target.classList.contains('delete-btn')) this.remove();
        });
    }

    toggleDone() {
        this.task.done = !this.task.done;
        this.view.update();
        this.saveCallback(this.task);
        this.parentApp.moveDoneToEnd();

        EventLogger.log('TaskToggledDone', { id: this.task.id, done: this.task.done });
    }

    toggleFav() {
        this.task.favourite = !this.task.favourite;
        this.view.update();
        this.saveCallback(this.task);

        EventLogger.log('TaskToggledFavourite', { id: this.task.id, favourite: this.task.favourite });
    }

    editInline() {
        const li = this.view.element;
        const span = li.querySelector('span');
        if (!span) return;

        const oldText = this.task.text;
        const oldDeadline = this.task.deadline || '';
        span.style.display = 'none';

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = oldText;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = oldDeadline;

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '5px';
        container.append(textInput, dateInput);
        li.appendChild(container);
        textInput.focus();

        const save = () => {
            const newText = textInput.value.trim();
            const newDeadline = dateInput.value || null;
            if (!newText) return;
            if (newDeadline && !isValidDeadline(newDeadline)) {
                alert('Дата срока не может быть раньше сегодняшней');
                return;
            }
            this.task.text = newText;
            this.task.deadline = newDeadline;

            container.remove();
            span.style.display = '';
            this.view.update();
            this.saveCallback(this.task);

            EventLogger.log('TaskEdited', { id: this.task.id, oldText, newText, oldDeadline, newDeadline });
        };

        textInput.addEventListener('blur', save);
        dateInput.addEventListener('blur', save);

        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { container.remove(); span.style.display = ''; this.view.update(); }
        });
        dateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { container.remove(); span.style.display = ''; this.view.update(); }
        });
    }


    remove() {
        this.view.remove();
        this.saveCallback(null, this.task);
        EventLogger.log('TaskDeleted', { id: this.task.id, text: this.task.text });
    }
}