import { Thing } from './schema-simple.js'
import {pushMany} from './utils.js'
import {jsonify, MicroJsonThing} from './jsonify.js'

export interface ParseOptions {
    skipOnMultiType?: boolean;
    skipOnNoType?: boolean;
}

/**
 * Read micro data from an HTML element tree.
 *
 * @param element - The root of the HTML element tree.
 * @param options - The options for parsing the tree.
 * @returns The parsed micro data.
 *
 * @see {@link https://html.spec.whatwg.org/multipage/microdata.html}
 */
export function parse(element: HTMLElement, options: ParseOptions = {}): Thing[] {
    const topLevel = findTopLevel(element);
    const jsoned = jsonify(topLevel);
    const things: Thing[] = [];
    for (const item of jsoned.items) {
        const thing = parseMicroJsonThing(item, options);
        if (thing !== null) {
            things.push(thing);
        }
    }
    return things;
}

function parseMicroJsonThing(item: MicroJsonThing, options: ParseOptions): Thing | null {
    if (typeof item.type === "undefined" || item.type.length == 0) {
        if (options.skipOnNoType) {
            return null;
        }
        throw new Error("No Type");
    }
    if (item.type.length > 1) {
        if (options.skipOnMultiType) {
            return null;
        }
        throw new Error("More than one Type");
    }
    const thing: Thing = {
        "@type": item.type[0]
    };
    if (item.id) {
        thing["identifier"] = item.id;
    }
    for (const propertyName in item.properties) {
        const propertyValues = item.properties[propertyName];
        switch (propertyValues.length) {
            case 0:
                break;
            case 1:
                thing[propertyName] = getThing(propertyValues[0], options);
                break;
            default:
                const arr: Thing[] = [];
                for (const propertyValue of propertyValues) {
                    const subThing = getThing(propertyValue, options);
                    if (subThing !== null) {
                        arr.push(subThing);
                    }
                }
                thing[propertyName] = arr;
                break;
        }
    }
    return thing;
}

function getThing(propertyValue: string | MicroJsonThing, options: ParseOptions): Thing | null {
    return typeof propertyValue === "string" ? propertyValue :  parseMicroJsonThing(propertyValue, options);
}

/**
 *
 * @param element
 * @see {@link https://html.spec.whatwg.org/multipage/microdata.html#top-level-microdata-items}
 */
function findTopLevel(element: Element): Element[] {
    if (isTopLevel(element)) {
        return [element];
    }
    const result:Element[] = [];
    const pending:Element[] = [];
    pushMany(pending, Array.from(element.children));
    while (pending.length > 0) {
        const current = pending.pop() as Element;
        if (isTopLevel(current)) {
            result.push(current);
        } else {
            pushMany(pending, Array.from(current.children));
        }
    }
    return result;
}

function isTopLevel(element: Element): boolean {
    return element.hasAttribute("itemscope") && element.hasAttribute("itemtype") && !element.hasAttribute("itemprop");
}