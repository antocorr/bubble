import { describe, expect, it } from "vitest";
import { createComponent } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

function makeApp() {
  return {
    template() {
      return `
        <div>
          <button id="reverse" @click="reverse">Reverse</button>
          <button id="relabel" @click="relabel">Relabel</button>
          <ul>
            <li class="row" x-for="item in items" :key="item.id">
              <span class="label">{{ item.label }}</span>
              <input class="note">
            </li>
          </ul>
        </div>
      `;
    },
    data() {
      return {
        items: [
          { id: "a", label: "Alpha" },
          { id: "b", label: "Bravo" },
          { id: "c", label: "Charlie" },
        ],
      };
    },
    reverse() {
      this.data.items.value = [...this.data.items.value].reverse();
    },
    relabel() {
      // same ids, brand-new objects with changed labels
      this.data.items.value = this.data.items.value.map((item) => ({
        id: item.id,
        label: item.label.toUpperCase(),
      }));
    },
  };
}

function mount(App) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  createComponent(App).appendTo(host);
  return host;
}

function rowsByLabel(host) {
  const map = {};
  host.querySelectorAll(".row").forEach((li) => {
    map[li.querySelector(".label").textContent.trim()] = li;
  });
  return map;
}

describe("keyed x-for", () => {
  it("reuses the same DOM node when the list is reordered", async () => {
    const host = mount(makeApp());
    const before = rowsByLabel(host);

    host.querySelector("#reverse").click();
    await flushMicrotasks();

    const after = rowsByLabel(host);
    // visual order is reversed...
    const order = [...host.querySelectorAll(".label")].map((el) => el.textContent.trim());
    expect(order).toEqual(["Charlie", "Bravo", "Alpha"]);
    // ...but each label still points to the very same element instance (moved, not recreated)
    expect(after.Alpha).toBe(before.Alpha);
    expect(after.Bravo).toBe(before.Bravo);
    expect(after.Charlie).toBe(before.Charlie);
  });

  it("keeps unmanaged DOM state (typed input) across a reorder", async () => {
    const host = mount(makeApp());
    rowsByLabel(host).Bravo.querySelector(".note").value = "typed by user";

    host.querySelector("#reverse").click();
    await flushMicrotasks();

    expect(rowsByLabel(host).Bravo.querySelector(".note").value).toBe("typed by user");
  });

  it("updates content when the same key receives new data", async () => {
    const host = mount(makeApp());
    const before = rowsByLabel(host);

    host.querySelector("#relabel").click();
    await flushMicrotasks();

    const labels = [...host.querySelectorAll(".label")].map((el) => el.textContent.trim());
    expect(labels).toEqual(["ALPHA", "BRAVO", "CHARLIE"]);
    // node reused, only the binding re-ran
    expect(host.querySelector(".row")).toBe(before.Alpha);
  });
});
