import { KdbxGroup, KdbxUuid } from 'kdbxweb'
import { atom, atomFamily, selector, DefaultValue } from 'recoil'
import { ITreeItem } from '..'
import { currentContext, ITreeStateChange } from '../model/GlobalContext'
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

export class Selection {
  selectedEntry: KdbxItemState | undefined;
  selectedGroup: KdbxItemState | undefined;
  public constructor(init?:Partial<Selection>) {
    Object.assign(this, init);
  }
}
export const selectAtom = atom<Selection>({
  key: 'global/selectAtom',
  default: new Selection({selectedGroup: new AllItemsGroupState(true)})
})
export const selectItemSelector = selector<KdbxItemState | undefined>({
  key: 'global/selectSelector',
  get: ({get}) => { return get(selectAtom).selectedEntry || get(selectAtom).selectedGroup },
  set: ({set}, payLoad) => {
    if (!payLoad || payLoad instanceof DefaultValue)
      return;

    const newSelected = payLoad.setSelected(true);
    let prevSelection = new Selection();
    set(selectAtom, curSelection => {
      prevSelection = curSelection;
      return newSelected.isGroup && !newSelected.isRecycled
        ? {selectedEntry: undefined, selectedGroup: newSelected}
        : {...curSelection, selectedEntry: newSelected}
    })

    if (prevSelection.selectedEntry)
      set(itemStateAtom(prevSelection.selectedEntry.uuid.id), cur => cur.setSelected(false));

    if (newSelected.isGroup && prevSelection.selectedGroup && !newSelected.isRecycled)
      set(itemStateAtom(prevSelection.selectedGroup.uuid.id), cur => cur.setSelected(false));

    set(itemStateAtom(newSelected.uuid.id), newSelected);
  }
})


export const isDbSavedSelector = selector<boolean>({
  key:'global/isDbSaved',
  get: ({get}) => { return !!get(treeStateAtom).find(e => get(itemStateAtom(e.itemUuid.id)).isChanged) }
  /*
  set: ({get, set}) => set(itemStateAtom(get()), state => {
    let newState = state
    for(let item of state)
      newState = updateItem(newState, item.applyChanges(i => i.isChanged = false))
    return newState;
  })
  */
})




