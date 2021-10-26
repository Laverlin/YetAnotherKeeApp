declare global {
  export interface Map<K, V> {
    findFirstValue<V>(predicate: (item: V) => boolean): V | undefined
  }

  export interface Number {
    formatBytes(): string;
  }
}

export function findFirst<T>(iterable: IterableIterator<T>, predicate: (item: T) => boolean): T | undefined {
  for(const item of iterable) {
    if (predicate(item))
      return item;
  }
  return undefined
}

export function findFirstOrDefault<T>(iterable: IterableIterator<T>, predicate: (item: T) => boolean, dflt: T): T {
  return findFirst(iterable, predicate) || dflt;
}


Map.prototype.findFirstValue = function<K, V>(this: Map<K, V>, predicate: (item: V) => boolean): V | undefined {
  for(const item of this.values()) {
    if (predicate(item))
      return item;
  }
  return undefined
}

/**
 * Format bytes as string with size symbols
 */
Number.prototype.formatBytes = function formatBytes(this: number, decimals = 2) {
  if (this === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(this) / Math.log(k));

  return parseFloat((this / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}








