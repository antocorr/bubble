export function generateUUID() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}
export class LoggerTopic {
    children = {};
    active = true;
    items = [];
    combined = [];
    /**
     * 
     * @param {LoggerTopic} parent 
     * @param {string} name 
     */
    constructor(parent = null, name = null) {
        this.parent = parent
        if (!this.parent) {
            this.root = true;
        }
        this.id = generateUUID();
        this.name = name;
    }
    saveToCombined(args) {
        if (this.name) {
            args.unshift(`[${this.name}]`);
        }
        if (this.parent) {
            this.parent.saveToCombined(args);
            return;
        }
        this.combined.push(args);
    }
    log(...args) {
        if (this.parent) {
            this.saveToCombined([...args]);
        }
        if (!this.active) {
            this.items.push(args);
            return;
        }
        if (this.name) {
            args.unshift(`[${this.name}]`);
        }
        if (this.parent) {
            //add name to args            
            this.parent.log(args);
            return;
        }
        console.log.apply(console, args);
    }
    forceLog(args) {
        if (this.name) {
            args.unshift(`[${this.name}]`);
        }
        if (this.parent) {
            this.parent.forceLog(args);
            return;
        }
        console.log(...args);
    }
    flog(...args) {
        this.forceLog(args);
    }
    flush() {
        for (const item of this.items) {
            this.forceLog(item);
        }
        this.items = [];
    }
    /**
     * 
     * @param {string} name 
     * @returns {LoggerTopic}
     */
    topic(name) {
        if (this.children[name]) {
            return this.children[name];
        }
        const topic = new LoggerTopic(this, name);
        this.children[name] = topic;
        return topic;
    }
    combinedOutput() {
        for (const item of this.combined) {
            console.log.apply(console, item);
        }
    }
}
/**
 * @type {LoggerTopic}
 */
const Logger = new LoggerTopic();
window.Logger = Logger;
export default Logger;