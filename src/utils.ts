/**
 * Check if an object is an array of a type
 *
 * @remarks
 *
 * Pretty much just an Array.isArray call. Doesn't actually check if the array is of the given type.
 *
 * @param obj - The object to check.
 * @returns true if obj is an Array; false otherwise.
 *
 * @internal
 */
export function isArray<T>(obj: any): obj is T[] {
    return typeof obj === "object" && Array.isArray(obj);
}

/**
 * Check if an {@link Element} is the specified {@link HTMLElement}.
 *
 * @param element - The {@link Element} to test.
 * @param tag - The HTML Element tag to test for.
 * @returns true if element is the requested tag; otherwise, false.
 *
 * @internal
 */
export function isElement<T extends keyof HTMLElementTagNameMap>(element: Element, tag: T): element is HTMLElementTagNameMap[T]  {
    return element.tagName === tag.toUpperCase();
}

/**
 * Push all items in an array to an array.
 *
 * @param arr - The array to push to.
 * @param items - The array to push from.
 *
 * @internal
 */
export function pushMany<T>(arr: T[], items: T[]): void {
    arr.push.apply(arr, items);
}