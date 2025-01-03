export function groupBy<T, TKey extends string | number | symbol>(
  items: T[],
  selector: (item: T) => TKey
): Record<TKey, T[]> {
  return items.reduce((accumulator, currentItem) => {
    const key = selector(currentItem);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(currentItem);
    return accumulator;
  }, {} as Record<TKey, T[]>);
}
