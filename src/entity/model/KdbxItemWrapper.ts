import assert from 'assert';
import { KdbxBinary, KdbxBinaryWithHash, KdbxEntry, KdbxEntryField, KdbxGroup, KdbxUuid, ProtectedValue } from "kdbxweb";
import { KeeFileManager } from "./KeeFileManager";

/**
 * Simplified and unified work with KdbxEntry & KdbxGroup
 */
export class KdbxItemWrapper {

  private _context: IKdbxContext
  private _uuid: KdbxUuid
  private _index: number

  protected get _entry(): KdbxEntry | KdbxGroup {
    if (this.uuid.equals(KeeFileManager.allItemsGroupUuid))
      return KeeFileManager.allItemsKdbxGroup;

    const entry = KeeFileManager.allItems[this._index]
    assert(entry);
    assert(entry.uuid.equals(this._uuid));
    return entry;
  }

  constructor (uuid: KdbxUuid, index: number, options: IKdbxContext) {
    this._uuid = uuid;
    this._index = index;
    this._context = options;
    this.isChanged = false;
    this.isSelected = false;
    this.isAllItemsGroup = false;
  }

  public static fromUuid(uuid: KdbxUuid) {
    let index = KeeFileManager.allItems.findIndex(i => i.uuid.equals(uuid));
    assert(index > -1);
    return new KdbxItemWrapper(uuid, index, KeeFileManager.context);
  }

  isSelected: boolean;
  isAllItemsGroup: boolean;
  isChanged: boolean;

  /** Readonly unique identifier of entity
   */
  get uuid(): KdbxUuid { return this._uuid };

  /** Readonly unique identifier of parent entity
   */
  get parentUuid(): KdbxUuid | undefined { return this._entry.parentGroup?.uuid };

  get parent(): KdbxItemWrapper | undefined {
    const index = KeeFileManager.allItems.findIndex(
      i => i.uuid.equals(this._entry.parentGroup?.uuid)
    )
    if (index === -1)
      return;
    return new KdbxItemWrapper(this._entry.parentGroup!.uuid, index, this._context);
  }

  get groupSortOrder(): number {
    return this._entry.parentGroup?.groups.findIndex(g => g.uuid.equals(this._uuid)) || 0;
  }

  /** Is this entity Group of entities
   */
  get isGroup(): boolean { return this._entry instanceof KdbxGroup };

  get isDefaultGroup(): boolean { return this.uuid.equals(this._context.defaultGroupUuid) }
  get isRecycleBin(): boolean { return this.uuid.equals(this._context.recycleBinUuid) }

  /** Traversing all parents up to top and check if this item is in Recycled
   */
  get isRecycled(): boolean {
    if (!this._context.recycleBinUuid)
      return false;
    let parent = this._entry.parentGroup;
    while(parent) {
      if (parent.uuid.equals(this._context.recycleBinUuid))
        return true;
      parent = parent.parentGroup;
    }
    return false;
  }

  /** Title of entitiy
   */
  get title(): string {
    return (this._entry instanceof KdbxGroup
      ? this._entry.name
      : this._entry.fields.get('Title')?.toString()) || ''
    };
  set title(value: string) {
    this._updateEntry(entry => {
      entry instanceof KdbxGroup
      ? entry.name = value
      : entry.fields.set('Title', value)
    })
  }

  /** defalult Icon
   */
  get defaultIconId(): number { return this._entry.icon || 0 }

  /** set default icon id, the custom icon value will be erased!
  */
  set defaultIconId(value: number) {
    this._updateEntry(entry => {
      entry.icon = value;
      entry.customIcon = undefined;
    })
  }

  /** returns true if this instance has setted expiration time
   */
  get isExpires(): boolean { return this._entry.times.expires || false }

  /** Get or Set the expiration time
   */
  get expiryTime(): Date | undefined { return this._entry.times.expiryTime }
  set expiryTime(value: Date | undefined) { this._updateEntry(entry => {
    entry.times.expires = !!value
    entry.times.expiryTime = value
  })}

  get lastModifiedTime(): Date { return new Date(this._entry.lastModTime) }

  get bgColor(): string {return this._entry instanceof KdbxEntry && this._entry.bgColor || ''}
  set bgColor(value: string) {
    if (this._entry instanceof KdbxEntry)
      this._updateEntry(entry => (entry as KdbxEntry).bgColor = value);
  }

  get customIconUuid(): KdbxUuid | undefined { return this._entry.customIcon }
  set customIconUuid(value: KdbxUuid | undefined) { this._updateEntry(entry => entry.customIcon = value) }

  get customIcon(): string | undefined {
    const buffer = KeeFileManager.getCustomIcon(this.customIconUuid || new KdbxUuid())?.data;
    return buffer
      ? 'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)))
      : '';
  }

  get tags(): string[] {return this._entry.tags}
  set tags(value: string[]) {this._updateEntry(entry => entry.tags = value)}

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

  setField(fieldName: string, value: KdbxEntryField) {
    this._updateEntry(entry => {
      if (entry instanceof KdbxEntry) {
        entry.fields.set(fieldName, value);
        return;
      }

      if (fieldName === 'Notes')
        entry.notes = value.toString();
    })
  }

  deleteField(fieldName: string) {
    this._updateEntry(entry => {
      if (entry instanceof KdbxEntry) {
        entry.fields.delete(fieldName);
      }
    })
  }

  removeHistory(index: number) {
    if (this._entry instanceof KdbxGroup)
      return;
    this._updateEntry(entry => (entry as KdbxEntry).removeHistory(index));
  }

  applyChanges(action: (item: KdbxItemWrapper) => void) {
    let item = new KdbxItemWrapper(this.uuid, this._index, this._context);
    item.isChanged = this.isChanged;
    item.isSelected = this.isSelected;
    item.isAllItemsGroup = this.isAllItemsGroup;
    action(item);
    return item;
  }

  private _updateEntry(update: (entry: KdbxEntry | KdbxGroup) => void) {
    console.log(this._entry);
    if (!this.isChanged) {
      if (this._entry instanceof KdbxEntry) {
        this._entry.pushHistory();
      }
      this._entry.times.update();
    }
    update(this._entry);
    this.isChanged = true;
  }
}

export interface IKdbxContext {
  defaultGroupUuid: KdbxUuid;
  recycleBinUuid: KdbxUuid | undefined;
}

export class KdbxEntryWrapperReadOnly extends KdbxItemWrapper {

  private entry: KdbxEntry;

  constructor(entry: KdbxEntry) {
    super(entry.uuid, -1, {defaultGroupUuid: new KdbxUuid(), recycleBinUuid: new KdbxUuid()})
    const cloned = new KdbxEntry();
    cloned.copyFrom(entry);
    this.entry = cloned;
  }

  protected get _entry(): KdbxEntry | KdbxGroup {
    return this.entry;
  }

}

