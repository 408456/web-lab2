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

        // Монтируем представление и навешиваем события
        this.view.mount(this.parent);
        this._bindEvents();

        EventLogger.log('TaskCreated', { id: task.id, text: task.text });
    }

    _bindEvents() {
        const el = this.view.element;
        if (!el) return;

        // Делегируем клики по кнопкам
        el.addEventListener('click', (e) => {
            const btn = e.target;
            if (btn.classList.contains('done-btn')) this.toggleDone();
            else if (btn.classList.contains('fav-btn')) this.toggleFav();
            else if (btn.classList.contains('edit-btn')) this.editInline();
            else if (btn.classList.contains('delete-btn')) this.remove();
        });

        // Поддержка drag attributes (id в dataset уже выставлен)
    }

    toggleDone() {
        this.task.done = !this.task.done;
        this.view.update();
        // notify app через callback (сохранение/обновление)
        this.saveCallback(this.task);

        // Переместить выполненные вниз
        if (this.parentApp && typeof this.parentApp.moveDoneToEnd === 'function') {
            this.parentApp.moveDoneToEnd();
        }

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
        const span = li.querySelector('span.task-text');
        if (!span) return;

        // Скрываем основной текст
        span.style.display = 'none';
        const oldText = this.task.text;
        const oldDeadline = this.task.deadline || '';

        const { container, textInput, dateInput } = this.createInputs(oldText, oldDeadline, li);
        this.attachListeners(container, textInput, dateInput, span, oldText, oldDeadline);
    }

    createInputs(oldText, oldDeadline, li) {
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'task-edit-input';
        textInput.value = oldText;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'task-edit-date';
        // FIX: если oldDeadline не в формате YYYY-MM-DD — попытаться извлечь
        if (oldDeadline && /^\d{4}-\d{2}-\d{2}$/.test(oldDeadline)) {
            dateInput.value = oldDeadline;
        } else if (oldDeadline) {
            const match = oldDeadline.match(/\d{4}-\d{2}-\d{2}/);
            if (match) dateInput.value = match[0];
        }

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '6px';
        container.style.alignItems = 'center';
        container.append(textInput, dateInput);
        li.appendChild(container);

        textInput.focus();
        return { container, textInput, dateInput };
    }

    attachListeners(container, textInput, dateInput, span, oldText, oldDeadline) {
        const saveHandler = () => this.saveChanges(textInput.value.trim(), dateInput.value || null, oldText, oldDeadline, container, span);

        // Остановка всплытия, чтобы не триггерить клики родителя
        container.addEventListener('click', e => e.stopPropagation());

        // Blur и клавиши
        textInput.addEventListener('blur', saveHandler);
        dateInput.addEventListener('blur', saveHandler);

        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveHandler();
            if (e.key === 'Escape') this.removeInputs(container, span);
        });
        dateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveHandler();
            if (e.key === 'Escape') this.removeInputs(container, span);
        });
    }

    removeInputs(container, span) {
        container.remove();
        span.style.display = '';
        this.view.update();
    }

    saveChanges(newText, newDeadline, oldText, oldDeadline, container, span) {
        if (!newText) {
            // если текст пуст — отменяем изменение (не удаляем задачу)
            this.removeInputs(container, span);
            return;
        }
        if (newDeadline && !isValidDeadline(newDeadline)) {
            alert('Дата срока не может быть раньше сегодняшней');
            return;
        }

        // Обновляем модель
        this.task.text = newText;
        this.task.deadline = newDeadline;

        // Удаляем инпуты и обновляем view
        this.removeInputs(container, span);

        // Сигнализируем приложению о сохранении
        this.saveCallback(this.task);

        EventLogger.log('TaskEdited', { id: this.task.id, oldText, newText, oldDeadline, newDeadline });
    }

    remove() {
        // Удаляем визуально
        this.view.remove();
        // Сообщаем app, что объект удалён (через второй аргумент)
        this.saveCallback(null, this.task);
        EventLogger.log('TaskDeleted', { id: this.task.id, text: this.task.text });
    }
}
