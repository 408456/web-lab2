export class TaskStorage {
    constructor(key = 'todoTasks') {
        this.key = key;
    }


    loadAll() {
        const raw = localStorage.getItem(this.key);
        if (!raw) return [];
        try {
            const arr = JSON.parse(raw);
            return arr.map(d => new TaskModel(d));
        } catch {
            return [];
        }
    }


    saveAll(tasks) {
        const serial = tasks.map(t => ({ id: t.id, text: t.text, done: t.done, created: t.created, deadline: t.deadline, favourite: t.favourite }));
        localStorage.setItem(this.key, JSON.stringify(serial));
    }


    saveOne(task) {
        const list = this.loadAll();
        const idx = list.findIndex(t => t.id === task.id);
        if (idx >= 0) list[idx] = task;
        else list.push(task);
        this.saveAll(list);
    }


    deleteOne(taskId) {
        const list = this.loadAll().filter(t => t.id !== taskId);
        this.saveAll(list);
    }
}