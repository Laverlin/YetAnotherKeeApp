import { KdbxEntry, KdbxUuid } from "kdbxweb";

export class KdbxUuidFactory {

  /** Creates KbdxUuid form the hex sting
   *  @example KdbxUuidFactory.fromHexString('0000000000000000000000000000AAAA');
   */
  public static fromHexString(hexString: string): KdbxUuid {
    if (hexString.length !== 32)
      throw 'wrong length of Uuid hex string'
    return new KdbxUuid(KdbxUuidFactory.hexStringToUint8Array(hexString));
  }

  private static hexStringToUint8Array(hexString: string) {
    if (hexString.length % 2 !== 0) {
      throw "Invalid hexString";
    }

    const buffer: Array<number> = [];
    let hexArray = Array.from(hexString);
    while(hexArray.length > 0) {
      buffer.push(parseInt(`0x${hexArray.splice(0, 2).join('')}`))
    }
    return new Uint8Array(buffer);
  }
}

declare global {
  export interface Map<K, V> {
    findValue<V>(predicate: (item: V) => boolean): V | undefined
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


Map.prototype.findValue = function<K, V>(this: Map<K, V>, predicate: (item: V) => boolean): V | undefined {
  for(const item of this.values()) {
    if (predicate(item))
      return item;
  }
  return undefined
}







