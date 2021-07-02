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
import KeeData from "../../entity/KeeData";
import { KeeDataContext } from "../../entity/Context";
import { DefaultColors, SystemIcon } from "../../entity/GlobalObject";
import {groupListStyles} from "./groupListStyles"
import { SvgPath } from "../common/SvgPath";

interface Props extends WithStyles<typeof groupListStyles> {}

class ColorSelectListItem extends React.Component<Props> {

  static contextType = KeeDataContext;
  get keeData() { return this.context as KeeData; }

  state = {
    colors: [DefaultColors.yellow, DefaultColors.green, DefaultColors.red, DefaultColors.orange, DefaultColors.blue, DefaultColors.purple],
    selectedColor: '',
    isShowColorSelection: false,
  }

  handleColorSelect(selectedColor: string) {
    this.setState({selectedColor: selectedColor});
    this.keeData.notifyColorFilterSubscribers(selectedColor);
  }

  render()
  {
    const { classes }  = this.props;
    const { colors, selectedColor, isShowColorSelection } = this.state;

    return (
      <ListItem
      className={classes.listItem}
      onMouseEnter = {() => this.setState({isShowColorSelection: true})}
      onMouseLeave = {() => this.setState({isShowColorSelection: false})}
    >
      <ListItemIcon className = {classes.icon}>
        <SvgPath path = {SystemIcon.colorFilled} style = {{color: selectedColor}} />
      </ListItemIcon>
      <ListItemText
        classes = {{primary:classes.listItemText, secondary:classes.listItemSubText}}
        hidden = {isShowColorSelection}
      >
        Colors
      </ListItemText>

      <div className = {classes.colorSelector} hidden = {!isShowColorSelection} >
        <IconButton
          style= {{color: selectedColor }}
          className = {clsx(classes.icon, classes.colorIcon)}
          onClick = {() => this.handleColorSelect('')}
        >
          <SvgPath path = {SystemIcon.colorFilled} />
        </IconButton>
        {colors.map(color =>
          <IconButton
            key = {color}
            className = {classes.colorIcon}
            onClick = {() => this.handleColorSelect(color)}
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


