export class EventLogger {
    static log(eventType, data = {}) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${eventType}]`, data);
    }
}