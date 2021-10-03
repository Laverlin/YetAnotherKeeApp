import { compareAsc } from "date-fns";
import { KdbxGroup, KdbxUuid } from "kdbxweb";

export class GroupStatistics {
  groupUuid: KdbxUuid = new KdbxUuid();
  totalEntries: number = 0;
  closeExpired: Date = new Date(0);
  lastChanged: Date = new Date(0);

  static fromKdbxEntry(entry: KdbxGroup): GroupStatistics {
    return {
      groupUuid: entry.uuid,
      totalEntries: entry.entries.length,
      closeExpired: entry.entries.filter(e => e.times.expires)
        .map(e => e.times.expiryTime || new Date(0))
        .sort(compareAsc)[0],
      lastChanged: new Date(Math.max(...entry.entries.map(e => e.times.lastModTime?.valueOf() || 0)))
    }
  }
}
