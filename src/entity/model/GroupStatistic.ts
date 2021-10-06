export class GroupStatistic {
  totalEntries: number = 0;
  closeExpired: Date | undefined;
  lastChanged: Date | undefined;

  toDate = (value: number) => {
    return value > 0 ? new Date(value): undefined
  }
}
