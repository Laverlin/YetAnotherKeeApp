import { KdbxItemState } from "../KdbxItemState";

/**
 * Array of all sort menu items
 */
 export const sortMenuItems = [
  { displayName: 'Sort by Title',
    compare: (a: KdbxItemState, b: KdbxItemState) =>
      a.getFieldUnprotected('Title').localeCompare(b.getFieldUnprotected('Title')),
    id: 0
  },
  { displayName: 'Sort by User Name',
    compare: (a: KdbxItemState, b: KdbxItemState) =>
      a.getFieldUnprotected('UserName').localeCompare(b.getFieldUnprotected('UserName')),
    id: 1
  },
  { displayName: 'Sort by URL',
    compare: (a: KdbxItemState, b: KdbxItemState) =>
      a.getFieldUnprotected('URL').localeCompare(b.getFieldUnprotected('URL')),
    id: 2
  },
  { displayName: 'Sort by Creation Time',
    compare: (a: KdbxItemState, b: KdbxItemState) =>
      a.creationTime.valueOf() - b.creationTime.valueOf(),
    id: 3
  }
]
