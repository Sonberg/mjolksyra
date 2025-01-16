export function insertAt<T>(
  array: T[],
  index: number | undefined | null,
  element: T
) {
  if (index === undefined || index === null || index === -1) {
    return [...array, element];
  }

  if (index < 0 || index > array.length) {
    throw new Error("Index out of bounds");
  }
  return [...array.slice(0, index), element, ...array.slice(index)];
}
