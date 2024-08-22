import { createComponent } from "../../../src/index.js";
// import { createComponent } from "../../../dist/bubble.js";
const App = {
    template() {
        /* html */
        return `<div>
            <h1 class="text-2xl font-bold">Basic test</h1>
            <div class="mt-4">
                <div class="mb-4">
                    <input type="text" class="border border-gray-300 p-2" x-model="name">
                </div>
                <div>
                    <input type="text" class="border border-gray-300 p-2" x-model="surname">
                </div>
                <p class="mt-2">Hello {{name}} {{surname}}</p>
            </div>
            <div class="counter mt-4">
                <p>Count: {{counter}}</p>
                <button class="bg-blue-500 text-white p-2" @click="this.increment()">Increment</button>
            </div>
            <!-- add a list -->
            <div class="mt-4">
                <ul>
                    <li x-for="item in items">{{item}}</li>
                </ul>
                <!--- add an input to add items to the list -->
                <input type="text" class="border border-gray-300 p-2" x-model="newItem">
                <button class="bg-blue-500 text-white p-2" @click="this.addItem()">Add item</button>
            </div>
        </div>`
    },
    data() {
        return {
            name: 'Salted',
            surname: "Gringo",
            counter: 1,
            items: ['do laundry', "repair the car"],
            newItem: ''
        }
    },
    increment() {
        this._data.counter.value++;
    },
    addItem() {
        this._data.items.push(this._data.newItem.value);
        console.log("suoooo", this._data.items.value);
    }
}

const app = createComponent(App); 
app.appendTo(document.getElementById('app'));