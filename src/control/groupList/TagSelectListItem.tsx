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
  constructor(props: ITagSelectListItemProps) {
    super(props);
    this.handleClearTags = this.handleClearTags.bind(this);
  }

  static contextType = KeeDataContext;
  get keeData() { return this.context as KeeData; }

  #tagSelectionAncor = null as any;
  state = {
    selectedTags: [] as string[],
    isShowTagSelection: false,
    isShowClear: false
  }

  handleTagSelect(tag: string) {
    const tags = this.state.selectedTags.includes(tag)
      ? this.state.selectedTags.filter(i => i != tag)
      : this.state.selectedTags.concat(tag);

    this.setState({selectedTags: tags, isShowClear: false });
    this.keeData.notifyTagFilterSubscribers(tags);
  }

  handleClearTags(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    this.setState({selectedTags: [], isShowClear: false });
    this.keeData.notifyTagFilterSubscribers([]);
    event.stopPropagation();
  }

  render()
  {
    const { classes } = this.props;
    const { selectedTags, isShowTagSelection, isShowClear } = this.state;

    return (
      <ListItem button
        className={classes.listItem}
        onClick = {() => this.setState({isShowTagSelection: !isShowTagSelection})}
        buttonRef = {node => (this.#tagSelectionAncor = node)}
        onMouseEnter = {() => selectedTags.length > 0 && this.setState({isShowClear: true})}
        onMouseLeave = {() => this.setState({isShowClear: false})}
      >
        <ListItemIcon className={classes.icon}>
          <SvgPath
            path = {SystemIcon.tag}
            style = {{color: selectedTags.length > 0 ? DefaultColors.green : ''}}
          />
        </ListItemIcon>
        <ListItemText
          classes={{primary:classes.listItemText, secondary:classes.listItemSubText}}
          primary = 'Tags'
          secondary = {selectedTags.join(', ')}
        />
        <div  hidden = {!isShowClear}>
          <IconButton className={classes.icon} onClick = {e => this.handleClearTags(e)} >
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
            <MenuItem onClick = {() => this.handleTagSelect(tag)} key = {tag} value = {tag}>
              <Checkbox checked = {selectedTags.includes(tag)} />
              {tag}
            </MenuItem>
          )}
        </Menu>
      </ListItem>
    )
  }
}

export default withStyles(groupListStyles, { withTheme: true })(TagSelectListItem);
