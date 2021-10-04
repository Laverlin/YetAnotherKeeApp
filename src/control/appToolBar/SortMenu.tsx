import React, { FC } from "react";
import {
  createStyles,
  ListItemIcon,
  Menu,
  MenuItem,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { closePanel, toolSortMenuAtom, ISortMenuItem, sortEntriesAtom, sortMenuItems, SystemIcon } from "../../entity";
import { SvgPath } from "../common";
import { useRecoilState } from "recoil";

const styles = createStyles({

  icon20: {
    height: 20,
    width: 20
  },

  menuIcon: {
    marginLeft: 'auto'
  }

});

interface IProps extends WithStyles<typeof styles> { }

const SortMenu: FC<IProps> = ({classes}) => {

  const [sortField, setSortField] = useRecoilState(sortEntriesAtom);
  const [sortMenu, setSortMenu] = useRecoilState(toolSortMenuAtom);

  const handleSort = (sortField: ISortMenuItem) => {
    setSortField(sortField);
    setSortMenu(closePanel);
  }

  return (
    <Menu
      keepMounted
      open = {sortMenu.isShowPanel}
      onClose = {() => setSortMenu(closePanel)}
      anchorEl = {sortMenu.panelAnchor}
      anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin = {{vertical: 'top', horizontal: 'left'}}
      getContentAnchorEl = {null}
    >
      {sortMenuItems.map(item =>
        <MenuItem onClick = {() => handleSort(item)} key = {item.id}>
          {item.displayName}
          <ListItemIcon className = {classes.menuIcon}>
            { (sortField.id === item.id) &&
              <SvgPath path = {SystemIcon.sortArrowAsc} style = {{marginLeft: 'auto'}}/>
            }
          </ListItemIcon>
        </MenuItem>
      )}
    </Menu>
  )
}

export default withStyles(styles, { withTheme: true })(SortMenu);
