export default class JobManager {
    callbacks = { finished: [], done: [], add: [], start: [], check: [] };
    data = { todo: 0, done: 0, started: false };
    start(info) {
        this.data.started = true;
        this.emit('start');
        this.check(info);
    }
    done(amt = 1, info) {
        this.data.done += amt;
        if (this.data.started) {
            this.check(info, true);
        }
    }
    add(amt = 1, info) {
        this.data.todo += amt;
        this.emit('add', info);
    }
    reset() {
        this.data = { todo: 0, done: 0, started: false };
    }
    check(info, done = false) {
        const perc = (this.data.done / this.data.todo) * 100;
        if (this.data.done >= this.data.todo && this.data.started) {
            this.emit('finished');
        } else if(done) {            
            this.emit('done', perc, info);
        }
        this.emit('check', perc, info);
    }
    emit(evt, arg1, arg2) {
        for (const fn of this.callbacks[evt]) {
            fn(arg1, arg2);
        }
    }
    addCallback(evt, fn) {
        this.callbacks[evt].push(fn);
    }
    flushCallbacks() {
        this.callbacks = { finished: [], done: [], add: [], start: [], check: [] };
    }
}
export const jobManagers = {};
/**
 * 
 * @param {string} name 
 * @returns {JobManager}
 */
export function getJobManager(name) {
    if (!jobManagers[name]) {
        jobManagers[name] = new JobManager();
    }
    return jobManagers[name];
}