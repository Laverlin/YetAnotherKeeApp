import { Divider, ListItemIcon, Menu, MenuItem} from '@material-ui/core';
import assert from 'assert';
import React, { FC } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { DefaultKeeIcon, SystemIcon } from '../../entity';
import { MoveDirection } from '../../entity/KeeData';
import { KdbxItemWrapper } from '../../entity/model/KdbxItemWrapper';
import { KeeFileManager } from '../../entity/model/KeeFileManager';
import { editSelectedItem, keeStateAtom, selectedEntrySelector, selectedGroupSelector } from '../../entity/state/Atom';
import { closeItemContextMenu, groupContextMenuAtom } from '../../entity/state/PanelStateAtoms';
import { SvgPath } from '../common';


export const GroupContextMenu: FC = () => {

  // Global state
  //
  const [contextMenu, setContextMenuState] = useRecoilState(groupContextMenuAtom);
  const setItemState = useSetRecoilState(editSelectedItem);
  const addItemToState = useRecoilCallback(
    ({set}) => (value: KdbxItemWrapper) => { set(keeStateAtom, (cur => cur.concat(value))) }
  );
  const setSelectedGroup = useSetRecoilState(selectedGroupSelector);
  const setSelectedEntry = useSetRecoilState(selectedEntrySelector);

  // Handlers
  //
  const handleCreateItem = (isGroup: boolean) => {
    assert(contextMenu.entry);
    setContextMenuState(closeItemContextMenu);
    const newItem = KeeFileManager.createItem(contextMenu.entry, isGroup, 'New Group');
    addItemToState(newItem);
    isGroup ? setSelectedGroup(newItem) : setSelectedEntry(newItem);
  }

  const changeGroupOrder = (direction: MoveDirection) => {
    assert(contextMenu.entry);
    setContextMenuState(closeItemContextMenu);
    setItemState(KeeFileManager.stepGroup(contextMenu.entry, direction));
  }

  const handleDeleteGroup = () => {
    assert(contextMenu.entry);
    setContextMenuState(closeItemContextMenu);
    setSelectedGroup(contextMenu.entry.parent);
    setItemState(KeeFileManager.deleteItem(contextMenu.entry));
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
        onClick = {() => changeGroupOrder(MoveDirection.Up)}
      >
        <ListItemIcon>
          <SvgPath path = {SystemIcon.cone_up} />
        </ListItemIcon>
        Move Up
      </MenuItem>

      <MenuItem
        disabled = {contextMenu.entry?.isDefaultGroup}
        onClick = {() => changeGroupOrder(MoveDirection.Down)}
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


