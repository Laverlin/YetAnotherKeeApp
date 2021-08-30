import React from "react";
import clsx from "clsx";
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles,
  WithStyles
} from "@material-ui/core";

import {KeeData, KeeDataContext, DefaultColors, SystemIcon } from "../../entity";
import {groupListStyles} from "./groupListStyles"
import {SvgPath} from "../common";

interface Props extends WithStyles<typeof groupListStyles> {}

class ColorSelectListItem extends React.Component<Props> {

  static contextType = KeeDataContext;
  get keeData() { return this.context as KeeData; }

  state = {
    colors: [
      DefaultColors.yellow,
      DefaultColors.green,
      DefaultColors.red,
      DefaultColors.orange,
      DefaultColors.blue,
      DefaultColors.purple
    ],
    isShowColorSelection: false,
  }

  handleSetColor(color: string) {
    this.keeData.entryFilter.colorFilter = color;
    this.forceUpdate();
  }

  render()
  {
    const { classes }  = this.props;
    const { colors, isShowColorSelection } = this.state;
    const { entryFilter } = this.keeData;

    return (
      <ListItem
      className={classes.listItem}
      onMouseEnter = {() => this.setState({isShowColorSelection: true})}
      onMouseLeave = {() => this.setState({isShowColorSelection: false})}
    >
      <ListItemIcon className = {classes.icon}>
        <SvgPath path = {SystemIcon.colorFilled} style = {{color: entryFilter.colorFilter}} />
      </ListItemIcon>
      <ListItemText
        classes = {{primary:classes.listItemText, secondary:classes.listItemSubText}}
        hidden = {isShowColorSelection}
      >
        Colors
      </ListItemText>

      <div className = {classes.colorSelector} hidden = {!isShowColorSelection} >
        <IconButton
          style= {{color: entryFilter.colorFilter }}
          className = {clsx(classes.icon, classes.colorIcon)}
          onClick = {() => this.handleSetColor('')}
        >
          <SvgPath path = {SystemIcon.colorFilled} />
        </IconButton>
        {colors.map(color =>
          <IconButton
            key = {color}
            className = {classes.colorIcon}
            onClick = {() => this.handleSetColor(color)}
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
}

export default withStyles(groupListStyles, { withTheme: true })(ColorSelectListItem);

