import { EventTopic } from "./EventTopic";
import { getJobManager } from "./JobManager";
export class Bubble{
    events;
    $state = {};
    constructor(){
        this.events = new EventTopic;
    }
    getJobManager(name) {
        return getJobManager(name);
    }
    get state() {
        return this.$state;
    }    
}
const bubble = new Bubble();
export default bubble;
window.bubble = bubble;
