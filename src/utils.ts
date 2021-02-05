/**
 * Check if an object is an array of a type
 *
 * @description Pretty much just an Array.isArray call. Doesn't actually check if the array is of the given type.
 * @param obj The object to check.
 * @internal
 */
export function isArray<T>(obj: any): obj is T[] {
    return typeof obj === "object" && Array.isArray(obj);
}

/**
 * Check if an @see Element is the specified @see HTMLElement.
 * @param element The @see Element to test.
 * @param tag The HTML Element tag to test for.
 * @internal
 */
export function isElement<T extends keyof HTMLElementTagNameMap>(element: Element, tag: T): element is HTMLElementTagNameMap[T]  {
    return element.tagName === tag.toUpperCase();
}