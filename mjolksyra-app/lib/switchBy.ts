type SwitchCase<T, R> = {
  [key: string]: R;
} & { default: R };

export function switchBy<T, K extends string | number, R>(
  input: T,
  selector: (value: T) => K,
  cases: SwitchCase<K, R>
): R {
  const key = selector(input);
  return key in cases ? cases[key] : cases.default;
}
