import {isElement,pushMany} from './utils.js'
import {compareOrder} from './sort-nodes.js'

export interface MicroJson {
    items: MicroJsonThing[];
}

export interface MicroJsonThing {
    type?: string[];
    id?: string;
    properties: {
        [k: string]: (MicroJsonThing | string)[];
    };
}

/**
 * @summary Read micro data from an HTML element tree as specified in the standard.
 * @description Unlike with the spec, the returned value is an object model, not a JSON string.
 * @param nodes The elements to extract from.
 * @returns Extracted micro data.
 * @see https://html.spec.whatwg.org/multipage/microdata.html#json
 */
export function jsonify(nodes: Element[]): MicroJson {
    const result: MicroJson = {
        items: []
    };
    for (const node of nodes) {
        if (!node.hasAttribute("itemprop")) {
            result.items.push(getTheObject(node));
        }
    }
    return result;
}

/**
 *
 * @param item
 * @param memory
 * @see https://html.spec.whatwg.org/multipage/microdata.html#get-the-object
 */
function getTheObject(item: Element, memory: Element[] = []): MicroJsonThing {
    const result: MicroJsonThing = {
        properties: {}
    };
    memory.push(item);
    if (item.hasAttribute("itemtype")) {
        result.type = (item.getAttribute("itemtype") as string).split(" ");
    }
    if (item.hasAttribute("itemid")) {
        result.id = item.getAttribute("itemid") as string;
    }
    for (const element of thePropertiesOfAnItem(item)) {
        const name = element.getAttribute("itemprop");
        if (name === null) {
            throw new Error();
        }
        let value: string | Element | MicroJsonThing = getElementValue(element);
        if (typeof value !== "string") {
            if (memory.indexOf(value) !== -1) {
                value = "ERROR";
            } else {
                value = getTheObject(value, memory);
            }
        }
        if (!(name in result.properties)) {
            result.properties[name] = [];
        }
        result.properties[name].push(value);
    }
    return result;
}

/**
 * Find the properties of an item.
 * @param root The element that defines the item.
 * @see https://html.spec.whatwg.org/multipage/microdata.html#the-properties-of-an-item
 */
function thePropertiesOfAnItem(root: Element): Element[] {
    const results: Element[] = [];
    const memory: Element[] = [];
    const pending: Element[] = [];
    memory.push(root);
    pushMany(pending, Array.from(root.children));
    if (root.hasAttribute("itemref")) {
        for (const refid of (root.getAttribute("itemref") as string).split(" ")) {
            const refElmt = root.querySelector("#" + refid);
            if (refElmt) {
                pending.push(refElmt);
            }
        }
    }
    while (pending.length > 0) {
        const current = pending.pop() as Element;
        if (memory.indexOf(current) === -1) {
            memory.push(current);
            if (!current.hasAttribute("itemscope")) {
                pending.push.apply(pending, Array.from(current.children));
            }
            if (current.hasAttribute("itemprop")) {
                const itemprop = current.getAttribute("itemprop");
                if (itemprop !== null && itemprop.length > 0) {
                    results.push(current);
                }
            }
        } else {
            //throw new Error("Microdata Error");
            console.log("Microdata Error", current);
        }
    }
    results.sort(compareOrder);
    return results;
}

function getElementValue(element: Element): string | Element {
    if (element.hasAttribute("itemscope")) {
        return element;
    }
    if (isElement(element, "meta")) {
        return element.content;
    }
    if (isElement(element, "img") ||
               isElement(element, "audio") ||
               isElement(element, "embed") ||
               isElement(element, "iframe") ||
               isElement(element, "source") ||
               isElement(element, "track") ||
               isElement(element, "video")) {
        return element.src;
    }
    if (isElement(element, "a") ||
               isElement(element, "area") ||
               isElement(element, "link")) {
        return element.href;
    }
    if (isElement(element, "object")) {
        return element.data;
    }
    if (isElement(element, "data")) {
        return element.value;
    }
    if (isElement(element, "meter")) {
        return element.value.toString();
    }
    if (isElement(element, "time")) {
        return element.dateTime;
    }
    return element.textContent || "";
}