import { atom, atomFamily, selector, DefaultValue } from 'recoil'
import { GroupStatistics } from '../model/GroupStatistics'
import { KdbxItemWrapper } from '../model/KdbxItemWrapper'
import { KeeFileManager } from '../model/KeeFileManager'

export const keeStateAtom = atom({
  key: 'keeState',
  default: [] as KdbxItemWrapper[]
})

export const groupStatiscicAtom = atomFamily<GroupStatistics, string>({
  key: 'groupStatiscicAtom',
  default: _ => new GroupStatistics()
})


export const keeStateSelector = selector<KdbxItemWrapper[]>({
  key: 'keeStateSelector',
  get: ({get}) => {return get(keeStateAtom)},
  set: ({set}, updatePayload) => {
    set(keeStateAtom, state => {
      if (updatePayload instanceof DefaultValue)
        throw new Error('wrong payload')

      const entry = updatePayload[0];
      const index = state.findIndex(i => i.uuid.equals(entry.uuid));
      if (index === -1)
        return state.concat([entry]);

      const newState = [...state];
      newState.splice(index, 1, entry);
      return newState;
    })
  }
})

export const selectedGroupSelector = selector<KdbxItemWrapper | undefined>({
  key: 'selectedGroupSelector',
  get: ({get}) => { return get(keeStateAtom).find(i => i.isGroup && i.isSelected)},
  set: ({set}, newSelected) => {
    set(keeStateAtom, state => {
      const oldSelected = state.filter(e => e.isSelected);
      let entries = state;
      oldSelected.forEach(item => {
        entries = updateItem(entries, item.applyChanges(item => item.isSelected = false));
      })
      if (newSelected && !(newSelected instanceof DefaultValue))
        entries = updateItem(entries, newSelected.applyChanges(item => item.isSelected = true));
      return entries;
    })
  }
})

export const selectedEntrySelector = selector<KdbxItemWrapper | undefined>({
  key: 'selectedEntrySelector',
  get: ({get}) => { return get(keeStateAtom).find(i => !i.isGroup && i.isSelected)},
  set: ({set}, newSelected) => {
    set(keeStateAtom, state => {
      const oldSelected = state.find(e => !e.isGroup && e.isSelected);
      let entries = state;
      if (oldSelected)
        entries = updateItem(entries, oldSelected.applyChanges(item => item.isSelected = false));
      if (newSelected && !(newSelected instanceof DefaultValue))
        entries = updateItem(entries, newSelected.applyChanges(item => item.isSelected = true));
      return entries;
    })
  }
})

export const editSelectedItem = selector<KdbxItemWrapper | undefined>({
  key: 'editSelectedItem',
  get: ({get}) => {
    const selectedItem =
      get(keeStateAtom).find(i => !i.isGroup && i.isSelected) ||
      get(keeStateAtom).find(i => i.isGroup && i.isSelected);
    return KeeFileManager.allItemsGroupUuid.equals(selectedItem?.uuid)
      ? undefined
      : selectedItem;
  },
  set: ({set}, updatedItem) => {
    set(keeStateAtom, state => {
      if (updatedItem && !(updatedItem instanceof DefaultValue))
        return updateItem(state, updatedItem);
      return state;
    })
  }
})


export const entriesSelector = selector<KdbxItemWrapper[]>({
  key: 'entriesSelector',
  get: ({get}) => {
    const selectedGroup = get(selectedGroupSelector);
    if (!selectedGroup)
      return [];

    return get(keeStateAtom)
      .filter(i => (!i.isGroup || selectedGroup.isRecycleBin ) &&
        (i.parentUuid?.equals(selectedGroup.uuid) || (selectedGroup.isAllItemsGroup && !i.isRecycled)
        )
      )
  }
})

export const tagSelector = selector<string[]>({
  key: 'tagSelector',
  get: ({get}) => {
    let tags: string[] = [];
    tags = get(keeStateAtom).map(i => tags.concat(i.tags)).flat();
    return [...new Set(tags)].sort();
  }
})

export const tagFilterAtom = atom<string[]>({
  key: 'group/tagFilterAtom',
  default: []
})

export const colorFilterAtom = atom<string>({
  key: 'group/colorFilterAtom',
  default: ''
})

export const searchFilterAtom = atom<string>({
  key: 'top/searchFilter',
  default: ''
})

export interface ISortMenuItem {
  id: number;
  displayName: string;
  compare: (a: KdbxItemWrapper, b: KdbxItemWrapper) => number;
}

export const sortMenuItems = [
  { displayName: 'Sort by Title',
    compare: (a: KdbxItemWrapper, b: KdbxItemWrapper) =>
      a.getFieldUnprotected('Title').localeCompare(b.getFieldUnprotected('Title')),
    id: 0
  },
  { displayName: 'Sort by User Name',
    compare: (a: KdbxItemWrapper, b: KdbxItemWrapper) =>
      a.getFieldUnprotected('UserName').localeCompare(b.getFieldUnprotected('UserName')),
    id: 1
  },
  { displayName: 'Sort by URL',
    compare: (a: KdbxItemWrapper, b: KdbxItemWrapper) =>
      a.getFieldUnprotected('URL').localeCompare(b.getFieldUnprotected('URL')),
    id: 2
  },
  { displayName: 'Sort by Creation Time',
    compare: (a: KdbxItemWrapper, b: KdbxItemWrapper) =>
      a.creationTime.valueOf() - b.creationTime.valueOf(),
    id: 3
  }
]

export const sortEntriesAtom = atom<ISortMenuItem>({
  key: 'top/sortMenu',
  default: sortMenuItems[0]
})

export const filteredEntriesSelector = selector<KdbxItemWrapper[]>({
  key: 'filteredEntriesSelector',
  get: ({get}) => {
    const colorFilter = get(colorFilterAtom);
    const tagFilter = get(tagFilterAtom);
    const searchFilter = get(searchFilterAtom);
    const sortField = get(sortEntriesAtom);
    let filtered = get(entriesSelector);
    if (colorFilter)
      filtered = filtered.filter(e => e.bgColor === colorFilter);
    if (tagFilter.length > 0)
      filtered = filtered.filter(e => e.tags.filter(t => tagFilter.includes(t)).length > 0)
    if (searchFilter)
      filtered = filtered.filter(e =>
        Array.from(e.fields.values()).filter(f => f.includes(searchFilter)).length > 0
      )
    filtered = filtered.slice().sort(sortField.compare)
    return filtered;
  }
})

export const isDbSavedSelector = selector<boolean>({
  key:'global/isDbSaved',
  get: ({get}) => { return !!get(keeStateAtom).find(e => e.isChanged) },
  set: ({set}) => set(keeStateAtom, state => {
    let newState = state
    for(let item of state)
      newState = updateItem(newState, item.applyChanges(i => i.isChanged = false))
    return newState;
  })
})

const updateItem = (entries: KdbxItemWrapper[], updatedEntry: KdbxItemWrapper) => {
  const index = entries.findIndex(e => e.uuid.equals(updatedEntry.uuid));
  return (index === -1)
    ? entries
    : [...entries.slice(0, index), updatedEntry, ...entries.slice(index + 1)]
}

