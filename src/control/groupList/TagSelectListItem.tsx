import React, { FC, useState } from "react";
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
import {DefaultColors, SystemIcon } from "../../entity";
import {groupListStyles} from "./groupListStyles"
import {SvgPath} from "../common";
import { useRecoilState, useRecoilValue } from "recoil";
import { tagFilterAtom, tagSelector } from "../../entity/state/Atom";

interface IProps extends WithStyles<typeof groupListStyles> {}

const TagSelectListItem: FC<IProps> = ({classes}) => {

  // global state
  //
  const [tagFilter, setTagFilter] = useRecoilState(tagFilterAtom);
  const tags = useRecoilValue(tagSelector);

  // local state
  //
  const [isShowTagSelection, setShowTagSelection] = useState(false);
  const [isShowClear, setShowClearButton] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<Element | null>(null);

  // event handlers
  //
  const handleClearTags = (event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    setTagFilter([]);
    event.stopPropagation();
  }

  const handleAddTag = (tag: string) => {
    const tags = tagFilter.includes(tag)
      ? tagFilter.filter(t => t !== tag)
      : tagFilter.concat(tag);
    setTagFilter([...tags]);
  }

  const toggleTagMenu = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLDivElement).blur();
    setMenuAnchor(e.currentTarget);
    setShowTagSelection(!isShowTagSelection);
    setShowClearButton(false);
  }

  return (
    <ListItem
      button
      className = {classes.listItem}
      onClick = {e => toggleTagMenu(e)}
      onMouseEnter = {() => tagFilter.length > 0 && setShowClearButton(true)}
      onMouseLeave = {() => setShowClearButton(false)}
      ref = {element => setMenuAnchor(element)}
    >
      <ListItemIcon className={classes.icon}>
        <SvgPath
          path = {SystemIcon.tag}
          style = {{color: tagFilter.length > 0 ? DefaultColors.green : ''}}
        />
      </ListItemIcon>
      <ListItemText
        classes={{primary:classes.listItemText, secondary:classes.listItemSubText}}
        primary = 'Tags'
        secondary = {tagFilter.join(', ')}
      />
      <div  hidden = {!isShowClear}>
        <IconButton
          className = {classes.icon}
          onClick = {e => handleClearTags(e)}
        >
          <SvgPath path = {SystemIcon.clear} />
        </IconButton>
      </div>
      <Menu
        open = {isShowTagSelection}
        PaperProps = {{className: clsx(classes.tagSelector, classes.scrollBar)}}
        anchorEl = {menuAnchor}
        anchorOrigin = {{vertical: 'center', horizontal: 'center'}}
        getContentAnchorEl = {null}
        onClose = {() => setShowTagSelection(false)}
      >
        {tags.map(tag =>
          <MenuItem onClick = {() => handleAddTag(tag)} key = {tag} value = {tag}>
            <Checkbox checked = {tagFilter.includes(tag)} />
            {tag}
          </MenuItem>
        )}
      </Menu>
    </ListItem>
  )
}

export default withStyles(groupListStyles, { withTheme: true })(TagSelectListItem);
