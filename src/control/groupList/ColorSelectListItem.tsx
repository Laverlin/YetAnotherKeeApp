import React, { FC, useState } from "react";
import clsx from "clsx";
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles,
  WithStyles
} from "@material-ui/core";
import {colorFilterAtom, DefaultColors, SystemIcon } from "../../entity";
import {groupListStyles} from "./groupListStyles"
import {SvgPath} from "../common";
import { useRecoilState } from "recoil";

interface IProps extends WithStyles<typeof groupListStyles> {}

const ColorSelectListItem: FC<IProps> = ({classes}) => {

  const [colorFilter, setColorFilter] = useRecoilState(colorFilterAtom);
  const [isShowColorSelection, setShowColorSelection] = useState(false);

  const colors = [
    DefaultColors.yellow,
    DefaultColors.green,
    DefaultColors.red,
    DefaultColors.orange,
    DefaultColors.blue,
    DefaultColors.purple
  ];

  return (
    <ListItem
    className={classes.listItem}
    onMouseEnter = {() => setShowColorSelection(true)}
    onMouseLeave = {() => setShowColorSelection(false)}
  >
    <ListItemIcon className = {classes.icon}>
      <SvgPath path = {SystemIcon.colorFilled} style = {{color: colorFilter.color}} />
    </ListItemIcon>
    <ListItemText
      classes = {{primary:classes.listItemText, secondary:classes.listItemSubText}}
      hidden = {isShowColorSelection}
    >
      Colors
    </ListItemText>

    <div className = {classes.colorSelector} hidden = {!isShowColorSelection} >
      <IconButton
        style= {{color: colorFilter.color }}
        className = {clsx(classes.icon, classes.colorIcon)}
        onClick = {() => setColorFilter({color: ''})}
      >
        <SvgPath path = {SystemIcon.colorFilled} />
      </IconButton>
      {colors.map(color =>
        <IconButton
          key = {color}
          className = {classes.colorIcon}
          onClick = {() => setColorFilter({color: color})}
        >
          <SvgPath
            path = {SystemIcon.colorEmpty}
            style = {{color: color}}
          />
        </IconButton>
      )}
    </div>
  </ListItem>
  )
}

export default withStyles(groupListStyles, { withTheme: true })(ColorSelectListItem);

