import assert from "assert";
import { KdbxBinary, KdbxBinaryWithHash, KdbxEntry, KdbxEntryField, KdbxGroup, KdbxUuid, ProtectedValue } from "kdbxweb";
import { currentContext, GlobalContext } from './GlobalContext';
import { IKdbxItemState } from "./IKdbxItemState";

/**
 * Simplified and unified work with KdbxEntry & KdbxGroup
 */
export class KdbxItemState implements IKdbxItemState {

  private _isSelected: boolean;
  private _isChanged: boolean;

  constructor(uuid: KdbxUuid) {
    this.uuid = uuid;
    this._isChanged = false;
    this._isSelected = false;
  }

  /**
   * is there any changes since last save
   */
  get isChanged(): boolean { return this._isChanged }

  /**
   * set is changed state
   */
  setChanged(isChanged: boolean): KdbxItemState {
    let newState = this.clone();
    newState._isChanged = isChanged;
    return newState;
  }

  /**
   * is this item selected
   */
  get isSelected(): boolean { return this._isSelected }

  /**
   * sets the selected state
   */
  setSelected(isSelected: boolean): KdbxItemState {
    let newState = this.clone();
    newState._isSelected = isSelected;
    return newState;
  }

  /** Readonly unique identifier of entity
   */
  readonly uuid: KdbxUuid;


  /** Readonly unique identifier of parent entity
   */
  get parentUuid(): KdbxUuid | undefined { return this._entry.parentGroup?.uuid };

  /** Sorting index for groups
   */
  get groupSortOrder(): number {
    return this._entry.parentGroup?.groups.findIndex(g => g.uuid.equals(this.uuid)) || 0;
  }

  /** Is this entity Group of entities
   */
  get isGroup(): boolean { return this._entry instanceof KdbxGroup };

  /** Is this entry a default group
   */
  get isDefaultGroup(): boolean { return this.uuid.equals(currentContext().defaultGroupUuid) }

  /** Is this entry a recycle bin
   */
  get isRecycleBin(): boolean { return this.uuid.equals(currentContext().recycleBinUuid) }

  /** is this item an artifitial AllItemsGroup
   */
  get isAllItemsGroup(): boolean { return this.uuid.equals(GlobalContext.allItemsGroupUuid) }

  /** Traversing all parents up to top and check if this item is in Recycled
   */
  get isRecycled(): boolean {
    if (!currentContext().isRecycleBinAvailable)
      return false;
    let parent = this._entry.parentGroup;
    while(parent) {
      if (parent.uuid.equals(currentContext().recycleBinUuid))
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

  /**
   * removes custom icon and put back the default one \
   * do not creates history entry!
   */
  dropCustomIcon(): KdbxItemState {
    let newState = this.setChanged(true);
    newState._entry.customIcon = undefined;
    return newState;
  }

  /** returns true if this instance has setted expiration time
   */
  get isExpires(): boolean { return this._entry.times.expires || false }

  /** Get or Set the expiration time
   */
  get expiryTime(): Date | undefined { return this._entry.times.expiryTime }

  /** sets the expiration time, remove if undefined
   */
  setExpiryTime(value: Date | undefined): KdbxItemState {
      return this._applyChanges(item =>{
        item.times.expires = !!value
        item.times.expiryTime = value
    })
  }

  get isExpiredNow():boolean { return this.isExpires && (this.expiryTime?.valueOf() || 0) < Date.now() }


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
    const buffer = currentContext().getCustomIcon(this.customIconUuid || new KdbxUuid())?.data;
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
    item._isChanged = this._isChanged;
    item._isSelected = this._isSelected;

    return item;
  }

  isMovingAllowed(parentGroupUuid: KdbxUuid) {
    let uuid = parentGroupUuid as KdbxUuid | undefined;
    while (uuid) {
      if (uuid.equals(this.uuid))
        return false
      uuid = currentContext().getKdbxItem(uuid).parentGroup?.uuid
    }
    return true;
  }

  moveItem(parentGroupUuid: KdbxUuid): KdbxUuid | undefined {
    if (!this.isMovingAllowed(parentGroupUuid))
      return undefined

    const kdbxGroup = currentContext().getKdbxItem(parentGroupUuid);
    assert(kdbxGroup instanceof KdbxGroup);

    const kdbxItem = this._applyChanges(item => {
      currentContext().moveItem(item, kdbxGroup)
    })

    return kdbxItem.uuid
  }

  deleteItem(): KdbxUuid | undefined {
    assert(currentContext().isRecycleBinAvailable)
    return this.moveItem(currentContext().recycleBinUuid!);
  }

  /**
   * shift the group one step up or down in sort order
   * @param isUp - direction
   * @returns updated group
   */
  shiftGroup(isUp: boolean): KdbxUuid | undefined {
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
      assert(item.parentGroup);
      currentContext().moveItem(item, item.parentGroup, atIndex);
    })
    return kdbxItem.uuid
  }

  protected get _entry(): KdbxEntry | KdbxGroup {
    return currentContext().getKdbxItem(this.uuid);
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
    item._isChanged = true;
    return item;
  }

}


