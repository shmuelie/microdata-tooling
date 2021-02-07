/**
 * Read micro data from an HTML element tree.
 * @param element The root of the HTML element tree.
 * @returns The parsed micro data.
 * @see https://html.spec.whatwg.org/multipage/microdata.html
 */
//export function parse<T extends Thing>(element: HTMLElement): T | null {
    //return null;
//}

export { MicroJson, MicroJsonThing, jsonify } from './jsonify.js'
export { apply, Thing, ApplyOptions } from './apply.js'
