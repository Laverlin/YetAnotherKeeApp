import { Divider, ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import { KdbxEntry, KdbxGroup} from 'kdbxweb';
import React from 'react';
import {  DefaultKeeIcon, KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { SvgPath } from '../common';

interface IContextMenuProps {
  handleCopy(filedName: string, entry: KdbxEntry): void
}

interface IContextMenuState {
  isContextMenuOpen: boolean,
  menuAnchor: Element | null,
  selectedEntry: KdbxEntry | KdbxGroup
}

export class EntryContextMenu extends React.Component<IContextMenuProps, IContextMenuState> {
  constructor(props : IContextMenuProps) {
    super(props);
    this.handleContextMenuClose = this.handleContextMenuClose.bind(this);
    this.state = {
      isContextMenuOpen: false,
      menuAnchor: null,
      selectedEntry: new KdbxEntry()
    }
  }
  static contextType = KeeDataContext;

  handleContextMenuOpen(menuAnchor: Element, entry: KdbxEntry | KdbxGroup): void  {
    this.setState({
      isContextMenuOpen: true,
      menuAnchor: menuAnchor,
      selectedEntry: entry,
    });
  }

  handleContextMenuClose(): void  {
    this.setState({isContextMenuOpen: false});
  }

  handleCopy (fieldName: string, event: React.MouseEvent<Element, MouseEvent>): void {
    event.stopPropagation();
    this.handleContextMenuClose();
    this.props.handleCopy(fieldName, this.state.selectedEntry as KdbxEntry)
  }

  handleDeleteEntry(): void  {
    (this.context as KeeData).deleteEntryOrGroup(this.state.selectedEntry);
    this.handleContextMenuClose();
  }

  render() {

    const {isContextMenuOpen, selectedEntry} = this.state;
    return (
      <Menu
        keepMounted
        open = {isContextMenuOpen}
        onClose = {this.handleContextMenuClose}
        anchorEl = {this.state.menuAnchor}
        anchorOrigin = {{vertical: 'top', horizontal: 'left'}}
        transformOrigin = {{vertical: 'top', horizontal: 'right'}}
        getContentAnchorEl = {null}
      >
        { selectedEntry instanceof KdbxEntry &&
          <MenuItem
            key = 'copyPwd'
            disabled = {!selectedEntry.fields.get('Password')?.toString()}
            onClick = {event => this.handleCopy('Password', event)}
          >
            <ListItemIcon>
              <SvgPath path = {DefaultKeeIcon.key}/>
            </ListItemIcon>
            Copy Password
          </MenuItem>
        }
        { selectedEntry instanceof KdbxEntry &&
          <MenuItem
            key = 'copyUserName'
            disabled = {!selectedEntry.fields.get('UserName')}
            onClick = {event => this.handleCopy('UserName', event)}
          >
            <ListItemIcon>
              <SvgPath path = {SystemIcon.user}/>
            </ListItemIcon>
            Copy User Name
          </MenuItem>
        }
        { selectedEntry instanceof KdbxEntry &&
          <MenuItem
            key = 'copyUrl'
            disabled = {!selectedEntry.fields.get('URL')}
            onClick = {event => this.handleCopy('URL', event)}
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
          onClick={this.handleContextMenuClose} disabled
        >
          <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.bolt} />
          </ListItemIcon>
          Open Url
        </MenuItem>
        <MenuItem
          key = 'autotype'
          onClick={this.handleContextMenuClose} disabled
        >
          <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.terminal} />
          </ListItemIcon>
          Auto-Type
        </MenuItem>
        <Divider/>
        <MenuItem
          key = 'delete'
          onClick = {() => this.handleDeleteEntry()}
        >
          <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.trash} />
          </ListItemIcon>
          Delete Entry
        </MenuItem>
      </Menu>
    );
  }
}

