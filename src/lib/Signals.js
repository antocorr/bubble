let current;
/**
 * 
 * @param {*} initialValue 
 * @returns {[function(): *, function(*): void, function(): void]}
 */
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
    function get() {
        if (current) {            
            subscribers.push(current)
        }
        return value;
    }
    return [get, set, refresh]
}
export function effect(fn) {
    current = fn;
    fn();
    current = null;
}
class SignalObject{
    get;
    set;
    refresh;
    constructor(value){
        const [get, set, refresh] = createSignal(value);
        this.get = get;
        this.set = set;
        this.refresh = refresh;
    }
    get value(){
        return this.get();
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