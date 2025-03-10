declare global {
  type Signal =
    | {
        signal?: AbortSignal;
      }
    | undefined;

  type Action<TRes> = (req?: Signal) => Promise<TRes>;

  type Func<T, TRes = void> = (request: T & Signal) => Promise<TRes>;
}

export {};
