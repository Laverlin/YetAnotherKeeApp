import React from "react";
import clsx from "clsx";
import {
  Checkbox,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  withStyles,
  WithStyles
} from "@material-ui/core";
import {KeeData, KeeDataContext, DefaultColors, SystemIcon } from "../../entity";
import {groupListStyles} from "./groupListStyles"
import {SvgPath} from "../common";

interface ITagSelectListItemProps extends WithStyles<typeof groupListStyles> {}

class TagSelectListItem extends React.Component<ITagSelectListItemProps> {

  static contextType = KeeDataContext;
  get keeData() { return this.context as KeeData; }

  #tagSelectionAncor = null as any;
  state = {
    isShowTagSelection: false,
    isShowClear: false
  }

  handleClearTags(event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) {
    this.keeData.entryFilter.tagFilter = [];
    event.stopPropagation();
    this.forceUpdate();
  }

  handleAddTag(tag: string) {
    this.keeData.entryFilter.addTag2Filter(tag);
    this.forceUpdate();
  }

  render()
  {
    const { classes } = this.props;
    const { isShowTagSelection, isShowClear } = this.state;
    const { entryFilter } = this.keeData;

    return (
      <ListItem
        button
        className = {classes.listItem}
        onClick = {() => {
          this.setState({isShowTagSelection: !isShowTagSelection, isShowClear: false});
          (this.#tagSelectionAncor as HTMLDivElement).blur();
        }}
        ref = {node => (this.#tagSelectionAncor = node)}
        onMouseEnter = {() => entryFilter.tagFilter.length > 0 && this.setState({isShowClear: true})}
        onMouseLeave = {() => this.setState({isShowClear: false})}
      >
        <ListItemIcon className={classes.icon}>
          <SvgPath
            path = {SystemIcon.tag}
            style = {{color: entryFilter.tagFilter.length > 0 ? DefaultColors.green : ''}}
          />
        </ListItemIcon>
        <ListItemText
          classes={{primary:classes.listItemText, secondary:classes.listItemSubText}}
          primary = 'Tags'
          secondary = {entryFilter.tagFilter.join(', ')}
        />
        <div  hidden = {!isShowClear}>
          <IconButton
            className = {classes.icon}
            onClick = {e => this.handleClearTags(e)}
          >
            <SvgPath path = {SystemIcon.clear} />
          </IconButton>
        </div>
        <Menu
          open = {isShowTagSelection}
          PaperProps = {{className: clsx(classes.tagSelector, classes.scrollBar)}}
          anchorEl = {this.#tagSelectionAncor}
          anchorOrigin = {{vertical: 'center', horizontal: 'center'}}
          getContentAnchorEl = {null}
          onClose = {() => this.setState({isShowClear: false})}
        >
          {this.keeData.tags.map(tag =>
            <MenuItem onClick = {() => this.handleAddTag(tag)} key = {tag} value = {tag}>
              <Checkbox checked = {entryFilter.tagFilter.includes(tag)} />
              {tag}
            </MenuItem>
          )}
        </Menu>
      </ListItem>
    )
  }
}

export default withStyles(groupListStyles, { withTheme: true })(TagSelectListItem);
