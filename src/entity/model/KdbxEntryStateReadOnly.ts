import { KdbxEntry, KdbxGroup } from "kdbxweb";
import { KdbxItemState } from "..";

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
