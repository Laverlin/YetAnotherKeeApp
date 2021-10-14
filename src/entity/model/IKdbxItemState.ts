import { KdbxBinary, KdbxBinaryWithHash, KdbxEntry, KdbxEntryField, KdbxUuid } from "kdbxweb";

/**
 * Interface to simplify and unify work with KdbxEntry & KdbxGroup
 */
export interface IKdbxItemState {

  /** is there any changes since last save
   */
  readonly isChanged: boolean;

  /**
   * is this item selected
   */
  readonly isSelected: boolean;

  /** Readonly unique identifier of entity
   */
  readonly uuid: KdbxUuid;

  /** Readonly unique identifier of parent entity
   */
  readonly parentUuid: KdbxUuid | undefined;

  /** Sorting index for groups
   */
  readonly groupSortOrder: number;

  /** Is this entity Group of entities
   */
  readonly isGroup: boolean;

  /** Is this entry a default group
   */
  readonly isDefaultGroup: boolean;

  /** Is this entry a recycle bin
   */
  readonly isRecycleBin: boolean;

  /** is this item an artifitial AllItemsGroup
   */
  readonly isAllItemsGroup: boolean;

  /** Traversing all parents up to top and check if this item is in Recycled
   */
  readonly isRecycled: boolean;

  /** return Title/name of entitiy
   */
  readonly title: string;

  /** defalult Icon
   */
  readonly defaultIconId: number;

  /** returns true if this instance has setted expiration time
   */
  readonly isExpires: boolean;

  /** Get or Set the expiration time
   */
  readonly expiryTime: Date | undefined;

  readonly lastModifiedTime: Date;

  readonly bgColor: string;

  readonly customIconUuid: KdbxUuid | undefined;

  readonly customIcon: string | undefined;

  readonly tags: string[];

  readonly binaries: Map<string, KdbxBinary | KdbxBinaryWithHash>;

  readonly creationTime: Date;

  readonly lastAccessTime: Date;

  readonly usageCount: number;

  readonly history: KdbxEntry[];

  readonly fields: Map<string, KdbxEntryField>;

  readonly hasPassword: boolean;
}


