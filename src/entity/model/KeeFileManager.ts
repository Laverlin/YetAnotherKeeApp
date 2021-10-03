import assert from 'assert';
import fs from 'fs';
import { Credentials, Kdbx, KdbxEntry, KdbxGroup, KdbxUuid, ProtectedValue} from "kdbxweb";
import { KdbxUuidFactory } from '../Extention';
import { MoveDirection } from '../KeeData';
import { GroupStatistics } from './GroupStatistics';
import { IKdbxContext, KdbxItemWrapper } from './KdbxItemWrapper';

export class KeeFileManager {

  public static allItemsGroupUuid = KdbxUuidFactory.fromHexString('0000000000000000000000000000AAAA');

  public static async LoadFile(filePath: string, password: ProtectedValue) {

    const data = await fs.promises.readFile(filePath);
    const credentials = new Credentials(password, null);
    const database = await Kdbx.load(new Uint8Array(data).buffer, credentials);
    this._database = database;
    this._allItems = Array.from(this.database.getDefaultGroup().allGroupsAndEntries());

    let stats: GroupStatistics[] = [];
    let entries: KdbxItemWrapper[] = [this._allItemsWrapperGroup];
    this._context = {
      defaultGroupUuid: database.getDefaultGroup().uuid,
      recycleBinUuid: database.meta.recycleBinUuid
    }
    entries = entries.concat(
      this.allItems.map((item, index) => new KdbxItemWrapper(item.uuid, index, this._context!))
    )
    stats = this.allItems
      .filter(i => i instanceof KdbxGroup)
      .map(item => GroupStatistics.fromKdbxEntry(item as KdbxGroup))
    stats.push(this._allItemsStats(entries));
    return [entries, stats] as const;
  }

  public static get context(): IKdbxContext {
    assert(this._context);
    return this._context;
  };

  public static getCustomIcon(iconUuid: KdbxUuid){
    return this.database.meta.customIcons.get(iconUuid.id);
  }

  public static get database(): Kdbx {
    if (!this._database)
      throw new Error('Database is not initialized yet');
    return this._database;
  }

  public static get allCustomIcons(): {iconId: string, iconImage: string}[] {
    return Array
      .from(this.database.meta.customIcons)
      .map(icon => {
        return {
          iconId: icon[0],
          iconImage: 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(icon[1].data)))
        }
      })
  }

  public static removeUnusedIcons(){
    this.database.meta.customIcons.forEach((_, id) => {
      const usedInEntry = KeeFileManager.allItems.find(entry =>
        (entry.customIcon?.id === id ||
        (entry instanceof KdbxEntry && !!entry.history.find(e => e.customIcon?.id === id)))
      );
      if (!usedInEntry){
        this.database.meta.customIcons.delete(id);
      }
    })
  }

  public static createItem(parentGroup: KdbxItemWrapper, isGroup: boolean, groupName: string = '') {
    const kdbxGroup = this.allItems.find(g => g.uuid.equals(parentGroup.uuid));
    assert(kdbxGroup instanceof KdbxGroup);
    let newItem = isGroup
      ? KeeFileManager.database.createGroup(kdbxGroup, groupName)
      : KeeFileManager.database.createEntry(kdbxGroup);
    KeeFileManager.allItems.push(newItem);
    const index = KeeFileManager.allItems.findIndex(i => i.uuid.equals(newItem.uuid));
    assert(index > -1);
    const newWrapper = new KdbxItemWrapper(newItem.uuid, index, {
      defaultGroupUuid: KeeFileManager.database.getDefaultGroup().uuid,
      recycleBinUuid: KeeFileManager.database.meta.recycleBinUuid
    });
    return newWrapper;
  }

  public static deleteItem(item: KdbxItemWrapper) {
    const rbGroup = this.allItems.find(g => g.uuid.equals(this.database.meta.recycleBinUuid));
    assert(rbGroup instanceof KdbxGroup);
    return this.moveItem(item, rbGroup);
  }

  public static moveItem(item: KdbxItemWrapper, parentGroup: KdbxItemWrapper | KdbxGroup) {
    const kdbxItem = this.allItems.find(i => i.uuid.equals(item.uuid));
    const kdbxGroup = this.allItems.find(g => g.uuid.equals(parentGroup.uuid));
    assert(kdbxItem);
    assert(kdbxGroup instanceof KdbxGroup);

    KeeFileManager.database.move(kdbxItem, kdbxGroup);
    return item.applyChanges(_ => {});
  }

  public static stepGroup(group: KdbxItemWrapper, direction: MoveDirection) {
    const kdbxGroup = KeeFileManager.allItems.find(g => g.uuid.equals(group.uuid))
    if (!kdbxGroup || !kdbxGroup.parentGroup || !(kdbxGroup instanceof KdbxGroup))
      return;

    let atIndex = kdbxGroup.parentGroup.groups.indexOf(kdbxGroup);
    atIndex = (direction === MoveDirection.Up) ? atIndex-1 : atIndex+1;
    if (atIndex < 0 || atIndex > kdbxGroup.parentGroup.groups.length)
      return;

    this.database.move(kdbxGroup, kdbxGroup.parentGroup, atIndex);
    kdbxGroup.times.update();
    return group.applyChanges(_ => {});
  }

  public static get allItems(): (KdbxEntry | KdbxGroup)[] {
    return this._allItems;
  }

  public static allItemsKdbxGroup: KdbxGroup = KeeFileManager._getAllItemsGroup()

  private static get _allItemsWrapperGroup(): KdbxItemWrapper {
    let group = new KdbxItemWrapper(
      KeeFileManager.allItemsGroupUuid, -1,
      {defaultGroupUuid: new KdbxUuid(), recycleBinUuid: undefined}
    );
    group.isAllItemsGroup = true;
    return group;
  }

  private static _allItemsStats = (entries: KdbxItemWrapper[]): GroupStatistics => {
    return {
      groupUuid: KeeFileManager.allItemsGroupUuid,
      lastChanged: new Date(Math.max(...entries.filter(e => !e.isGroup).map(e => e.lastModifiedTime.valueOf()))),
      totalEntries: entries.filter(e => !e.isGroup).length,
      closeExpired: new Date(0)
    }
  }


  private static _context: IKdbxContext | undefined
  private static _database: Kdbx | undefined
  private static _allItems: (KdbxEntry | KdbxGroup)[]
  private static _getAllItemsGroup()
  {
    let group = new KdbxGroup();
    group.uuid = KeeFileManager.allItemsGroupUuid;
    group.name = 'All Items';
    return group;
  }

}


