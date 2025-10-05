import { uid } from '../utils/utils.js';

export class TaskModel {
    constructor({ id = uid(), text = "", done = false, created = Date.now(), deadline = null, favourite = false } = {}) {
        this.id = id;
        this.text = text;
        this.done = done;
        this.created = created;
        this.deadline = deadline;
        this.favourite = favourite;
    }
}