import { Divider, ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import assert from 'assert';
import React, { FC } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {  DefaultFields, DefaultKeeIcon, SystemIcon } from '../../entity';
import { KeeFileManager } from '../../entity/model/KeeFileManager';
import { editSelectedItem } from '../../entity/state/Atom';
import { closeItemContextMenu, itemContextMenuAtom, notificationAtom } from '../../entity/state/PanelStateAtoms';
import { SvgPath } from '../common';

export const EntryContextMenu: FC = () => {

  const [contextMenuState, setContextMenuState] = useRecoilState(itemContextMenuAtom);
  const setMessage = useSetRecoilState(notificationAtom);
  const setItemState = useSetRecoilState(editSelectedItem);

  const handleCopy = (fieldName: keyof typeof DefaultFields, event: React.MouseEvent<Element, MouseEvent>): void => {
    event.stopPropagation();
    if (!contextMenuState.entry)
      return;
    setContextMenuState(closeItemContextMenu);
    navigator.clipboard.writeText(contextMenuState.entry.getFieldUnprotected(fieldName));
    setMessage(`${DefaultFields[fieldName]} is copied`);
  }

  const handleDeleteEntry = () =>  {
    assert(contextMenuState.entry);
    setContextMenuState(closeItemContextMenu);
    const deletedEntry = KeeFileManager.deleteItem(contextMenuState.entry);
    setItemState(deletedEntry);
  }

  const entry = contextMenuState.entry;
  if (!entry)
    return null;

  return (
    <Menu
      keepMounted
      open = {contextMenuState.isShowPanel}
      onClose = {() => setContextMenuState(closeItemContextMenu)}
      anchorEl = {contextMenuState.panelAnchor}
      anchorOrigin = {{vertical: 'top', horizontal: 'left'}}
      transformOrigin = {{vertical: 'top', horizontal: 'right'}}
      getContentAnchorEl = {null}
    >
      { !entry.isGroup &&
        <MenuItem
          key = 'copyPwd'
          disabled = {!entry.getField('Password').toString()}
          onClick = {event => handleCopy('Password', event)}
        >
          <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.key}/>
          </ListItemIcon>
          Copy Password
        </MenuItem>
      }
      { !entry.isGroup &&
        <MenuItem
          key = 'copyUserName'
          disabled = {!entry.getField('UserName')}
          onClick = {event => handleCopy('UserName', event)}
        >
          <ListItemIcon>
            <SvgPath path = {SystemIcon.user}/>
          </ListItemIcon>
          Copy User Name
        </MenuItem>
      }
      { !entry.isGroup &&
        <MenuItem
          key = 'copyUrl'
          disabled = {!entry.getField('URL')}
          onClick = {event => handleCopy('URL', event)}
        >
          <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.link} />
          </ListItemIcon>
          Copy Url
        </MenuItem>
      }
      <Divider/>
      <MenuItem
        key = 'goUrl'
        onClick={() => setContextMenuState(closeItemContextMenu)} disabled
      >
        <ListItemIcon>
          <SvgPath path = {DefaultKeeIcon.bolt} />
        </ListItemIcon>
        Open Url
      </MenuItem>
      <MenuItem
        key = 'autotype'
        onClick={() => setContextMenuState(closeItemContextMenu)} disabled
      >
        <ListItemIcon>
          <SvgPath path = {DefaultKeeIcon.terminal} />
        </ListItemIcon>
        Auto-Type
      </MenuItem>
      <Divider/>
      <MenuItem
        key = 'delete'
        onClick = {() => handleDeleteEntry()}
      >
        <ListItemIcon>
          <SvgPath path = {DefaultKeeIcon.trash} />
        </ListItemIcon>
        Delete Entry
      </MenuItem>
    </Menu>
  );
}


