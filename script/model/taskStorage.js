import { TaskModel } from './taskModel.js';

export class TaskStorage {
  constructor(key = 'todoTasks') {
    this.key = key;
  }

  loadAll() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return arr.map(it => new TaskModel(it));
    } catch (err) {
      console.warn('TaskStorage.loadAll error', err);
      return [];
    }
  }

  saveAll(tasks) {
    const serial = tasks.map(t => ({
      id: t.id,
      text: t.text,
      done: !!t.done,
      created: t.created || Date.now(),
      deadline: t.deadline || null,
      favourite: !!t.favourite
    }));
    localStorage.setItem(this.key, JSON.stringify(serial));
  }
}
