import assert from "assert";
import { KdbxBinary, KdbxBinaryWithHash, KdbxEntry, KdbxEntryField, KdbxGroup, KdbxUuid, ProtectedValue } from "kdbxweb";
import { currentContext, ITreeStateChange } from './GlobalContext';

/**
 * Simplified and unified work with KdbxEntry & KdbxGroup
 */
export class KdbxItemState {

  #uuid: KdbxUuid
  #isSelected: boolean;
  #isChanged: boolean;

  constructor(uuid: KdbxUuid) {
    this.#uuid = uuid;
    this.#isChanged = false;
    this.#isSelected = false;
  }

  get isChanged(): boolean { return this.#isChanged }
  resetChanged(): KdbxItemState {
    let newState = this.clone();
    newState.#isChanged = false;
    return newState;
  }

  get isSelected(): boolean { return this.#isSelected }
  setSelected(isSelected: boolean): KdbxItemState {
    let newState = this.clone();
    newState.#isSelected = isSelected;
    return newState;
  }

  /** Readonly unique identifier of entity
   */
  get uuid(): KdbxUuid { return this.#uuid };


  /** Readonly unique identifier of parent entity
   */
  get parentUuid(): KdbxUuid | undefined { return this._entry.parentGroup?.uuid };

  /** Sorting index for groups
   */
  get groupSortOrder(): number {
    return this._entry.parentGroup?.groups.findIndex(g => g.uuid.equals(this.#uuid)) || 0;
  }

  /** Is this entity Group of entities
   */
  get isGroup(): boolean { return this._entry instanceof KdbxGroup };

  get isDefaultGroup(): boolean { return this.uuid.equals(currentContext.defaultGroupUuid) }
  get isRecycleBin(): boolean { return this.uuid.equals(currentContext.recycleBinUuid) }
  get isAllItemsGroup(): boolean { return this.uuid.equals(currentContext.allItemsGroupUuid) }

  /** Traversing all parents up to top and check if this item is in Recycled
   */
  get isRecycled(): boolean {
    if (!currentContext.recycleBinUuid)
      return false;
    let parent = this._entry.parentGroup;
    while(parent) {
      if (parent.uuid.equals(currentContext.recycleBinUuid))
        return true;
      parent = parent.parentGroup;
    }
    return false;
  }

  /** return Title/name of entitiy
   */
  get title(): string {
    return (this._entry instanceof KdbxGroup
      ? this._entry.name
      : this._entry.fields.get('Title')?.toString()) || ''
    };

  /**
   * set title/name of entity
   * @param title - entity title/name
   * @returns changed copy of entity
   */
  setTitle(title: string): KdbxItemState {
    return this._applyChanges(item => {
      item instanceof KdbxGroup
      ? item.name = title
      : item.fields.set('Title', title);
    })
  }

  /** defalult Icon
   */
  get defaultIconId(): number { return this._entry.icon || 0 }

  /** set default icon id, the custom icon value will be erased!
  */
  setDefaultIconId(value: number): KdbxItemState {
    return this._applyChanges(item => {
      item.icon = value;
      item.customIcon = undefined;
    })
  }

  /** returns true if this instance has setted expiration time
   */
  get isExpires(): boolean { return this._entry.times.expires || false }

  /** Get or Set the expiration time
   */
  get expiryTime(): Date | undefined { return this._entry.times.expiryTime }

  setExpiryTime(value: Date | undefined): KdbxItemState {
      return this._applyChanges(item =>{
        item.times.expires = !!value
        item.times.expiryTime = value
    })
  }

  get lastModifiedTime(): Date { return new Date(this._entry.lastModTime) }

  get bgColor(): string {return this._entry instanceof KdbxEntry && this._entry.bgColor || ''}

  setBgColor(value: string): KdbxItemState {
    if (this.isGroup)
      return this;
    return this._applyChanges(entry => (entry as KdbxEntry).bgColor = value);
  }

  get customIconUuid(): KdbxUuid | undefined { return this._entry.customIcon }

  setCustomIconUuid(value: KdbxUuid | undefined): KdbxItemState {
    return this._applyChanges(item => item.customIcon = value)
  }

  get customIcon(): string | undefined {
    const buffer = currentContext.getCustomIcon(this.customIconUuid || new KdbxUuid())?.data;
    return buffer
      ? 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)))
      : '';
  }

  get tags(): string[] {return this._entry.tags}
  setTags(value: string[]): KdbxItemState {
    return this._applyChanges(item => item.tags = value)
  }

  get binaries(): Map<string, KdbxBinary | KdbxBinaryWithHash> {
    if (this._entry instanceof KdbxEntry)
      return this._entry.binaries
    return new Map<string, KdbxBinary | KdbxBinaryWithHash>();
  }

  get creationTime(): Date { return this._entry.times.creationTime || new Date(this._entry.lastModTime) }
  get lastAccessTime(): Date { return this._entry.times.lastAccessTime || new Date(this._entry.lastModTime) }
  get usageCount(): number { return this._entry.times.usageCount || 0 }

  get history(): KdbxEntry[] {
    return (this._entry instanceof KdbxGroup)
    ? []
    : this._entry.history
  }

  get fields(): Map<string, KdbxEntryField> {
    return (this._entry instanceof KdbxEntry)
      ? this._entry.fields
      : new Map<string, KdbxEntryField>([['Notes', this._entry.notes as string]]);
  }

  getField(fieldName: string): KdbxEntryField {
    if (this._entry instanceof KdbxEntry)
      return this._entry.fields.get(fieldName) || ''

    return fieldName === 'Notes' && this._entry.notes || '';
  }

  get hasPassword(): boolean {
    return !!this.getField('Password').toString()
  }

  getFieldUnprotected(fieldName: string): string {
    const field = this.getField(fieldName);
    return field instanceof ProtectedValue
      ? field.getText()
      : field.toString();
  }

  setField(fieldName: string, value: KdbxEntryField): KdbxItemState {
    return this._applyChanges(entry => {
      if (entry instanceof KdbxEntry) {
        entry.fields.set(fieldName, value);
      }
      else {
        if (fieldName === 'Notes')
          entry.notes = value.toString();
      }
    })
  }

  deleteField(fieldName: string): KdbxItemState {
    return this._applyChanges(entry => {
      if (entry instanceof KdbxEntry) {
        entry.fields.delete(fieldName);
      }
    });
  }

  removeHistoryEntry(index: number): KdbxItemState {
    if (this.isGroup)
      return this;
    return this._applyChanges(entry => (entry as KdbxEntry).removeHistory(index));
  }

  addAttachment(name: string, binary: KdbxBinary): KdbxItemState {
    if (this.isGroup)
      return this;
    return this._applyChanges(entry => (entry as KdbxEntry).binaries.set(name, binary))
  }

  deleteAttachment(name: string) {
    if (this.isGroup)
      return this;
    return this._applyChanges(entry => (entry as KdbxEntry).binaries.delete(name));
  }


  clone() {
    let item = new KdbxItemState(this.uuid);
    item.#isChanged = this.#isChanged;
    item.#isSelected = this.#isSelected;

    return item;
  }

  moveItem(parentGroupUuid: KdbxUuid): ITreeStateChange {
    const kdbxGroup = currentContext.getKdbxItem(parentGroupUuid);
    assert(kdbxGroup instanceof KdbxGroup);

    const kdbxItem = this._applyChanges(item => {
      currentContext.database.move(item, kdbxGroup)
    })

    return {
      item: kdbxItem,
      treeChanges: {itemUuid: kdbxItem.uuid, parentUuid: parentGroupUuid}
    }
  }

  deleteItem(): ITreeStateChange {
    assert(currentContext.recycleBinUuid)
    return this.moveItem(currentContext.recycleBinUuid);
  }

  /**
   * shift the group one step up or down in sort order
   * @param isUp - direction
   * @returns updated group
   */
  shiftGroup(isUp: boolean): ITreeStateChange | undefined {
    if (!this._entry.parentGroup ||
      !this.isGroup ||
      this.isDefaultGroup ||
      this.isAllItemsGroup ||
      this.isRecycleBin
    )
      return undefined;

    let atIndex = this._entry.parentGroup.groups.indexOf(this._entry as KdbxGroup);
    atIndex = (isUp) ? atIndex - 1 : atIndex + 1;
    if (atIndex < 0 || atIndex > this._entry.parentGroup.groups.length)
      return undefined;

    let kdbxItem = this._applyChanges(item => {
      currentContext.database.move(item, item.parentGroup, atIndex);
    })
    return {
      item: kdbxItem,
      treeChanges: {itemUuid: kdbxItem.uuid, parentUuid: kdbxItem.parentUuid}
    }
  }

  protected get _entry(): KdbxEntry | KdbxGroup {
    return currentContext.getKdbxItem(this.#uuid);
  }

  private _applyChanges(action: (item: KdbxEntry | KdbxGroup) => void) {
    let item = this.clone();
    if (!item.isChanged) {
      if (item._entry instanceof KdbxEntry) {
        item._entry.pushHistory();
      }
      item._entry.times.update();
    }
    action(item._entry);
    item.#isChanged = true;
    return item;
  }

}

/**
 * Used to walk through Entry history
 */
export class KdbxEntryStateReadOnly extends KdbxItemState {

  private entry: KdbxEntry;

  constructor(entry: KdbxEntry) {
    super(entry.uuid)
    const cloned = new KdbxEntry();
    cloned.copyFrom(entry);
    this.entry = cloned;
  }

  protected get _entry(): KdbxEntry | KdbxGroup {
    return this.entry;
  }
}

/**
 * artifitial wrapper to represent All Entries item in group list
 */
export class AllItemsGroupState extends KdbxItemState {

  private entry: KdbxGroup;
  #isSelected: boolean = false;

  constructor(isSelected?: boolean) {
    super(currentContext.allItemsGroupUuid)
    const allItemsGroup = new KdbxGroup();
    allItemsGroup.uuid = currentContext.allItemsGroupUuid;
    allItemsGroup.name = 'All Entries';
    this.entry = allItemsGroup;
    this.#isSelected = isSelected || false;
  }

  protected get _entry(): KdbxEntry | KdbxGroup {
    return this.entry;
  }

  clone(): AllItemsGroupState {
    let item = new AllItemsGroupState();
    item.#isSelected = this.#isSelected;
    return item;
  }

  get isSelected(): boolean { return this.#isSelected }

  setSelected(isSelected: boolean): AllItemsGroupState {
    const item = this.clone();
    item.#isSelected = isSelected;
    return item;
  }
}
