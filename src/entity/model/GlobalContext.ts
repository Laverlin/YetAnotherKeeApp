import assert from 'assert';
import argon2 from 'argon2';
import fs from 'fs';
import { Credentials, CryptoEngine, Kdbx, KdbxCustomIcon, KdbxEntry, KdbxGroup, KdbxUuid, ProtectedValue} from "kdbxweb";
import { Argon2Type, Argon2Version } from 'kdbxweb/dist/types/crypto/crypto-engine';
import { KdbxUuidFactory } from '../Extention';


/**
 * Singleton with single source of truth of entries
 */
export class GlobalContext {

  private database: Kdbx
  private allItems = new Map<string, KdbxEntry | KdbxGroup>();

  private constructor(database: Kdbx, filePath: string) {
    this.filePath = filePath;
    this.database = database;
    this.defaultGroupUuid = this.database.getDefaultGroup().uuid;
    this.recycleBinUuid = this.database.meta.recycleBinUuid;

    for(let item of this.database.getDefaultGroup().allGroupsAndEntries())
      this.allItems.set(item.uuid.id, item);
  }

  /**
   * Creates global context by loading all data form specifed database
   * @param filePath - path to the database file
   * @param password - password from the file
   * @returns created global context object
   */
  static async LoadContext(filePath: string, password: ProtectedValue): Promise<GlobalContext> {
    CryptoEngine.setArgon2Impl((...args) => argon2Hash(...args));
    const data = await fs.promises.readFile(filePath);
    const credentials = new Credentials(password, null);
    const database = await Kdbx.load(new Uint8Array(data).buffer, credentials);
    return new GlobalContext(database, filePath);
  }

  /**
   * contstant, UUID of artifitial group that holds reference to all entries
   */
  static readonly allItemsGroupUuid = KdbxUuidFactory.fromHexString('0000000000000000000000000000AAAA');
  readonly filePath: string
  readonly defaultGroupUuid: KdbxUuid
  readonly recycleBinUuid: KdbxUuid | undefined

  /**
   * Saves all changes in database file
   */
  async SaveContext() {
    let db = await this.database.save();
    fs.writeFileSync(this.filePath, Buffer.from(db));
  }

  /**
   * returns Item (Group or Entry) by it's uuid
   */
  getKdbxItem(uuid: KdbxUuid): KdbxEntry | KdbxGroup {
    const item = this.allItems.get(uuid.id);
    if (!item)
      throw new Error('item not exists ' + uuid.id);
    return item;
  }

  /**
   * returns ids of all items
   */
  get allItemIds(): KdbxUuid[] {
    return Array.from(this.allItems.values()).map(i => i.uuid)
  }

  /**
   * returns if recycle bin enabled in this database
   */
  get isRecycleBinAvailable(): boolean {
    return !!this.recycleBinUuid &&
      !this.recycleBinUuid.empty
  }

  /**
   * returns custom Icon by it's uuid
   */
  getCustomIcon(iconUuid: KdbxUuid){
    return this.database.meta.customIcons.get(iconUuid.id);
  }

  /**
   * returns all custom icons
   */
  get allCustomIcons(): {iconId: string, iconImage: string}[] {
    return Array
      .from(this.database.meta.customIcons)
      .map(icon => {
        return {
          iconId: icon[0],
          iconImage: 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(icon[1].data)))
        }
      })
  }

  /**
   * removes all icons that not used in any items or in items history
   */
  removeUnusedIcons(){
    this.database.meta.customIcons.forEach((_, id) => {
      const usedInEntry = this.allItems.findFirstValue<KdbxEntry | KdbxGroup>(entry =>
        (entry.customIcon?.id === id ||
        (entry instanceof KdbxEntry && !!entry.history.find(e => e.customIcon?.id === id)))
      );
      if (!usedInEntry){
        this.database.meta.customIcons.delete(id);
      }
    })
  }

  /**
   * creates new Entry or Group
   * @param parentGroupUuid - uuid of parent group for this item
   * @param isGroup - are we creating group or entry (true for group)
   * @param groupName - if we creating group we can specify its name
   * @returns uuid of created item
   */
  createItem(parentGroupUuid: KdbxUuid, isGroup: boolean, groupName: string = ''): KdbxUuid {
    const kdbxGroup = this.getKdbxItem(parentGroupUuid);
    assert(kdbxGroup instanceof KdbxGroup);
    let newItem = isGroup
      ? this.database.createGroup(kdbxGroup, groupName)
      : this.database.createEntry(kdbxGroup);
    this.allItems.set(newItem.uuid.id, newItem);
    return newItem.uuid;
  }

  /**
   * moves item to another loaction in tree
   * @param item item to move
   * @param group new parent group
   * @param atIndex specific place to move
   */
  moveItem(item: KdbxEntry | KdbxGroup, group: KdbxGroup, atIndex?: number) {
    this.database.move(item, group, atIndex);
  }

  /**
   * Add or replace custom icon
   * @param iconId - unique icon ID
   * @param iconData - image
   */
  setCustomIcon(iconId: string, iconData: KdbxCustomIcon) {
    this.database.meta.customIcons.set(iconId, iconData);
  }
}

/**
 * set global context
 * @param context created global context
 */
export const setGlobalContext = (context: GlobalContext) => {
  globalContext = context;
}

/**
 *
 * @returns wrapper on current open database
 */
export const currentContext = (): GlobalContext => {
  assert(globalContext)
  return globalContext
}

/**
 * Argon2 hash implementation
 * @param password
 * @param salt
 * @param memory
 * @param iterations
 * @param length
 * @param parallelism
 * @param type
 * @param version
 * @returns Uint8Array Buffer
 */
async function argon2Hash(
  password: ArrayBuffer,
  salt: ArrayBuffer,
  memory: number,
  iterations: number,
  length: number,
  parallelism: number,
  type: Argon2Type,
  version: Argon2Version
): Promise<ArrayBuffer> {
  const hash = await argon2.hash(Buffer.from(password), {
      salt: Buffer.from(salt),
      memoryCost: memory,
      timeCost: iterations,
      parallelism: parallelism,
      type: type,
      version: version,
      hashLength: length,
      raw: true
  });
  return new Uint8Array(hash.buffer);
}

let globalContext: GlobalContext | undefined = undefined



