import assert from 'assert';
import argon2 from 'argon2';
import fs from 'fs';
import { Credentials, CryptoEngine, Kdbx, KdbxEntry, KdbxGroup, KdbxUuid, ProtectedValue} from "kdbxweb";
import { Argon2Type, Argon2Version } from 'kdbxweb/dist/types/crypto/crypto-engine';
import { KdbxUuidFactory } from '../Extention';
import { KdbxItemState } from './KdbxItemState';

export interface ITreeItem {
  itemUuid: KdbxUuid
  parentUuid: KdbxUuid | undefined
}

export interface ITreeStateChange {
  item: KdbxItemState
  treeChanges: ITreeItem
}

export class GlobalContext {

  #filePath: string = ''
  #database: Kdbx | undefined
  #allItems = new Map<string, KdbxEntry | KdbxGroup>();
  #defaultGroupUuid: KdbxUuid | undefined
  #recycleBinUuid: KdbxUuid | undefined

  constructor() {
    CryptoEngine.setArgon2Impl((...args) => this._argon2(...args));
  }

  public allItemsGroupUuid = KdbxUuidFactory.fromHexString('0000000000000000000000000000AAAA');

  public async LoadContextFromFile(filePath: string, password: ProtectedValue) {
    const data = await fs.promises.readFile(filePath);
    const credentials = new Credentials(password, null);
    this.#allItems.clear();
    this.#database = await Kdbx.load(new Uint8Array(data).buffer, credentials);
    for(let item of this.#database.getDefaultGroup().allGroupsAndEntries())
      this.#allItems.set(item.uuid.id, item);
    this.#filePath = filePath;
    this.#defaultGroupUuid = this.#database.getDefaultGroup().uuid;
    this.#recycleBinUuid = this.#database.meta.recycleBinUuid;

    return Array.from(this.#allItems.values())
      .map(i => {return {itemUuid: i.uuid, parentUuid: i.parentGroup?.uuid} as ITreeItem});
  }

  public async SaveFile() {
    assert(this.filePath);
    assert(this.#database);
    let db = await this.#database.save();
    fs.writeFileSync(this.filePath, Buffer.from(db));
  }

  //public get allItems(): Map<KdbxUuid, KdbxEntry | KdbxGroup> { return this.#allItems; }
  public getKdbxItem(uuid: KdbxUuid): KdbxEntry | KdbxGroup {
    const item = this.#allItems.get(uuid.id);
    if (!item)
      throw new Error('item not exists ' + uuid.id);
    //assert(item)
    return item;
  }

  public get filePath() { return this.#filePath; }

  public get defaultGroupUuid(): KdbxUuid {
    assert(this.#defaultGroupUuid)
    return this.#defaultGroupUuid;
  }

  public get recycleBinUuid(): KdbxUuid | undefined { return this.#recycleBinUuid; }

  public get database(): Kdbx {
    assert(this.#database);
    return this.#database
  }

  //public get recycleBin(): KdbxGroup { return this.getKdbxItem(this.recycleBinUuid) as KdbxGroup}

  public getCustomIcon(iconUuid: KdbxUuid){
    return this.database.meta.customIcons.get(iconUuid.id);
  }

  public get allCustomIcons(): {iconId: string, iconImage: string}[] {
    return Array
      .from(this.database.meta.customIcons)
      .map(icon => {
        return {
          iconId: icon[0],
          iconImage: 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(icon[1].data)))
        }
      })
  }

  public removeUnusedIcons(){
    this.database.meta.customIcons.forEach((_, id) => {
      const usedInEntry = this.#allItems.findFirstValue<KdbxEntry | KdbxGroup>(entry =>
        (entry.customIcon?.id === id ||
        (entry instanceof KdbxEntry && !!entry.history.find(e => e.customIcon?.id === id)))
      );
      if (!usedInEntry){
        this.database.meta.customIcons.delete(id);
      }
    })
  }

  public createItem(parentGroupUuid: KdbxUuid, isGroup: boolean, groupName: string = ''): ITreeStateChange {
    const kdbxGroup = this.getKdbxItem(parentGroupUuid);
    assert(kdbxGroup instanceof KdbxGroup);
    let newItem = isGroup
      ? this.database.createGroup(kdbxGroup, groupName)
      : this.database.createEntry(kdbxGroup);
    this.#allItems.set(newItem.uuid.id, newItem);
    return {
      item: new KdbxItemState(newItem.uuid),
      treeChanges: {itemUuid: newItem.uuid, parentUuid: parentGroupUuid} as ITreeItem
    }
  }

  private async _argon2 (
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
}

export const currentContext = new GlobalContext();
