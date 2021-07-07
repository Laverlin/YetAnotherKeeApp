import { Divider, ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import { KdbxEntry} from 'kdbxweb';
import React from 'react';
import {  DefaultKeeIcon, SystemIcon } from '../../entity';
import { SvgPath } from '../common';

export interface IContextMenuProps {
  handleCopy(filedName: string, entry: KdbxEntry): void
}

export class ContextMenu extends React.Component<IContextMenuProps> {
  constructor(props : IContextMenuProps){
    super(props);
    this.handleContextMenuClose = this.handleContextMenuClose.bind(this);
  }

  state = {
    isContextMenuOpen: false,
    mouseX: 0,
    mouseY: 0,
    selectedEntry: undefined as KdbxEntry | undefined
  }

  handleContextMenuOpen(event: React.MouseEvent<HTMLDivElement>, entry: KdbxEntry) {
    event.preventDefault();
    this.setState({
      isContextMenuOpen: true,
      mouseX: event.clientX,
      mouseY: event.clientY,
      selectedEntry: entry,
    });
  }

  handleContextMenuClose() {
    this.setState({isContextMenuOpen: false});
  }

  handleCopy(
    fieldName: string,
    event: React.MouseEvent<Element, MouseEvent>
  ): void {
    event.stopPropagation();
    this.setState({ isContextMenuOpen: false });
    if (this.props.handleCopy && this.state.selectedEntry){
      this.props.handleCopy(fieldName, this.state.selectedEntry)
    }
  }

  render() {

    const {isContextMenuOpen} = this.state;

    return (
      <Menu
      keepMounted
      open = {isContextMenuOpen}
      onClose = {this.handleContextMenuClose}
      anchorReference = "anchorPosition"
      anchorPosition = {{ top: this.state.mouseY, left: this.state.mouseX }}
    >
        <MenuItem
          disabled = {!this.state.selectedEntry?.fields.get('Password')}
          onClick = {event => this.handleCopy('Password', event)}
        >
          <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.key}/>
          </ListItemIcon>
          Copy Password
        </MenuItem>
        <MenuItem
          disabled = {!this.state.selectedEntry?.fields.get('UserName')}
          onClick = {event => this.handleCopy('UserName', event)}
        >
          <ListItemIcon>
            <SvgPath path = {SystemIcon.user}/>
          </ListItemIcon>
          Copy User Name
        </MenuItem>

        <MenuItem
          disabled = {!this.state.selectedEntry?.fields.get('URL')}
          onClick = {event => this.handleCopy('URL', event)}
        >
          <ListItemIcon>
            <SvgPath path = {DefaultKeeIcon.link} />
          </ListItemIcon>
          Copy Url
        </MenuItem>

      <Divider/>
      <MenuItem onClick={this.handleContextMenuClose}>Go to Url</MenuItem>
      <MenuItem onClick={this.handleContextMenuClose}>Auto-Type</MenuItem>
    </Menu>
    );
  }
}

