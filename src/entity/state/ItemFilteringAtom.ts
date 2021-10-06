import { KdbxUuid } from 'kdbxweb';
import {atom, selector} from 'recoil'
import {itemStateAtom, KdbxItemState, treeStateAtom} from '..'
import { currentContext } from '../model/GlobalContext';
import { AllItemsGroupState } from '../model/KdbxItemState';
import { selectGroupAtom } from './ItemStateAtom';

export const entriesSelector = selector<KdbxItemState[]>({
  key: 'entriesSelector',
  get: ({get}) => {

    console.error('recalc')

    const groupUuid = get(selectGroupAtom)
    if (!groupUuid)
      return [];

    const selectedGroup = groupUuid.equals(currentContext.allItemsGroupUuid)
      ? new AllItemsGroupState()
      : get(itemStateAtom(groupUuid.id))//new KdbxItemState(groupUuid)

    const filter = (item: KdbxItemState) => {
      return ((!item.isGroup || selectedGroup.isRecycleBin) &&
        (item.parentUuid?.equals(selectedGroup.uuid) ||
          (selectedGroup.isAllItemsGroup && !item.isRecycled) ||
          (selectedGroup.isRecycleBin && item.isRecycled )
        )
      )
    }

    return get(treeStateAtom)
      .map(i => get(itemStateAtom(i.itemUuid.id)))
      .filter(filter)
  }
})

export const tagSelector = selector<string[]>({
  key: 'tagSelector',
  get: ({get}) => {
    let tags: string[] = [];
    tags = get(treeStateAtom).map(i => tags.concat(get(itemStateAtom(i.itemUuid.id)).tags)).flat();
    return [...new Set(tags)].sort();
  }
})

export const tagFilterAtom = atom<string[]>({
  key: 'group/tagFilterAtom',
  default: []
})

export const colorFilterAtom = atom<{color:string}>({
  key: 'group/colorFilterAtom',
  default: {color: ''}
})

export const searchFilterAtom = atom<string>({
  key: 'top/searchFilter',
  default: ''
})

export interface ISortMenuItem {
  id: number;
  displayName: string;
  compare: (a: KdbxItemState, b: KdbxItemState) => number;
}

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

export const sortEntriesAtom = atom<ISortMenuItem>({
  key: 'top/sortMenu',
  default: sortMenuItems[0]
})

export const filteredEntriesSelector = selector<KdbxUuid[]>({
  key: 'filteredEntriesSelector',
  get: ({get}) => {
    console.error('re sort')
    const colorFilter = get(colorFilterAtom);
    const tagFilter = get(tagFilterAtom);
    const searchFilter = get(searchFilterAtom);
    const sortField = get(sortEntriesAtom);
    let filtered = get(entriesSelector);
    if (colorFilter.color)
      filtered = filtered.filter(e => e.bgColor === colorFilter.color);
    if (tagFilter.length > 0)
      filtered = filtered.filter(e => e.tags.filter(t => tagFilter.includes(t)).length > 0)
    if (searchFilter)
      filtered = filtered.filter(e =>
        Array.from(e.fields.values()).filter(f => f.includes(searchFilter)).length > 0
      )
    filtered = filtered.slice().sort(sortField.compare)
    return filtered.map(i => i.uuid);
  }
})
