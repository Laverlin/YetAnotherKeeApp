import React from "react"
import { useRecoilState, useSetRecoilState } from 'recoil'
import { ListItemIcon, Menu, MenuItem } from "@material-ui/core"
import { DefaultKeeIcon, SystemIcon, closePanel, customPropertyMenuAtom, itemStateAtom, KdbxItemState } from "../../entity"
import { SvgPath } from "../common"
import { ProtectedValue } from "kdbxweb"

interface IProp {
  entry: KdbxItemState
}

export const CustomPropertyMenu: React.FC<IProp> = ({entry}) => {

  // Global state
  //
  const [menuState, setMenuState] = useRecoilState(customPropertyMenuAtom);
  const setEntryState = useSetRecoilState(itemStateAtom(entry.uuid.id));

  // Handlers
  //
  const handlePropertyProtection = () => {
    const fieldOriginal = entry.getField(menuState.fieldId);
    const fieldUpdated = fieldOriginal instanceof ProtectedValue
      ? fieldOriginal.getText()
      : ProtectedValue.fromString(fieldOriginal);
    setEntryState(entry.setField(menuState.fieldId, fieldUpdated));
    setMenuState({...closePanel, isProtected: false, fieldId: ''})
  }

  const handleDeleteProperty = (fieldId: string) => {
    setEntryState(entry.deleteField(fieldId));
    setMenuState({...closePanel, isProtected: false, fieldId: ''})
  }

  return (
    <Menu
      open = {menuState.isShowPanel}
      onClose = {() => setMenuState({isShowPanel: false, panelAnchor: null, isProtected: false, fieldId: ''})}
      anchorEl = {menuState.panelAnchor}
      anchorOrigin = {{vertical: 'top', horizontal: 'left'}}
      transformOrigin = {{vertical: 'top', horizontal: 'right'}}
      getContentAnchorEl = {null}
    >
      <MenuItem onClick = {() => handlePropertyProtection()}>
        <ListItemIcon>
            <SvgPath path = {menuState.isProtected ? DefaultKeeIcon['unlock-alt'] : DefaultKeeIcon.lock} />
        </ListItemIcon>
        {menuState.isProtected ? 'Remove Protection' : 'Protect Value'}
      </MenuItem>
      <MenuItem onClick = {() => handleDeleteProperty(menuState.fieldId)}>
        <ListItemIcon >
            <SvgPath path = {SystemIcon.delete} />
        </ListItemIcon>
        Delete Property
      </MenuItem>
    </Menu>
  )
}
