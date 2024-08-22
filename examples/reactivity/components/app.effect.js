import { html, effect, createSignal } from "../../../src/index.js";
const counter = html(
    /*html*/
    `
        <div class="counter mt-4">
                <p>Count: <span id="count">1</span></p>
                <button class="bg-blue-500 text-white p-2" id="btn">Increment</button>
            </div>
    `);
const btn = counter.querySelector('#btn');
const count = counter.querySelector('#count');
const [getCount, setCount] = createSignal(+count.textContent);
document.getElementById('app').appendChild(counter);
effect(() => {
    count.textContent = getCount();
})
btn.onclick = () => {
    setCount(getCount() + 1);
}