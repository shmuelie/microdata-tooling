import { Thing } from './schema-simple.js'
import {pushMany} from './utils.js'
import {jsonify} from './jsonify.js'

/**
 * Read micro data from an HTML element tree.
 * @param element The root of the HTML element tree.
 * @returns The parsed micro data.
 * @see https://html.spec.whatwg.org/multipage/microdata.html
 */
export function parse(element: HTMLElement): Thing[] | null {
    const topLevel = findTopLevel(element);
    const jsoned = jsonify(topLevel);
    if (jsoned.items.length === 0) {
        return null;
    }
    const things: Thing[] = [];
    for (const item of jsoned.items) {

    }
}

/**
 *
 * @param element
 * @see https://html.spec.whatwg.org/multipage/microdata.html#top-level-microdata-items
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