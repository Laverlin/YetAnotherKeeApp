import { KdbxUuid } from "kdbxweb";

export class KdbxUuidFactory {

  /** Creates KbdxUuid form the hex sting
   *  @example
   *    KdbxUuidFactory.fromHexString('0000000000000000000000000000AAAA');
   */
  static fromHexString(hexString: string): KdbxUuid {
    if (hexString.length !== 32)
      throw 'wrong length of Uuid hex string'
    return new KdbxUuid(KdbxUuidFactory.hexStringToUint8Array(hexString));
  }

  static hexStringToUint8Array(hexString: string) {
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
