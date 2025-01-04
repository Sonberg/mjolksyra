export function flatten<T, U>(array: T[], selector: (item: T) => U[]): U[] {
  return array.reduce<U[]>((acc, item) => acc.concat(selector(item)), []);
}
