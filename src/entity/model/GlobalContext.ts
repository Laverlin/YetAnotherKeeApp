import assert from 'assert';
import fs from 'fs';
import { Credentials, Kdbx, KdbxEntry, KdbxGroup, KdbxUuid, ProtectedValue} from "kdbxweb";
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

  public allItemsGroupUuid = KdbxUuidFactory.fromHexString('0000000000000000000000000000AAAA');

  public async LoadContextFromFile(filePath: string, password: ProtectedValue) {
    const data = await fs.promises.readFile(filePath);
    const credentials = new Credentials(password, null);
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
}

export const currentContext = new GlobalContext();
