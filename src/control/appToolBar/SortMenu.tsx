import React from "react";
import {
  createStyles,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { KeeData, KeeDataContext, SystemIcon } from "../../entity";
import { SvgPath } from "../common";

const styles = createStyles({

  icon20: {
    height: 20,
    width: 20
  },

  menuIcon: {
    marginLeft: 'auto'
  }

});

const menuItems = [
  {
    name: 'Title',
    displayName: 'Sort by Title'
  },
  {
    name: 'creationTime',
    displayName: 'Sort by Creation Time'
  },
  {
    name: 'UserName',
    displayName: 'Sort by User Name'
  },
  {
    name: 'URL',
    displayName: 'Sort by URL'
  }
]

interface Props extends WithStyles<typeof styles> {
  buttonClassName?: string
}

class SortMenu extends React.Component<Props>
{
  #sortAnchor = null as any;
  static contextType = KeeDataContext;
  state = {
    isSortMenuOpen: false,
    sortField: menuItems[0].name
  }

  handleSort(sortField: string) {
    (this.context as KeeData).notifySortSubscribers(sortField);
    this.setState({isSortMenuOpen: false, sortField: sortField});
  }

  render() {
    const {classes, buttonClassName} = this.props;

    return (
      <>
        <IconButton
          color="inherit"
          className = {buttonClassName}
          buttonRef = {node => { this.#sortAnchor = node }}
          onClick = {() => this.setState({isSortMenuOpen: true})}
        >
          <SvgPath className = {classes.icon20} path = {SystemIcon.sort}/>
        </IconButton>

        <Menu
          keepMounted
          open = {this.state.isSortMenuOpen}
          onClose = {() => this.setState({isSortMenuOpen: false})}
          anchorEl = {this.#sortAnchor}
          anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
          transformOrigin = {{vertical: 'top', horizontal: 'left'}}
          getContentAnchorEl = {null}
        >
          {menuItems.map(item =>
            <MenuItem onClick = {() => this.handleSort(item.name)} key = {item.name}>
              {item.displayName}
              <ListItemIcon className = {classes.menuIcon}>
                { (this.state.sortField === item.name)
                  && <SvgPath path = {SystemIcon.sortArrowAsc} style = {{marginLeft: 'auto'}}/>
                }
              </ListItemIcon>
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(SortMenu);
