import { KdbxEntry, KdbxGroup, KdbxUuid } from "kdbxweb";

export class _YakEntry {
  uuid: KdbxUuid = KdbxUuid.random();
  parentUuid: KdbxUuid | undefined;
  title: string = '';
  fields = {
    notes: ''
  };
  isSelected: boolean = false;
  defaultIconId: number = 0;
  isAllItemsGroup: boolean = false;
  isDefaultGroup: boolean = false;
  isRecycleBin: boolean = false;
  isGroup: boolean = false;
  isExpires: boolean = false;
  expiryTime: Date = new Date(0);
  lastModificationTime: Date = new Date(0);

  static fromKdbxEntry(entry: KdbxEntry | KdbxGroup, options: IEntryConvertOptions): _YakEntry {
    return {
      uuid: entry.uuid,
      parentUuid: entry.parentGroup?.uuid,
      title: (entry instanceof KdbxGroup ? entry.name : entry.fields.get("Title")?.toString()) || '',
      defaultIconId: entry.icon || 0,
      isSelected: false,
      isDefaultGroup: entry.uuid.equals(options.defaultGroupUuid),
      isRecycleBin: entry.uuid.equals(options.recycleBinUuid),
      isAllItemsGroup: false,
      fields: {notes: (entry instanceof KdbxGroup ? entry.notes : entry.fields.get("Notes")?.toString()) || ''},
      isGroup: entry instanceof KdbxGroup,
      isExpires: entry.times.expires || false,
      expiryTime: entry.times.expiryTime || new Date(0),
      lastModificationTime: new Date(entry.lastModTime),
    }
  }
}

interface IEntryConvertOptions {
  defaultGroupUuid: KdbxUuid;
  recycleBinUuid: KdbxUuid | undefined;
}
