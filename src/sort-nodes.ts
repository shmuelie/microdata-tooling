// imported from https://github.com/megazazik/sort-nodes/tree/734c4eaa6b8f73b41f7f7b2148b1067068fb2f41

/**
 * Sort nodes according to the HTML tree order
 *
 * @param nodes Array of nodes
 * @param [reverse=false] Need reverse order
 * @internal
 */
export function sortNodes(nodes: Element[], reverse = false): Element[] {
  return [...nodes].sort(reverse ? reverseCompareOrder : compareOrder);
}

/**
 *
 * @param a
 * @param b
 * @internal
 */
export function reverseCompareOrder(a: Element, b: Element): 1 | -1 | 0 {
  return (compareOrder(a, b) * -1) as 1 | -1 | 0;
}

/**
 *
 * @param a
 * @param b
 * @internal
 */
export function compareOrder(a: Element, b: Element): 1 | -1 | 0 {
  const posCompare = a.compareDocumentPosition(b);

  if (posCompare & 4 || posCompare & 16) {
    // a < b
    return -1;
  } else if (posCompare & 2 || posCompare & 8) {
    // a > b
    return 1;
  } else if (posCompare & 1 || posCompare & 32) {
    throw "Cannot sort the given nodes.";
  } else {
    return 0;
  }
}
