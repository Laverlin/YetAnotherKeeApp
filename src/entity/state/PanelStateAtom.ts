import { atom } from 'recoil'
import { KdbxItemState } from '..'

/**
 * common contract for panels state
 */
export interface IPanelState {
  panelAnchor: Element | null;
  isShowPanel: boolean
}

/**
 * constant to close panel
 */
export const closePanel: IPanelState = {
  isShowPanel: false,
  panelAnchor: null
}

/**
 * function helper to open panel at specifed element
 */
export const openPanel = (panelAchor: Element): IPanelState => {
  return {
    isShowPanel: true,
    panelAnchor: panelAchor
  }
}

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

export const toolSortMenuAtom = atom<IPanelState>({
  key: 'toolbar/SortMenuAtom',
  default: closePanel
})

/**
 * additional data for the custom property menu in detail panel
 */
export interface ICustomPropMenuState extends IPanelState {
  isProtected: boolean
  fieldId: string
}

export const customPropertyMenuAtom = atom<ICustomPropMenuState>({
  key: 'detail/customPropertyMenuAtom',
  default: {
    ...closePanel,
    isProtected: false,
    fieldId: ''
  } as ICustomPropMenuState
})

/**
 * Additional data for context menu in group tree and entry list
 */
export interface IItemContextMenuState extends IPanelState {
  entry: KdbxItemState | undefined
}

/**
 * const to close context menu
 */
export const closeItemContextMenu = {...closePanel, entry: undefined}

/**
 * func to open context menu for specific entry
 * @param anchor element co ancor menu on sccreen
 * @param entry context data
 */
export const openItemContextMenu = (anchor: Element, entry: KdbxItemState) => {
  return {...openPanel(anchor), entry: entry};
}

/**
 * Atom for the state of the entry context menu
 */
export const entryContextMenuAtom = atom<IItemContextMenuState>({
  key: 'entry/contextMenuAtom',
  default: closeItemContextMenu
})

/**
 * Atom for the state of the group context menu
 */

export const groupContextMenuAtom = atom<IItemContextMenuState>({
  key: 'group/contextMenuAtom',
  default: closeItemContextMenu
})

/**
 * atom to store notifications
 */
export const notificationAtom = atom<string>({
  key: 'global/notification',
  default: ''
})

