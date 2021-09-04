import fs from 'fs';
import { Kdbx, ProtectedValue, Credentials, KdbxEntry, KdbxUuid, KdbxGroup} from 'kdbxweb';
import path from 'path';
import { EntryFilter } from './EntryFilter';
import { KdbxUuidFactory } from './Extention';
import { GroupSelectedEvent, KeeEvent, KeeEventDescriptor } from './KeeEvent';

export enum MoveDirection {
  Up,
  Down,
}

export class DBInfo {
  lastUpdated: number = 0;
  totalEntries: number = 0;
  recycledUuids: KdbxUuid[] = [];
}

/**
 * Keeps the state of loaded data from the kdbx file
 */
export default class KeeData {

  static allGroupUuid = KdbxUuidFactory.fromHexString('0000000000000000000000000000AAAA');
  static anyEntryUuid = KdbxUuidFactory.fromHexString('0000000000000000000000000000BBBB');

  #path: string = '';
  #database: Kdbx | undefined = undefined;
  #selectedGroupUuid = KeeData.allGroupUuid;
  #selectedEntryUuid = new KdbxUuid();
  #recycleBinGroup: KdbxGroup | undefined;
  #defaultGroup: KdbxGroup | undefined;
  #editedEntries: KdbxUuid[] = [];
  #eventListeners: Array<any> = [];
  #entryFilter: EntryFilter = new EntryFilter(this);
  #dbInfo: DBInfo = new DBInfo();


  // Load data from kdbx file
  //
  async loadDb(path: string, password: ProtectedValue) {
    this.#path = path;
    const data = await fs.promises.readFile(this.#path);
    const credentials = new Credentials(password, null);
    this.#database = await Kdbx.load(new Uint8Array(data).buffer, credentials);
    this.#editedEntries = [];
    this.#recycleBinGroup = this.#database.meta.recycleBinUuid &&
      this.#database.getGroup(this.#database.meta.recycleBinUuid);
    this.#defaultGroup = this.database.getDefaultGroup();
    this._updateDBInfo(true);
  }

  async saveDb() {
    if (!this.#database) {
      throw new Error('Nothing to save, db is needed');
    }
    if (!this.#path){
      throw new Error('Nowhere to save, path is needed');
    }

    let db = await this.#database.save();
    fs.writeFileSync(this.#path, Buffer.from(db));
    this.#editedEntries = [];
    this._updateDBInfo(true);
    this.fireEvent(KeeEvent.createDatabaseSavedEvent());
  }

  /** return db object
   */
  get database(): Kdbx {
    if (!this.#database) {
      throw 'The database needs to be loaded before access'
    }
    return this.#database
  }

  /** root group
   */
  get defaultGroup(): KdbxGroup {
    if (!this.#defaultGroup)
      throw 'Fatal: default group is not defined'
    return this.#defaultGroup;
  }

  /** returns custom icon image if this icon is available in DB
   */
  getCustomIcon(iconId: string): string {
    const buffer = this.database.meta.customIcons.get(iconId)?.data;
    return buffer
      ? 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)))
      : '';
  }

  /** return database file name if path is set
   */
  get dbName() { return path.parse(this.#path).base; }

  /** return ID of special folder for trash
   */
  get recycleBinUuid() {return this.database.meta.recycleBinUuid}

  /** return true if Recycle bin folder is present in th DB
   */
  get isRecycleBinAvailable() {
    return this.recycleBinUuid && this.#recycleBinGroup
  }

  /** return the Recycle Bin Group
   *  @throws if recycle bin is not present in DB.
   *  Use @see isRecycleBinAvailable to check RB availability
   */
  get recycleBinGroup(): KdbxGroup {
    if (!this.isRecycleBinAvailable)
      throw 'Recycle bin unavailable. Use isRecycleBinAvailable property to check';

    return this.#recycleBinGroup as KdbxGroup;
  }

  /** return the Uuid of the group that is currently selected
   */
  get selectedGroupUuid() {return this.#selectedGroupUuid}

  /** return the Uuid of the Entry that is currently selected
   */
  get selectedEntryUuid() {return this.#selectedEntryUuid}

  /** returs the link on the @see EntryFilter object
   */
  get entryFilter() {return this.#entryFilter;}

  /** returns all available tags in db
   */
  get tags(): string[] {
     let tags: string[] = [];
     for (const e of this.database.getDefaultGroup().allGroupsAndEntries()) {
       tags = tags.concat(e.tags);
     }
     return [...new Set(tags)];
  }

  /** returns database metadata
   */
  get dbInfo() {return this.#dbInfo;}

  /** returns all entries without recycled
   */
  get allEntries() {
    return Array.from(this.defaultGroup.allEntries())
      .filter(i => !this.dbInfo.recycledUuids.includes(i.uuid));
  }

  addEventListener<T extends KeeEvent>(
    keeEventType: new() => T,
    entryId: KdbxUuid,
    listener: (event: T) => void): void {
      const eventDescriptor = new KeeEventDescriptor<T>(keeEventType, entryId, listener);
      this.#eventListeners.push(eventDescriptor)
  }

  fireEvent<T extends KeeEvent>(event: T) {
    this.#eventListeners.filter(l => ((l as KeeEventDescriptor<T>).entryId.equals(event.entryId) ||
        (l as KeeEventDescriptor<T>).entryId.equals(KeeData.anyEntryUuid)) &&
        (l as KeeEventDescriptor<T>).typeName === event.constructor.name)
      .forEach(l => {
        l.listener(event);
      });
  }

  removeEventListener<T extends KeeEvent>(
    keeEventType: new() => T,
    entryId: KdbxUuid,
    listener: (event: T) => void) {
      this.#eventListeners = this.#eventListeners
        .filter(i => !i.entryId.equals(entryId) || i.typeName !== keeEventType.name || i.listener !== listener)
  }

  setSelectedEntry(entryUuid: KdbxUuid) {
    this.fireEvent<GroupSelectedEvent>(KeeEvent.createEntrySelectedEvent(this.#selectedEntryUuid, true));
    this.#selectedEntryUuid = entryUuid;
    this.fireEvent<GroupSelectedEvent>(KeeEvent.createEntrySelectedEvent(entryUuid));
  }

  setSelectedGroup(groupUuid: KdbxUuid) {
    this.#selectedGroupUuid = groupUuid;
    this.fireEvent<GroupSelectedEvent>(KeeEvent.createGroupSelectedEvent(groupUuid));
  }

  createGroup(parentGroupUuid: KdbxUuid) {
    const parentGroup = this.database.getGroup(parentGroupUuid);
    if (!parentGroup)
      return;
    const newGroup = this.database.createGroup(parentGroup, 'New Group');
    this.setSelectedGroup(newGroup.uuid);
    this.fireEvent(KeeEvent.createEntryChangedEvent(newGroup.uuid));
  }

  createEntry(parentGroupUuid: KdbxUuid) {
    const parentGroup = this.database.getGroup(parentGroupUuid);
    if (!parentGroup)
      return;
    const newEntry = this.database.createEntry(parentGroup);
    this._updateDBInfo();
    this.#editedEntries.push(newEntry.uuid); // to avoid emprty record in history
    this.setSelectedGroup(parentGroupUuid);
    this.setSelectedEntry(newEntry.uuid);
    this.fireEvent(KeeEvent.createEntryChangedEvent(newEntry.uuid));
  }

  /** Checking if moving available
   *  Moving is not allowed if target group is sibling of moving group
   *  and if moving grpup is default
   * @param targetGroup - group where to move
   * @param groupUuid - Uuid of the group which is about to move
   * @param defaultGroupUuid - Uuid of default group
   */
  isMovingAllowed(targetGroup: KdbxGroup, groupUuid: KdbxUuid, defaultGroupUuid: KdbxUuid): boolean {
    return targetGroup.uuid.equals(groupUuid)
      ? true
      : targetGroup.uuid.equals(defaultGroupUuid)
        ? false
        : this.isMovingAllowed(targetGroup.parentGroup!, groupUuid, defaultGroupUuid);
  }

  moveGroupStep(groupUuid: KdbxUuid, direction: MoveDirection) {
    const group = this.database.getGroup(groupUuid);
    if (!group || !group.parentGroup)
      return;

    let atIndex = group.parentGroup.groups.indexOf(group);
    atIndex = (direction === MoveDirection.Up) ? atIndex-1 : atIndex+1;
    if (atIndex < 0 || atIndex > group.parentGroup.groups.length)
      return;

    this.database.move(group, group.parentGroup, atIndex);
    group.times.update();
    this.fireEvent(KeeEvent.createGroupSelectedEvent(groupUuid));
    this.fireEvent(KeeEvent.createEntryChangedEvent(groupUuid));
  }

  moveEntryOrGroup(targetGroup: KdbxGroup, entryUuid: KdbxUuid) {
    const defaultGroup = this.database.getDefaultGroup();
    const entry = Array.from(defaultGroup.allGroupsAndEntries())
      .find(e => e.uuid.equals(entryUuid));
    if (!entry || this.isMovingAllowed(targetGroup, entryUuid, defaultGroup.uuid)) {
        return;
    }

    this.database.move(entry, targetGroup);
    entry.times.update();
    this._updateDBInfo();
    this.setSelectedGroup(this.#selectedGroupUuid);
    this.fireEvent(KeeEvent.createEntryChangedEvent(entryUuid));
  }

  deleteGroup(groupUuid: KdbxUuid) {
    const group = this.database.getGroup(groupUuid);
    if (!group)
      return;
    this.deleteEntryOrGroup(group);
  }

  deleteEntryOrGroup(entry: KdbxEntry | KdbxGroup) {
    if (!this.isRecycleBinAvailable)
      throw 'No Recycle Bin'
    if (entry.uuid === this.database.getDefaultGroup().uuid)
      throw 'Can not delete default group'

    this.database.move(entry, this.recycleBinGroup);
    entry.times.update();
    this._updateDBInfo();
    this.setSelectedGroup(this.#selectedGroupUuid);
    this.fireEvent(KeeEvent.createEntryChangedEvent(entry.uuid));
  }

  removeHistoryEntry(index: number) {

    const entry = Array.from(this.defaultGroup.allGroupsAndEntries())
      .find(e => e.uuid.equals(this.selectedEntryUuid)) as KdbxEntry;
    entry.removeHistory(index);

    this.fireEvent(KeeEvent.createEntryChangedEvent(entry.uuid));
  }

  // Update entity state: push history, set update time, notify
  // and apply changes form function
  //
  updateEntry(entry: KdbxEntry| KdbxGroup, changeState: {(entry: KdbxEntry | KdbxGroup): void}) {

    // need to push history of entry only once per save db
    // for this edited items are traked
    //
    if (!this.#editedEntries.find(i => i.equals(entry.uuid))) {
      this.#editedEntries.push(entry.uuid);
      if (entry instanceof KdbxEntry) {
        entry.pushHistory();
      }
      entry.times.update();
    }
    changeState(entry);
    this.fireEvent(KeeEvent.createEntryChangedEvent(entry.uuid));
  }

  private _updateDBInfo(isUpdateSaveTime: boolean = false) {
    if (isUpdateSaveTime)
      this.#dbInfo.lastUpdated = Math.max(
        ...Array.from(this.defaultGroup.allGroupsAndEntries()).map(e => e.times.lastModTime!.valueOf()));
    this.#dbInfo.recycledUuids = Array.from(this.recycleBinGroup.allGroupsAndEntries()).map(i => i.uuid);
    this.#dbInfo.totalEntries = this.allEntries.length;
  }

}
