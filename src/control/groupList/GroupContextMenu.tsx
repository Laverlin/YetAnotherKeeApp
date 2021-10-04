import { Divider, ListItemIcon, Menu, MenuItem} from '@material-ui/core';
import assert from 'assert';
import React, { FC } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DefaultKeeIcon, closeItemContextMenu, groupContextMenuAtom, SystemIcon, treeStateUpdateSelector, currentContext, selectItemSelector } from '../../entity';


import { SvgPath } from '../common';


export const GroupContextMenu: FC = () => {

  // Global state
  //
  const [contextMenu, setContextMenuState] = useRecoilState(groupContextMenuAtom);
  const setTreeState = useSetRecoilState(treeStateUpdateSelector);
  const setSelectedItem = useSetRecoilState(selectItemSelector);

  // Handlers
  //
  const handleCreateItem = (isGroup: boolean) => {
    assert(contextMenu.entry);
    setContextMenuState(closeItemContextMenu);
    const newItem = currentContext.createItem(contextMenu.entry.uuid, isGroup, 'New Group');
    setTreeState(newItem);
    setSelectedItem(newItem.item);
  }

  const changeGroupOrder = (isUp: boolean) => {
    assert(contextMenu.entry);
    setContextMenuState(closeItemContextMenu);
    const shiftedEntry = contextMenu.entry.shiftGroup(isUp);
    if (shiftedEntry)
      setTreeState(shiftedEntry);
  }

  const handleDeleteGroup = () => {
    assert(contextMenu.entry);
    setContextMenuState(closeItemContextMenu);
    //setSelectedItem(contextMenu.entry.parent);
    setTreeState(contextMenu.entry.deleteItem());
  }

  return (
    <Menu
      open = {contextMenu.isShowPanel}
      onClose = {() => setContextMenuState(closeItemContextMenu)}
      anchorEl = {contextMenu.panelAnchor}
      anchorOrigin = {{vertical: 'top', horizontal: 'right'}}
      transformOrigin = {{vertical: 'top', horizontal: 'left'}}
      getContentAnchorEl = {null}
    >
      <MenuItem onClick = {() => handleCreateItem(false)}>
        <ListItemIcon >
            <SvgPath path = {DefaultKeeIcon.key} />
        </ListItemIcon>
        Create Entry
      </MenuItem>

      <MenuItem onClick = {() => handleCreateItem(true)}>
        <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon['folder-o']} />
        </ListItemIcon>
        Create Group
      </MenuItem>

      <Divider />

      <MenuItem
        disabled = {
          contextMenu.entry?.isDefaultGroup ||
          contextMenu.entry?.groupSortOrder === 0
        }
        onClick = {() => changeGroupOrder(true)}
      >
        <ListItemIcon>
          <SvgPath path = {SystemIcon.cone_up} />
        </ListItemIcon>
        Move Up
      </MenuItem>

      <MenuItem
        disabled = {contextMenu.entry?.isDefaultGroup}
        onClick = {() => changeGroupOrder(false)}
      >
        <ListItemIcon>
          <SvgPath path = {SystemIcon.cone_down} />
        </ListItemIcon>
        Move Down
      </MenuItem>

      <Divider />

      <MenuItem
        disabled = {contextMenu.entry?.isDefaultGroup}
        onClick = {() => handleDeleteGroup()}
      >
        <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.trash} />
        </ListItemIcon>
        Delete Group
      </MenuItem>

    </Menu>
  );
}


