import { effect, Signal } from "./Signals.js";
/**
 * 
 * @param {string} markup 
 * @returns {HTMLElement}
 */
export function html(markup) {
    const tp = document.createElement('template');
    tp.innerHTML = markup.trim();
    return tp.content.firstElementChild;
}
const styleTagsAdded = [];
function bubblify(str) {
    //replace all @click with -bb-onclick
    str = str.replace(/@click/g, '-x-onclick');
    return str;
}
function prepareForReplace(txt) {
    /**
     * @type {string[]}
     */
    const textArr = txt.split('{{');
    const reactiveIndexes = [];
    for (let i = 0; i < textArr.length; i++) {
        if (textArr[i].includes('}}')) {
            const parts = textArr[i].split('}}');
            textArr[i] = parts[0];
            //add second part to the array
            textArr.splice(i + 1, 0, parts[1]);
            reactiveIndexes.push(i);
        }
    }
    return [textArr, reactiveIndexes];
}
/**
 * 
 * @param {{}} component 
 * @param {HTMLElement} child 
 * @param {string[]} textArr 
 * @param {number[]} reactiveIndexes 
 */
function replace(component, child, textArr, reactiveIndexes, moreData = {}) {
    let newText = '';
    const data = { ...component._data, ...moreData };
    if (Object.keys(moreData).length) {
        // console.log('moreData', moreData);
    }
    for (let i = 0; i < textArr.length; i++) {        
        if (reactiveIndexes.includes(i)) {
            const key = textArr[i];
            if (data && data[key]) {
                newText += data[key].value;
            } else {
                console.error(`Key ${key} not found in data`);
            }
        } else {
            newText += textArr[i];
        }
    }
    child.textContent = newText;
}
/**
 * 
 * @param {{}} original 
 * @param {{} | undefined} data 
 * @returns {{
 * $element: HTMLElement,
 * appendTo: (parent: HTMLElement) => void,
 * refs: {Object.<string, HTMLElement>},
 * _data: {Object.<string, SignalObject>},
 * }}
 */
export function createComponent(original, data) {
    let props = {};
    if (data && data.props) {
        props = data.props;
        if (typeof props == "function") {
            props = props();
        }
        delete data.props;
    }
    const component = {
        $element: null,
        appendTo: (parent) => {
            if (component.$element) {
                parent.appendChild(component.$element);
                if(component.mounted){
                    component.mounted();
                }
            }
        },
        refs: {}, ...original, ...data
    };
    let tp = component.setTemplate ? component.setTemplate : component.template;
    if (typeof tp == "function") {
        tp = tp();
    }
    if (tp) {
        component.$element = html(bubblify(tp));
    }
    if (component.$element) {
        [...component.$element.querySelectorAll('[ref]')].forEach(e => {
            component.refs[e.getAttribute('ref')] = e;
        });
        [...component.$element.querySelectorAll('[-x-onclick]')].forEach(e => {
            const _this_component = component;
            const fn = e.getAttribute('-x-onclick').replace('this.', '_this_component.');
            e.onclick = () => eval(fn);
        });        
        //traverse all elements that contain {{
        
        if (component.data) {
            if (typeof component.data == "function") {
                component.data = component.data();
            }
            component._data = {};
            const data = { ...component.data, ...props };
            for (const key in data) {
                component._data[key] = Signal(data[key]);
                if (Array.isArray(data[key])) {
                    for (let i = 0; i < data[key].length; i++) {
                        component._data[key].value[i] = Signal(data[key][i]);
                    }
                }
            }
        }
        //traverse x-model
        [...component.$element.querySelectorAll('[x-model]')].forEach(e => {
            const key = e.getAttribute('x-model');
            if (component._data && component._data[key]) {
                e.value = component._data[key].value;
                e.oninput = () => {
                    component._data[key].value = e.value;
                }
                effect(() => {
                    e.value = component._data[key].value;
                });
                
            }           
        });             
        //const textNodes = component.$element.querySelectorAll('*:not([x-for] *)');
        //get all textnodes not child of a node with x-for attribute
        const textNodes = component.$element.querySelectorAll('*:not([x-for])');
        for (const node of textNodes) {
            for (const child of node.childNodes) {
                if (child.nodeType === 3) {
                    if (child.textContent.includes('{{')) {
                        const [textArr, reactiveIndexes] = prepareForReplace(child.textContent);
                        effect(() => {                           
                            replace(component, child, textArr, reactiveIndexes);
                        });
                    }
                }
            }
        }
        //add x-for
        [...component.$element.querySelectorAll('[x-for]')].forEach(e => {
            //x-for="item in items"
            const parts = e.getAttribute('x-for').split(' in ');
            const key = parts[1];
            const itemkey = parts[0];
            const [textArr, reactiveIndexes] = prepareForReplace(e.textContent);
            const parent = e.parentElement;
            //remove all nodes from parent
            effect(() => {
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
                if (component._data && component._data[key]) {
                    const data = component._data[key].value;
                    for (const d of data) {
                        const clone = e.cloneNode(true);
                        clone.removeAttribute('x-for');
                        replace(component, clone, textArr, reactiveIndexes, { [itemkey]: d });
                        parent.appendChild(clone);
                    }
                }
            });
        });
    }    
    if (component.style && !styleTagsAdded.includes(component.compId)) {
        let style = component.style;
        if (typeof style == "function") {           
            style = style();
        }
        const styleTag = document.createElement('style');
        styleTag.innerHTML = style;
        document.head.appendChild(styleTag);
        if (component.compId) {
            styleTagsAdded.push(component.compId);
        }

    }
    if (component.init) {
        component.init();
    }
    return component;
}