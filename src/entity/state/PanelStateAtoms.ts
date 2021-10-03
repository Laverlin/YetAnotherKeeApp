import { KdbxUuid } from 'kdbxweb'
import { atom, atomFamily } from 'recoil'
import { KdbxItemWrapper } from '../model/KdbxItemWrapper'


export interface IPanelState {
  panelAnchor: Element | null;
  isShowPanel: boolean
}

export const closePanel: IPanelState = {
  isShowPanel: false,
  panelAnchor: null
}

export const openPanel = (panelAchor: Element): IPanelState => {
  return {
    isShowPanel: true,
    panelAnchor: panelAchor
  }
}

export interface ICustomPropMenuState extends IPanelState {
  isProtected: boolean
  fieldId: string
}

export interface IHistoryState {
  isInHistory: boolean
  historyIndex: number
}

export const customPropertyMenuAtom = atom<ICustomPropMenuState>({
  key: 'detail/customPropertyMenuAtom',
  default: {
    ...closePanel,
    isProtected: false,
    fieldId: ''
  } as ICustomPropMenuState
})

export const customPropertyPanelAtom = atom<IPanelState>({
  key: 'detail/customPropertyPanelAtom',
  default: closePanel
})

export const iconChoisePanelAtom = atom<IPanelState>({
  key: 'detail/iconChoisePanelAtom',
  default: closePanel
})

export const colorChoisePanelAtom = atom<IPanelState>({
  key: 'detail/colorChoisePanelAtom',
  default: closePanel
})

export const passwordPanelAtom = atom<IPanelState>({
  key: 'detail/passwordPanelAtom',
  default: closePanel
})

/*
export const historyAtom = atomFamily<IHistoryState, string>({
  key: 'detail/historyAtom',
  default: selectorFamily ({
    key: 'detail/historyDefaultSelector',
    get: _ => ({get}) => {
      return {isInHistory: false, historyIndex: get(editSelectedItem)?.history.length || 0}
    }
  })
})

const getHistoryLenght = (id: string): number => {
  const entry = KeeFileManager.allItems.find(i => i.uuid.equals(id));
  return entry instanceof KdbxEntry ? entry.history.length : 0;
}
*/

export const historyAtom = atomFamily<IHistoryState, string>({
  key: 'detail/historyAtom',
  default:  {
      isInHistory: false,
      historyIndex: 0
    }
})

export interface IItemContextMenuState extends IPanelState {
  entry: KdbxItemWrapper | undefined
}

export const closeItemContextMenu = {...closePanel, entry: undefined}
export const openItemContextMenu = (anchor: Element, entry: KdbxItemWrapper) => {
  return {...openPanel(anchor), entry: entry};
}

export const itemContextMenuAtom = atom<IItemContextMenuState>({
  key: 'item/contextMenuAtom',
  default: closeItemContextMenu
})

export const notificationAtom = atom<string>({
  key: 'global/notification',
  default: ''
})

/*
export interface IGroupContextMenuState extends IPanelState {
  groupUuid: KdbxUuid | undefined
}
export const closeGroupContextMenu = {...closePanel, groupUuid: undefined}
export const openGroupContextMenu = (anchor: Element, groupUuid: KdbxUuid) => {
  return {...openPanel(anchor), groupUuid: groupUuid};
}
*/

export const groupContextMenuAtom = atom<IItemContextMenuState>({
  key: 'group/contextMenuAtom',
  default: closeItemContextMenu
})

export const toolSortMenuAtom = atom<IPanelState>({
  key: 'toolbar/SortMenuAtom',
  default: closePanel
})

