import { KdbxUuid } from 'kdbxweb'
import { atom, atomFamily, selector, selectorFamily, DefaultValue } from 'recoil'
import { AllItemsGroupState, KdbxItemState, GroupStatistic, GlobalContext } from '..'

/**
 * state of all item ids
 */
export const itemIdsAtom = atom<KdbxUuid[]>({
  key: 'global/itemIdsAtom',
  default: []
})

/**
 * Updates itemIds array and the item caused changes. Get always return undefined
 */
export const itemIdsUpdateSelector = selector<KdbxUuid | undefined>({
  key: 'global/itemIdsUpdateSelector',
  get: (({}) => undefined),
  set: ({get, set}, changedItemUuid) => {
    if (!changedItemUuid || changedItemUuid instanceof DefaultValue)
      return
    const tree = get(itemIdsAtom);
    const index = tree.findIndex(uuid => uuid.equals(changedItemUuid));
    set(itemIdsAtom, (index > -1)
      ? [...tree.slice(0, index), new KdbxUuid(changedItemUuid.id), ...tree.slice(index + 1)]
      : tree.concat(changedItemUuid))
    set(itemStateAtom(changedItemUuid.id), cur => cur.setChanged(true));
  }
})

/**
 * Stored the state of individual item
 */
export const itemStateAtom = atomFamily<KdbxItemState, string>({
  key: 'global/itemStateAtom',
  default: (uuid) => uuid === GlobalContext.allItemsGroupUuid.id
    ? new AllItemsGroupState(true)
    : new KdbxItemState(new KdbxUuid(uuid))
})

/**
 * state (uuid) of selected group
 */
export const selectGroupAtom = atom<KdbxUuid | undefined>({
  key: 'global/selectGroupAtom',
  default: GlobalContext.allItemsGroupUuid
})

/**
 * state (uuid) of selected entry
 */
export const selectEntryAtom = atom<KdbxUuid | undefined>({
  key: 'global/selectEntryAtom',
  default: undefined
})

/**
 * get - returns selected entry if one exists, otherwise returns selected group \
 * set - set selected item (entry or group), and change selected states of previously selected and new selected group
 */
export const selectItemSelector = selector<KdbxUuid | undefined>({
  key: 'global/selectSelector',
  get: ({get}) => { return get(selectEntryAtom) || get(selectGroupAtom) },
  set: ({get, set}, selectedItemUuid) => {
    if (!selectedItemUuid || selectedItemUuid instanceof DefaultValue)
      return;

    const selectedItem = get(itemStateAtom(selectedItemUuid.id));
    if (selectedItem.isGroup && !selectedItem.isRecycled) {
      set(selectEntryAtom, curEntId => {
        curEntId && set(itemStateAtom(curEntId.id), ent => ent.setSelected(false));
        return undefined
      });
      set(selectGroupAtom, curGrpId => {
        curGrpId && set(itemStateAtom(curGrpId.id), grp => grp.setSelected(false));
        return selectedItemUuid;
      });
    }
    else {
      set(selectEntryAtom, curEntId => {
        curEntId && set(itemStateAtom(curEntId.id), ent => ent.setSelected(false));
        return selectedItemUuid;
      });
    }

    set(itemStateAtom(selectedItem.uuid.id), selectedItem.setSelected(true));
  }
})

/**
 * get - returns if any item has been changed since last save \
 * set - sets all items isChanged property to false
 */
export const isDbSavedSelector = selector<boolean>({
  key:'global/isDbSaved',
  get: ({get}) => { return !!get(itemIdsAtom).find(uuid => get(itemStateAtom(uuid.id)).isChanged) },
  set: ({get, set}) => {
    const items = get(itemIdsAtom)
      .map(uuid => get(itemStateAtom(uuid.id)))
      .filter(i => i.isChanged)
    for(let item of items)
      set(itemStateAtom(item.uuid.id), item.setChanged(false));
  }
})

/**
 * calculates group statistics info \
 * total entries, for 'All Group' - all entries, for recycle bin - includes entries in deleted groups \
 * date of last changed element \
 * date of expired element closest to now
 */
export const groupStatSelector = selectorFamily<GroupStatistic, string>({
  key: 'stat/groupStatSelector',
  get: (uuid) => ({get}) => {

    const group = new KdbxItemState(new KdbxUuid(uuid));

    const reducerGroup = (acc: GroupStatistic, uuid: KdbxUuid) => {
      const item = new KdbxItemState(uuid);
      if (filter(item, group)) {
        acc.totalEntries++;
        acc.lastChanged = toDate(Math.max(acc.lastChanged?.valueOf() || 0, item.lastModifiedTime?.valueOf() || 0))
        acc.closeExpired = item.isExpires && ((item.expiryTime?.valueOf() || 0) > Date.now())
          ? toDate(
            (!acc.closeExpired)
              ? item.expiryTime?.valueOf() || 0
              : Math.min(acc.closeExpired?.valueOf() || 0, item.expiryTime?.valueOf() || 0)
            )
          : acc.closeExpired
      }
      return acc;
    }

    const filter = (item: KdbxItemState, group: KdbxItemState) => {
      return !item.isGroup && (
        item.parentUuid?.equals(group.uuid)
        || group.isAllItemsGroup
        || (group.isRecycleBin && item.isRecycled)
      );
    }

    const toDate = (value: number) => {
      return value > 0 ? new Date(value): undefined
    }

    return get(itemIdsAtom).reduce(reducerGroup, new GroupStatistic())
  }
})



