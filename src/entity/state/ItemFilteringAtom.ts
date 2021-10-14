import { KdbxEntryField, KdbxUuid, ProtectedValue } from 'kdbxweb';
import {atom, selector} from 'recoil'
import { AllItemsGroupState, GlobalContext, itemStateAtom, selectGroupAtom, KdbxItemState, itemIdsAtom, ISortMenuItem, sortMenuItems} from '..'

/**
 * Base selector to filter items in selected gorup.
 */
export const entriesSelector = selector<KdbxItemState[]>({
  key: 'entriesSelector',
  get: ({get}) => {

    const groupUuid = get(selectGroupAtom)
    if (!groupUuid)
      return [];

    const selectedGroup = groupUuid.equals(GlobalContext.allItemsGroupUuid)
      ? new AllItemsGroupState()
      : get(itemStateAtom(groupUuid.id))

    const filter = (item: KdbxItemState) => {
      return ((!item.isGroup || selectedGroup.isRecycleBin) &&
        (item.parentUuid?.equals(selectedGroup.uuid) ||
          (selectedGroup.isAllItemsGroup && !item.isRecycled) ||
          (selectedGroup.isRecycleBin && item.isRecycled )
        )
      )
    }

    return get(itemIdsAtom)
      .map(uuid => get(itemStateAtom(uuid.id)))
      .filter(filter)
  }
})

/**
 * Selector to get all available tags
 */
export const tagSelector = selector<string[]>({
  key: 'tagSelector',
  get: ({get}) => {
    let tags: string[] = [];
    tags = get(itemIdsAtom).map(i => tags.concat(get(itemStateAtom(i.id)).tags)).flat();
    return [...new Set(tags)].sort();
  }
})

/**
 * Atom to store the state of selected filters
 */
export const tagFilterAtom = atom<string[]>({
  key: 'group/tagFilterAtom',
  default: []
})

/**
 * Atom to store the state of selected colors
 */
export const colorFilterAtom = atom<{color:string}>({
  key: 'group/colorFilterAtom',
  default: {color: ''}
})

/**
 * Atom to store the state of query string
 */
export const searchFilterAtom = atom<string>({
  key: 'top/searchFilter',
  default: ''
})

/**
 * Atom to store the sort order state
 */
export const sortEntriesAtom = atom<ISortMenuItem>({
  key: 'top/sortMenu',
  default: sortMenuItems[0]
})

/**
 * Selector to filter items according to all available filters and sort them
 */
export const filteredEntriesSelector = selector<KdbxUuid[]>({
  key: 'filteredEntriesSelector',
  get: ({get}) => {

    const filterRecord = (item: KdbxItemState, query: string): boolean => {
      const normalizedQuery = query.toLocaleLowerCase();
      return !!item.fields.findFirstValue<KdbxEntryField>(i =>
        i instanceof ProtectedValue
          ? i.getText().toLocaleLowerCase().includes(normalizedQuery)
          : i.toLocaleLowerCase().includes(normalizedQuery)
        ) ||
        !!item.tags.find(t => t.toLocaleLowerCase().includes(normalizedQuery))
    }

    const colorFilter = get(colorFilterAtom);
    const tagFilter = get(tagFilterAtom);
    const searchFilter = get(searchFilterAtom);
    const sortField = get(sortEntriesAtom);
    let filtered = get(entriesSelector);

    if (colorFilter.color)
      filtered = filtered.filter(e => e.bgColor === colorFilter.color);
    if (tagFilter.length > 0)
      filtered = filtered.filter(e => e.tags.filter(t => tagFilter.includes(t)).length > 0);
    if (searchFilter)
      filtered = filtered.filter(e => filterRecord(e, searchFilter));
    filtered = filtered.slice().sort(sortField.compare);

    return filtered.map(i => i.uuid);
  }
})
