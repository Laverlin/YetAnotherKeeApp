import { atom, atomFamily } from 'recoil'
import { KdbxItemState } from '..'

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

export const historyAtom = atomFamily<IHistoryState, string>({
  key: 'detail/historyAtom',
  default:  {
      isInHistory: false,
      historyIndex: 0
    }
})

export interface IItemContextMenuState extends IPanelState {
  entry: KdbxItemState | undefined
}

export const closeItemContextMenu = {...closePanel, entry: undefined}
export const openItemContextMenu = (anchor: Element, entry: KdbxItemState) => {
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

export const groupContextMenuAtom = atom<IItemContextMenuState>({
  key: 'group/contextMenuAtom',
  default: closeItemContextMenu
})

export const toolSortMenuAtom = atom<IPanelState>({
  key: 'toolbar/SortMenuAtom',
  default: closePanel
})

