import { TaskView } from './taskView.js';


export class TaskListView {
    constructor() {
        this.listEl = document.createElement('ul');
        this.listEl.className = 'todo-list';
    }


    mount(parent) {
        parent.appendChild(this.listEl);
    }


    render(tasks) {
        this.listEl.innerHTML = '';
        const frag = document.createDocumentFragment();
        tasks.forEach(task => {
            const tv = new TaskView(task);
            tv.mount(frag);
        });
        this.listEl.appendChild(frag);
    }
    appendTask(task) {
        const tv = new TaskView(task);
        tv.mount(this.listEl);
        if (task.done) this.listEl.appendChild(tv.element);
    }

    updateTaskElement(task, itemEl) {
        const el = this.findTaskElement(task, itemEl);
        if (!el) return;

        this.updateTextContent(el, task);
        this.updateIcons(el, task);
        this.updateVisualState(el, task);
    }

    findTaskElement(task, itemEl) {
        return itemEl || this.listEl.querySelector(`[data-id="${task.id}"]`);
    }

    updateTextContent(el, task) {
        const span = el.querySelector('.task-text');
        if (!span) return;

        span.textContent = task.text + (task.deadline ? ` (до ${task.deadline})` : '');
        span.style.textDecoration = task.done ? 'line-through' : 'none';
    }

    updateIcons(el, task) {
        const fav = el.querySelector('.fav-btn');
        const done = el.querySelector('.done-btn');

        if (fav) fav.src = task.favourite ? './img/icons/favourite.png' : './img/icons/star.png';
        if (done) done.src = task.done ? './img/icons/done.png' : './img/icons/nodone.png';
    }

    updateVisualState(el, task) {
        el.classList.toggle('done', task.done);
        el.classList.toggle('favourite', task.favourite);
    }


    removeTaskElement(itemEl) {
        if (!itemEl) return;
        itemEl.classList.add('fade-out');
        itemEl.addEventListener('animationend', () => itemEl.remove(), { once: true });
    }


    startInlineEdit(task, itemEl) {
        const wrapper = document.createElement('div');
        wrapper.className = 'inline-edit-wrapper';
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'task-edit-input';
        textInput.value = task.text;
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'task-edit-date';
        dateInput.min = new Date().toISOString().split('T')[0]
        if (task.deadline && /^\d{4}-\d{2}-\d{2}$/.test(task.deadline)) dateInput.value = task.deadline;
        wrapper.append(textInput, dateInput);
        const span = itemEl.querySelector('.task-text');
        span.style.display = 'none';
        itemEl.appendChild(wrapper);
        textInput.focus();
        return { wrapper, textInput, dateInput };
    }


    cancelInlineEdit(wrapper) {
        if (!wrapper) return;
        const itemEl = wrapper.closest('.task-item');
        if (!itemEl) return;
        const span = itemEl.querySelector('.task-text');
        wrapper.remove();
        if (span) span.style.display = '';
    }


    finishInlineEdit(task, itemEl, wrapper) {
        if (!wrapper) return;
        this.cancelInlineEdit(wrapper);
        this.updateTaskElement(task, itemEl);
    }
}
