export function sortBy<T, U>(
  array: T[],
  selector: (item: T) => U,
  ascending: boolean = true
): T[] {
  return array.slice().sort((a, b) => {
    const valueA = selector(a);
    const valueB = selector(b);

    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
}
