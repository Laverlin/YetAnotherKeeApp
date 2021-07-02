import fs from 'fs';
import { Kdbx, ProtectedValue, Credentials, KdbxEntry} from 'kdbxweb';
import path from 'path';

// Keeps the state of loaded data from the kdbx file
//
export default class KeeData {
  #path: string = '';
  #password: ProtectedValue = ProtectedValue.fromString('');
  #database: Kdbx | undefined = undefined;

  #groupListeners = [] as {(entries: KdbxEntry[]): void} [];
  #entryListeners = [] as {(entry: KdbxEntry): void} [];
  #searchFilterListeners = [] as {(query: string): void} [];
  #sortListeners = [] as {(sortField: string): void} [];
  #colorFilterListeners = [] as {(colorFilter: string): void} [];
  #tagFilterListeners = [] as {(selectedTags: string[]): void} [];

  // Set path to database file
  //
  set dbFullPath(path: string){
    this.#path = path;
  }

  // return database file name if path is set
  //
  get dbName(): string {
  //  if (!this.dbFullPath) {
  //    throw 'The full path to the database file should be set before usage'
  //  }
    return path.parse(this.#path).base;
  }

  // Set password for the db
  //
  set password(password: ProtectedValue){
    this.#password = password;
  }

  // Load data from kdbx file
  //
  async loadDb()
  {
    if (!this.#path) {
      throw 'Path is not initialized';
    }
    const data = await fs.promises.readFile(this.#path);
    const credentials = new Credentials(this.#password, null);
    this.#database = await Kdbx.load(new Uint8Array(data).buffer, credentials);
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
  get recycleBinUuid(){ return this.database.meta.recycleBinUuid }

  get tags(): string[] {
     let tags: string[] = [];
     for (const e of this.database.getDefaultGroup().allGroupsAndEntries()) {
       tags = tags.concat(e.tags);
     }
     return [...new Set(tags)];
  }

  // Add listener for event if group has changed
  //
  addGroupListener(listener : {(entries: KdbxEntry[]):void}) {
    this.#groupListeners.push(listener);
  }

  removeGroupListener(listener : {(entries: KdbxEntry[]): void}){
    this.#groupListeners = this.#groupListeners.filter(item => listener !== item);
  }

  // notify all subscribers that group has changed
  // provides the list of entries in the new group
  //
  notifyGroupSubscribers(entries: KdbxEntry[]) {
    if (entries) {
      this.#groupListeners.forEach(listener => listener(entries));
    }
  }

  // Add listener for event if entry has changed
  //
  addEntryListener(listener: {(entry: KdbxEntry): void}){
    this.#entryListeners.push(listener);
  }

  removeEntryListener(listener : {(entry: KdbxEntry): void}){
    this.#entryListeners = this.#entryListeners.filter(item => listener !== item);
  }

  // notify all subscribers that entry has changed
  // provides the new entry
  //
  notifyEntrySubscribers(entry: KdbxEntry) {
    if (entry) {
      this.#entryListeners.forEach(listener => listener(entry));
    }
  }

  addSearchFilterListener(listener: {(query: string): void}) {
    this.#searchFilterListeners.push(listener);
  }

  removeSearchFilterListener(listener: {(query: string): void}) {
    this.#searchFilterListeners = this.#searchFilterListeners.filter(item => listener !== item);
  }

  notifySearchFilterSubscribers(query:string) {
    this.#searchFilterListeners.forEach(listener => listener(query));
  }

  addSortListener(listener: {(sortField: string): void}) {
    this.#sortListeners.push(listener);
  }

  removeSortListener(listener: {(sortField: string): void}) {
    this.#sortListeners = this.#sortListeners.filter(item => listener !== item);
  }

  notifySortSubscribers(sortField: string) {
    this.#sortListeners.forEach(listener => listener(sortField));
  }

  addColorFilterListener(listener: {(colorFilter: string): void}) {
    this.#colorFilterListeners.push(listener);
  }
  removeColorFilterListener(listener: {(colorFilter: string): void}) {
    this.#colorFilterListeners.filter(item => listener != item);
  }
  notifyColorFilterSubscribers(colorFilter: string){
    this.#colorFilterListeners.forEach(listener => listener(colorFilter));
  }

  addTagFilterListener(listener: {(tags: string[]): void}) {
    this.#tagFilterListeners.push(listener);
  }
  removeTagFilterListener(listener: {(tsgs: string[]): void}) {
    this.#tagFilterListeners.filter(item => listener != item);
  }
  notifyTagFilterSubscribers(tags: string[]){
    this.#tagFilterListeners.forEach(listener => listener(tags));
  }



}
