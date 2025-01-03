export function insertAt<T>(array: T[], index: number | undefined, element: T) {
  if (index === undefined) {
    return [...array, element];
  }

  if (index < 0 || index > array.length) {
    throw new Error("Index out of bounds");
  }
  return [...array.slice(0, index), element, ...array.slice(index)];
}
