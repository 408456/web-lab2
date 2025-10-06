export class EventLogger {
  static log(type, data = {}) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${type}]`, data);
  }
}
