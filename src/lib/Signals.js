let current;
export function createSignal(initialValue) {
    let value = initialValue;
    const
        subscribers = [];
    function refresh() {
        subscribers.forEach(sub => sub())
    }
    function
        set(newValue) {
        value = newValue;
        refresh();
    }
    function read() {
        if (current) {            
            subscribers.push(current)
        }
        return value;
    }
    return [read, set, refresh]
}
export function effect(fn) {
    current = fn;
    fn();
    current = null;
}
class SignalObject{
    read;
    set;
    refresh;
    constructor(value){
        const [read, set, refresh] = createSignal(value);
        this.read = read;
        this.set = set;
        this.refresh = refresh;
    }
    get value(){
        return this.read();
    }
    set value(newValue){
        this.set(newValue);
    }
    push(newValue){
        this.value.push(new SignalObject(newValue));
        this.refresh();
    }
}
export function Signal(value){
    return new SignalObject(value);
}