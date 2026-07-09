import { createComponent } from "../../../src/index.js";

// Module-level counter stamped into each row the moment its DOM node is
// created. The number never updates afterwards, so a changed number means
// the node was destroyed and rebuilt — a stable number means it was reused.
let domStamp = 0;

// Generate ~20 initial items so the lists require scrolling
function buildItems() {
  const names = ["Alpha","Bravo","Charlie","Delta","Echo","Foxtrot","Golf","Hotel","India","Juliett","Kilo","Lima","Mike","November","Oscar","Papa","Quebec","Romeo","Sierra","Tango"];
  return names.map((name, i) => ({ id: i + 1, name }));
}

const EXTRA_NAMES = ["Uniform","Victor","Whiskey","X-ray","Yankee","Zulu"];
let nextId = 21;
let shouting = false;

const KeyedLoopsApp = {
    name: "KeyedLoopsApp",

    template() {
        return /*html*/`
        <div class="max-w-5xl mx-auto space-y-6">

            <header class="space-y-2">
                <h1 class="text-2xl font-bold">Keyed loops</h1>
                <p class="text-gray-600">
                    Both lists render the <strong>same data</strong>. The left loop rebuilds every row
                    on each change; the right loop reconciles by <code class="bg-gray-200 rounded px-1">:key</code>
                    and reuses the existing DOM nodes.
                </p>
                <p class="text-gray-600">
                    Try it: <strong>type something in a few inputs</strong>, then shuffle. On the left your text
                    is lost with the rebuilt nodes; on the right it travels with its item. The
                    <span class="font-mono text-xs bg-gray-800 text-white rounded px-1.5 py-0.5">node #</span>
                    badge is stamped once per DOM node: it changes only when a node is recreated.
                </p>
                <p class="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
                    <strong>🡇 Scroll test:</strong> scroll down in <strong>both</strong> lists,
                    then click <strong>Shuffle</strong>. The left list (no key) loses its scroll position
                    because the DOM is rebuilt from scratch. The right list (:key) preserves it —
                    nodes are <em>moved</em>, not recreated. Watch the <code>scrollTop</code> values below!
                </p>
            </header>

            <div class="flex flex-wrap gap-2">
                <button type="button" class="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer" @click="addOnTop">Add on top</button>
                <button type="button" class="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer" @click="shuffle">Shuffle</button>
                <button type="button" class="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer" @click="sortByName">Sort A→Z</button>
                <button type="button" class="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer" @click="toggleCase">Rename all</button>
                <button type="button" class="rounded-lg bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer" @click="removeFirst">Remove first</button>
            </div>

            <div class="grid md:grid-cols-2 gap-6 items-start">

                <section class="bg-white rounded-xl shadow p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <h2 class="font-semibold text-red-700">Without :key</h2>
                        <code class="text-xs bg-gray-100 text-gray-500 rounded px-2 py-1">x-for="item in items"</code>
                    </div>
                    <ul class="space-y-2 max-h-[340px] overflow-y-auto rounded-lg border border-gray-100 p-2" data-list="unkeyed">
                        <li x-for="item in items" class="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                            <span class="node-stamp font-mono text-xs bg-gray-800 text-white rounded px-1.5 py-0.5 shrink-0">node #{{ stampNode() }}</span>
                            <span class="item-name w-20 font-medium shrink-0">{{ item.name }}</span>
                            <!-- Deliberately NOT x-model: unmanaged DOM state reveals node identity -->
                            <input class="note flex-1 min-w-0 rounded border border-gray-300 px-2 py-1 text-sm" placeholder="type to mark this node">
                        </li>
                    </ul>
                    <div class="flex items-center justify-between text-xs text-gray-400 font-mono border-t border-gray-100 pt-2">
                        <span>scrollTop: <span class="scroll-pos" data-target="unkeyed">0</span>px</span>
                        <span class="text-gray-300">(lost on re-render)</span>
                    </div>
                </section>

                <section class="bg-white rounded-xl shadow p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <h2 class="font-semibold text-green-700">With :key</h2>
                        <code class="text-xs bg-gray-100 text-gray-500 rounded px-2 py-1">x-for="item in items" :key="item.id"</code>
                    </div>
                    <ul class="space-y-2 max-h-[340px] overflow-y-auto rounded-lg border border-gray-100 p-2" data-list="keyed">
                        <li x-for="item in items" :key="item.id" class="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                            <span class="node-stamp font-mono text-xs bg-gray-800 text-white rounded px-1.5 py-0.5 shrink-0">node #{{ stampNode() }}</span>
                            <span class="item-name w-20 font-medium shrink-0">{{ item.name }}</span>
                            <input class="note flex-1 min-w-0 rounded border border-gray-300 px-2 py-1 text-sm" placeholder="type to mark this node">
                        </li>
                    </ul>
                    <div class="flex items-center justify-between text-xs text-gray-400 font-mono border-t border-gray-100 pt-2">
                        <span>scrollTop: <span class="scroll-pos" data-target="keyed">0</span>px</span>
                        <span class="text-green-600">(preserved ✓)</span>
                    </div>
                </section>

            </div>
        </div>
        `;
    },

    data() {
        return {
            items: buildItems(),
        };
    },

    init() {
        // Wire scroll indicators after mount
        requestAnimationFrame(() => {
            document.querySelectorAll('[data-list]').forEach(ul => {
                const target = ul.dataset.list;
                const indicator = document.querySelector(`.scroll-pos[data-target="${target}"]`);
                if (!indicator) return;
                const update = () => { indicator.textContent = ul.scrollTop; };
                ul.addEventListener('scroll', update);
            });
        });
    },

    // Reads no signal, so it runs once per created DOM node and never again.
    stampNode() {
        return ++domStamp;
    },

    addOnTop() {
        const name = EXTRA_NAMES[(nextId - 21) % EXTRA_NAMES.length];
        this.data.items.value = [{ id: nextId++, name }, ...this.data.items.value];
    },

    shuffle() {
        const items = [...this.data.items.value];
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        this.data.items.value = items;
    },

    sortByName() {
        this.data.items.value = [...this.data.items.value].sort((a, b) => a.name.localeCompare(b.name));
    },

    // Same ids, brand-new objects: keyed rows update their bindings in place.
    toggleCase() {
        shouting = !shouting;
        this.data.items.value = this.data.items.value.map(item => ({
            id: item.id,
            name: shouting ? item.name.toUpperCase() : item.name.charAt(0) + item.name.slice(1).toLowerCase(),
        }));
    },

    removeFirst() {
        this.data.items.value = this.data.items.value.slice(1);
    },
};

const app = createComponent(KeyedLoopsApp);
app.appendTo(document.getElementById("app"));
