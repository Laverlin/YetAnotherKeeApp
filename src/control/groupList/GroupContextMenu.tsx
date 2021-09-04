import { Divider, ListItemIcon, Menu, MenuItem, withStyles } from '@material-ui/core';
import { KdbxUuid } from 'kdbxweb';
import * as React from 'react';
import { DefaultKeeIcon, KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { MoveDirection } from '../../entity/KeeData';
import { SvgPath } from '../common';
import { groupListStyles } from './groupListStyles';

interface IGroupContextMenuProps {
  openMenuHandler: (handler:(groupUuid: KdbxUuid, menuAnchor: Element) => void) => void
}

interface IGroupContextMenuState {
  isContextMenuOpen: boolean,
  menuAnchor: Element | null,
  groupUuid: KdbxUuid
}

class GroupContextMenu extends React.Component<IGroupContextMenuProps, IGroupContextMenuState> {
  static contextType = KeeDataContext;
  constructor(props: IGroupContextMenuProps) {
    super(props);
    this.menuHandler = this.menuHandler.bind(this);
    this.props.openMenuHandler(this.menuHandler);
    this.state = {
      isContextMenuOpen: false,
      menuAnchor: null,
      groupUuid: new KdbxUuid()
    }
  }

  menuHandler(groupUuid: KdbxUuid, menuAnchor: Element) {
    this.setState({isContextMenuOpen: true, groupUuid: groupUuid, menuAnchor: menuAnchor})
  }

  public render() {
    const {isContextMenuOpen, menuAnchor, groupUuid} = this.state;
    return (
      <Menu
        open = {isContextMenuOpen}
        onClose = {() => this.setState({isContextMenuOpen: false})}
        anchorEl = {menuAnchor}
        anchorOrigin = {{vertical: 'top', horizontal: 'right'}}
        transformOrigin = {{vertical: 'top', horizontal: 'left'}}
        getContentAnchorEl = {null}
      >
        <MenuItem onClick = {() => {
          this.setState({isContextMenuOpen: false});
          (this.context as KeeData).createEntry(groupUuid);
        }}>
          <ListItemIcon >
              <SvgPath path = {DefaultKeeIcon.key} />
          </ListItemIcon>
          Create Entry
        </MenuItem>

        <MenuItem onClick = {() => {
          this.setState({isContextMenuOpen: false});
          (this.context as KeeData).createGroup(groupUuid);
        }}>
          <ListItemIcon>
              <SvgPath path = {DefaultKeeIcon['folder-o']} />
          </ListItemIcon>
          Create Group
        </MenuItem>

        <Divider />

        <MenuItem
          disabled = {groupUuid.equals((this.context as KeeData).database.getDefaultGroup().uuid)}
          onClick = {() => {
            this.setState({isContextMenuOpen: false});
            (this.context as KeeData).moveGroupStep(groupUuid, MoveDirection.Up);
          }}
        >
          <ListItemIcon>
              <SvgPath path = {SystemIcon.cone_up} />
          </ListItemIcon>
          Move Up
        </MenuItem>

        <MenuItem
          disabled = {groupUuid.equals((this.context as KeeData).database.getDefaultGroup().uuid)}
          onClick = {() => {
            this.setState({isContextMenuOpen: false});
            (this.context as KeeData).moveGroupStep(groupUuid, MoveDirection.Down);
          }}
        >
          <ListItemIcon>
              <SvgPath path = {SystemIcon.cone_down} />
          </ListItemIcon>
          Move Down
        </MenuItem>

        <Divider />

        <MenuItem
          disabled = {groupUuid.equals((this.context as KeeData).database.getDefaultGroup().uuid)}
          onClick = {() => {
            this.setState({isContextMenuOpen: false});
            (this.context as KeeData).deleteGroup(groupUuid);
          }}
        >
          <ListItemIcon>
              <SvgPath path = {DefaultKeeIcon.trash} />
          </ListItemIcon>
          Delete Group
        </MenuItem>
      </Menu>
    );
  }
}

export default withStyles(groupListStyles, { withTheme: true })(GroupContextMenu)

