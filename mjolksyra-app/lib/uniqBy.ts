export function uniqBy<T, K>(array: T[], selector: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = selector(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
