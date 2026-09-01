/** Bounded least-recently-used cache. Used to collapse repeated identical AI prompts. */
export class LruCache<TValue> {
  readonly #entries = new Map<string, TValue>();

  constructor(private readonly maxEntries: number) {
    if (maxEntries <= 0) throw new Error('LruCache needs a positive maxEntries');
  }

  get(key: string): TValue | undefined {
    const value = this.#entries.get(key);
    if (value === undefined) return undefined;
    this.#entries.delete(key);
    this.#entries.set(key, value);
    return value;
  }

  set(key: string, value: TValue): void {
    if (this.#entries.has(key)) this.#entries.delete(key);
    this.#entries.set(key, value);
    if (this.#entries.size > this.maxEntries) {
      const oldest = this.#entries.keys().next();
      if (oldest.done !== true) this.#entries.delete(oldest.value);
    }
  }

  has(key: string): boolean {
    return this.#entries.has(key);
  }

  clear(): void {
    this.#entries.clear();
  }

  get size(): number {
    return this.#entries.size;
  }
}
