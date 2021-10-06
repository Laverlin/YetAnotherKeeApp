import { KdbxEntry, KdbxGroup, KdbxUuid } from 'kdbxweb'
import { atom, atomFamily, selector, selectorFamily, DefaultValue } from 'recoil'
import { ITreeItem } from '..'
import { currentContext, ITreeStateChange } from '../model/GlobalContext'
import { GroupStatistic } from '../model/GroupStatistic'
import { AllItemsGroupState, KdbxItemState } from '../model/KdbxItemState'


export const treeStateAtom = atom<ITreeItem[]>({
  key: 'global/treeStateAtom',
  default: []
})

export const treeViewSelector = selector<KdbxItemState[]>({
  key: 'global/treeViewSelector',
  get: ({get}) => {
    return get(treeStateAtom).map( i=> { return new KdbxItemState(i.itemUuid) })
  }
})

export const treeStateUpdateSelector = selector<ITreeStateChange | undefined>({
  key: 'global/treeStateUpdateSelector',
  get: (({get}) => undefined),
  set: ({get, set}, stateChange) => {
    if (!stateChange || stateChange instanceof DefaultValue)
      return
    const tree = get(treeStateAtom);
    const index = tree.findIndex(i => i.itemUuid.equals(stateChange.treeChanges.itemUuid));
    set(treeStateAtom, (index > -1)
      ? [...tree.slice(0, index), stateChange.treeChanges, ...tree.slice(index + 1)]
      : tree.concat(stateChange.treeChanges))
    set(itemStateAtom(stateChange.item.uuid.id), stateChange.item);
  }
})

export const itemStateAtom = atomFamily<KdbxItemState, string>({
  key: 'global/itemStateAtom',
  default: (uuid) => uuid === currentContext.allItemsGroupUuid.id
    ? new AllItemsGroupState(true)
    : new KdbxItemState(new KdbxUuid(uuid))
})

export const selectGroupAtom = atom<KdbxUuid | undefined>({
  key: 'global/selectGroupAtom',
  default: currentContext.allItemsGroupUuid
})

export const selectEntryAtom = atom<KdbxUuid | undefined>({
  key: 'global/selectEntryAtom',
  default: undefined
})

export const selectItemSelector = selector<KdbxUuid | undefined>({
  key: 'global/selectSelector',
  get: ({get}) => { return get(selectEntryAtom) || get(selectGroupAtom) },
  set: ({get, set}, payLoad) => {
    if (!payLoad || payLoad instanceof DefaultValue)
      return;

    const newSelected = get(itemStateAtom(payLoad.id));
    let prevEntryId: KdbxUuid | undefined;
    let prevGroupId: KdbxUuid | undefined;
    if (newSelected.isGroup && !newSelected.isRecycled) {
      set(selectEntryAtom, cur => {prevEntryId = cur; return undefined});
      set(selectGroupAtom, cur => {prevGroupId = cur; return payLoad});
      if (prevGroupId)
        set(itemStateAtom(prevGroupId.id), cur => cur.setSelected(false));
      if (prevEntryId)
        set(itemStateAtom(prevEntryId.id), cur => cur.setSelected(false));
    }
    else {
      set(selectEntryAtom, cur => {prevEntryId = cur; return payLoad});
      if (prevEntryId)
        set(itemStateAtom(prevEntryId.id), cur => cur.setSelected(false));
    }

    set(itemStateAtom(newSelected.uuid.id), newSelected.setSelected(true));
  }
})


export const isDbSavedSelector = selector<boolean>({
  key:'global/isDbSaved',
  get: ({get}) => { return !!get(treeStateAtom).find(e => get(itemStateAtom(e.itemUuid.id)).isChanged) },

  set: ({get, set}) => {
    const items = get(treeStateAtom)
      .map(i => get(itemStateAtom(i.itemUuid.id)))
      .filter(i => i.isChanged)
    for(let item of items)
      set(itemStateAtom(item.uuid.id), item.resetChanged());
  }
})


export const groupStatSelector = selectorFamily<GroupStatistic, string>({
  key: 'stat/groupStatSelector',
  get: (uuid) => ({get}) => {

    const reducerGroup = (acc: GroupStatistic, treeItem: ITreeItem) => {
      const item = currentContext.getKdbxItem(treeItem.itemUuid);
      if (filter(item)) {
        acc.totalEntries++;
        acc.lastChanged = acc.toDate(Math.max(acc.lastChanged?.valueOf() || 0, item.times.lastModTime?.valueOf() || 0))
        acc.closeExpired = item.times.expires && item.times.expiryTime?.valueOf() || 0 > Date.now()
          ? acc.toDate(
            (!acc.closeExpired)
              ? item.times.expiryTime?.valueOf() || 0
              : Math.min(acc.closeExpired?.valueOf() || 0, item.times.expiryTime?.valueOf() || 0)
            )
          : acc.closeExpired
      }
      return acc;
    }

    const filter = (entry: KdbxEntry | KdbxGroup) => {
      return entry instanceof KdbxEntry &&
        (entry.parentGroup?.uuid.equals(uuid) ||
        (currentContext.allItemsGroupUuid.equals(uuid)) ||
        (currentContext.recycleBinUuid?.equals(uuid) && isRecycled(entry))
        )
    }

    const isRecycled = (entry: KdbxEntry | KdbxGroup) => {
      if (!currentContext.recycleBinUuid)
        return false;
      let group: KdbxEntry | KdbxGroup | undefined = entry;
      do {
        group = group?.parentGroup
        if (group?.uuid.equals(currentContext.recycleBinUuid))
          return true;
      } while(group)
      return false;
    }

    return get(treeStateAtom).reduce(reducerGroup, new GroupStatistic())
  }
})



