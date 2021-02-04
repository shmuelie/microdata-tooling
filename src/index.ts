import { compareOrder } from 'https://unpkg.com/browse/sort-nodes@0.1.1/dist/index.js'

export interface ThingBase {
    "@type": string;
}

export type Thing = ThingBase | string;

function isArray<T>(obj: any): obj is T[] {
    return typeof obj === "object" && Array.isArray(obj);
}

function isElement2<T extends keyof HTMLElementTagNameMap>(element: Element, tag: T): element is HTMLElementTagNameMap[T]  {
    return element.tagName === tag.toUpperCase();
}

/**
 * Options for applying micro data.
 */
export interface ApplyOptions {
    /**
     * Format the text for a HyperLink.
     */
    linkFormatter?: (data: string, elementData: DOMStringMap) => string | null;
    /**
     * Format the text for a time element.
     */
    timeFormatter?: (data: string, elementData: DOMStringMap) => string;
    /**
     * Format the text for a data element.
     */
    dataFormatter?: (data: string, elementData: DOMStringMap) => string;
    typeHelpers?: {
        [t: string]: (data: Thing, element: HTMLElement) => boolean;
    };
}

/**
 * Get a property from an object.
 *
 * @description Helps keep type safety when trying to access property using indexing.
 * @param obj Object to get property of.
 * @param propertyName Name of property to get.
 */
function getProperty<T>(obj: any, propertyName: string): T | null {
    if (propertyName in obj) {
        return obj[propertyName] as T;
    }
    return null;
}

/**
 * Apply micro data to an HTML element tree.
 * @param data The micro data to apply.
 * @param element The root of the HTML element tree.
 * @see https://html.spec.whatwg.org/multipage/microdata.html
 */
export function apply(data: Thing, element: HTMLElement, options: ApplyOptions = {}): void {
    if (typeof data === "string") {
        applyAsString(data, element, options);
    } else if (isArray<Thing>(data)) {
        applyAsArray(data, element, options);
    } else if (options.typeHelpers && data["@type"] in options.typeHelpers && options.typeHelpers[data["@type"]](data, element)) {
        return;
    } else {
        for (const propertyName of Object.keys(data).filter(pn => !pn.startsWith("@"))) {
            const propertyValue = getProperty<Thing>(data, propertyName);
            const elementProperty = element.querySelector<HTMLElement>("*[itemprop=" + propertyName + "]");
            if (elementProperty !== null && propertyValue !== null) {
                apply(propertyValue, elementProperty, options);
            }
        }
    }
}

/**
 *
 * @param data
 * @param element
 * @param options
 * @see https://html.spec.whatwg.org/multipage/microdata.html#values
 */
function applyAsString(data: string, element: HTMLElement, options: ApplyOptions): void {
    if (isElement2(element, "meta")) {
        element.content = data;
    } else if (isElement2(element, "img") ||
               isElement2(element, "audio") ||
               isElement2(element, "embed") ||
               isElement2(element, "iframe") ||
               isElement2(element, "source") ||
               isElement2(element, "track") ||
               isElement2(element, "video")) {
        element.src = data;
    } else if (isElement2(element, "a") ||
               isElement2(element, "area") ||
               isElement2(element, "link")) {
        element.href = data;
        if (options.linkFormatter && isElement2(element, "a")) {
            const text = options.linkFormatter(data, element.dataset);
            if (text) {
                element.innerText = text;
            }
        }
    } else if (isElement2(element, "object")) {
        element.data = data;
    } else if (isElement2(element, "data")) {
        element.value = data;
        if (options.dataFormatter) {
            element.innerText = options.dataFormatter(data, element.dataset);
        }
    } else if (isElement2(element, "meter")) {
        element.value = parseInt(data);
    } else if (isElement2(element, "time")) {
        element.dateTime = data;
        if (options.timeFormatter) {
            element.innerText = options.timeFormatter(data, element.dataset);
        }
    } else {
        element.innerText = data;
    }
}

function getElementValue(element: Element): string | Element {
    if (isElement2(element, "meta")) {
        return element.content;
    }
    if (isElement2(element, "img") ||
               isElement2(element, "audio") ||
               isElement2(element, "embed") ||
               isElement2(element, "iframe") ||
               isElement2(element, "source") ||
               isElement2(element, "track") ||
               isElement2(element, "video")) {
        return element.src;
    }
    if (isElement2(element, "a") ||
               isElement2(element, "area") ||
               isElement2(element, "link")) {
        return element.href;
    }
    if (isElement2(element, "object")) {
        return element.data;
    }
    if (isElement2(element, "data")) {
        return element.value;
    }
    if (isElement2(element, "meter")) {
        return element.value.toString();
    }
    if (isElement2(element, "time")) {
        return element.dateTime;
    }
    return element;
}

function applyAsArray(data: Thing[], element: HTMLElement, options: ApplyOptions): void {
    for (const item of data) {
        const tmpl = (typeof item === "string") ? element.querySelector<HTMLTemplateElement>("template[data-type=Text]") : element.querySelector<HTMLTemplateElement>("template[data-type=" + item["@type"] + "]");
        if (tmpl && tmpl.content.firstElementChild) {
            const clone = tmpl.content.firstElementChild.cloneNode(true) as HTMLElement;
            apply(item, clone, options);
            element.appendChild(clone);
        }
    }
}

/**
 * Read micro data from an HTML element tree.
 * @param element The root of the HTML element tree.
 * @returns The parsed micro data.
 * @see https://html.spec.whatwg.org/multipage/microdata.html
 */
//export function parse<T extends Thing>(element: HTMLElement): T | null {
    //return null;
//}

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
 * Read micro data from an HTML element tree as specified in the standard.
 * @param element
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
        if (typeof value === "string") {

        } else {
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
    pending.push.apply(pending, Array.from(root.children));
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
        if (memory.indexOf(current) !== -1) {
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
            throw new Error("Microdata Error");
        }
    }
    results.sort(compareOrder);
    return results;
}