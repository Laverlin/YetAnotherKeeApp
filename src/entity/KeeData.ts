import fs from 'fs';
import { Kdbx, ProtectedValue, Credentials, KdbxEntry, KdbxUuid, KdbxGroup} from 'kdbxweb';
import path from 'path';
import { EntryFilter } from './EntryFilter';
import { GroupSelectedEvent, KeeEvent, KeeEventDescriptor } from './KeeEvent';


// Keeps the state of loaded data from the kdbx file
//
export default class KeeData {

  static allGroupId = KdbxUuid.random().id;
  static allGroupUuid = new KdbxUuid(KeeData.allGroupId);
  static anyEntryId = KdbxUuid.random().id;
  static anyEntryUuid = new KdbxUuid(KeeData.anyEntryId);

  #path: string = '';
  #password: ProtectedValue = ProtectedValue.fromString('');
  #database: Kdbx | undefined = undefined;
  #selectedGroupUuid = KeeData.allGroupUuid;
  #selectedEntryUuid = new KdbxUuid();
  #editedEntries: KdbxUuid[] = [];
  #eventListeners: Array<any> = [];

  // Set path to database file
  //
  set dbFullPath(path: string) {
    this.#path = path;
  }

  // return database file name if path is set
  //
  get dbName(): string {
    return path.parse(this.#path).base;
  }

  // Set password for the db
  //
  set password(password: ProtectedValue){
    this.#password = password;
  }

  // Load data from kdbx file
  //
  async loadDb() {
    if (!this.#path) {
      throw 'Path is not initialized';
    }
    const data = await fs.promises.readFile(this.#path);
    const credentials = new Credentials(this.#password, null);
    this.#database = await Kdbx.load(new Uint8Array(data).buffer, credentials);
    this.#editedEntries = [];
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
  }

  // Return data from loaded file
  //
  get database(): Kdbx {
    if (!this.#database) {
      throw 'The database needs to be loaded before access'
    }
    return this.#database
  }

  // clear database
  //
  clearDb(){
    this.#database = undefined;
    this.#path = '';
  }

  getCustomIcon(iconId: string): string {
    const buffer = this.database.meta.customIcons.get(iconId)?.data;
    if (buffer) {
      return 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }
    return '';
  }


  // return ID of special folder for trash
  //
  get recycleBinUuid() {return this.database.meta.recycleBinUuid}
  get isRecycleBinAvailable() {return !!this.recycleBinUuid}
  get recycleBinGroup(): KdbxGroup {
    if (!this.recycleBinUuid)
      throw 'Recycle bin unavailable. Use isRecycleBinAvailable property to check';
    const bin = this.database.getGroup(this.recycleBinUuid);
    if (!bin)
      throw 'Fatal: could not find recycle bin';
    return bin;
  }

  get selectedGroupUuid() {return this.#selectedGroupUuid}
  get selectedEntryUuid() {return this.#selectedEntryUuid}

  get tags(): string[] {
     let tags: string[] = [];
     for (const e of this.database.getDefaultGroup().allGroupsAndEntries()) {
       tags = tags.concat(e.tags);
     }
     return [...new Set(tags)];
  }

  #entryFilter:EntryFilter = new EntryFilter(this);
  get entryFilter() {
    return this.#entryFilter;
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
    this.#editedEntries.push(newEntry.uuid); // to avoid emprty record in history
    this.setSelectedGroup(parentGroupUuid);
    this.setSelectedEntry(newEntry.uuid);
    this.fireEvent(KeeEvent.createEntryChangedEvent(newEntry.uuid));
  }

  moveEntryOrGroup(targetGroup: KdbxGroup, entryUuid: KdbxUuid) {
    const defaultGroup = this.database.getDefaultGroup();
    const entry = Array.from(defaultGroup.allGroupsAndEntries())
      .find(e => e.uuid.equals(entryUuid));
    if (!entry || targetGroup.uuid.equals(entryUuid) || entryUuid.equals(defaultGroup.uuid))
      return;
    const selectedGroup = entry.parentGroup as KdbxGroup;
    this.database.move(entry, targetGroup);
    this.setSelectedGroup(selectedGroup.uuid);
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

    const parentGroupId = entry.parentGroup!.uuid;
    this.database.move(entry, this.recycleBinGroup);
    this.setSelectedGroup(parentGroupId);
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


}
