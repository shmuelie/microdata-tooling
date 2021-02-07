import {isArray, isElement} from './utils.js'

interface ThingBase {
    "@type": string;
}

export type Thing = ThingBase | string;

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
    /**
     * Methods that allow for special handling for types.
     */
    typeHelpers?: {
        /**
         * Map from type to special handler.
         */
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
    if (isElement(element, "meta")) {
        element.content = data;
    } else if (isElement(element, "img") ||
               isElement(element, "audio") ||
               isElement(element, "embed") ||
               isElement(element, "iframe") ||
               isElement(element, "source") ||
               isElement(element, "track") ||
               isElement(element, "video")) {
        element.src = data;
    } else if (isElement(element, "a") ||
               isElement(element, "area") ||
               isElement(element, "link")) {
        element.href = data;
        if (options.linkFormatter && isElement(element, "a")) {
            const text = options.linkFormatter(data, element.dataset);
            if (text) {
                element.innerText = text;
            }
        }
    } else if (isElement(element, "object")) {
        element.data = data;
    } else if (isElement(element, "data")) {
        element.value = data;
        if (options.dataFormatter) {
            element.innerText = options.dataFormatter(data, element.dataset);
        }
    } else if (isElement(element, "meter")) {
        element.value = parseInt(data);
    } else if (isElement(element, "time")) {
        element.dateTime = data;
        if (options.timeFormatter) {
            element.innerText = options.timeFormatter(data, element.dataset);
        }
    } else {
        element.innerText = data;
    }
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