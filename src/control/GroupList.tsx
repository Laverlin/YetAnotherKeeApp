import React from "react";
import {Component} from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import {KdbxEntry, KdbxGroup, KdbxUuid } from "kdbxweb";
import { createMuiTheme, createStyles, Theme, Tooltip, withStyles, WithStyles } from "@material-ui/core";
import { DefaultKeeIcon, SystemIcon } from "../entity/GlobalObject";
import KeeData from "../entity/KeeData";
import { KeeDataContext } from "../entity/Context";
import { SvgPath } from "./helper/SvgPath";

const styles = (theme: Theme) =>  createStyles({
  listItemText:{
    fontSize: theme.typography.fontSize + 5,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    color: theme.palette.background.default
  },

  listItemSubText:{
    fontSize:theme.typography.caption.fontSize,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    color: theme.palette.grey.A100
  },

  listItem:{
    height: theme.spacing(7),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    "&:hover": {
      backgroundColor: 'rgba(170, 170, 170, 0.2)'
    },
    "&.Mui-selected": {
      backgroundColor:'#4481C2',
      "&:hover": {
        backgroundColor: '#4481C2'
      },
    }
  },

  icon:{
    color: theme.palette.grey.A100,
    justifyContent:'center'
  },

  optionList:{
    overflow: 'hidden',
    position: 'absolute',
    paddingTop: theme.spacing(1),
    top:0,
    left:0,
    right:0,
    height: theme.spacing(8),
    borderBottomWidth:'1px',
    borderBottomColor: theme.palette.grey.A100,
    borderBottomStyle: 'solid',
  },

  mainList:{
    overflow: 'hidden',
    position: 'absolute',
    "overflow-y": 'overlay',
    paddingTop: theme.spacing(1),
    bottom: theme.spacing(9),
    top: theme.spacing(9),
    left: 0,
    right: 0,
    "&::-webkit-scrollbar" : {
      width: '10px',
    },
    "&::-webkit-scrollbar-track": {
      background: 'transparent',
    },
    "&::-webkit-scrollbar-thumb": {
      background: 'transparent',
      borderRadius: '10px',
      backgroundClip: 'padding-box',
      borderRight: '2px transparent solid',
      borderLeft: '2px transparent solid'
    },
    "&:hover": {
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: 'rgba(210, 210, 210, 0.5)'
      }
    }
  },

  rbList:{
    overflow: 'hidden',
    position: 'absolute',
    paddingTop: theme.spacing(1),
    bottom: 0,
    height: theme.spacing(8),
    right: 0,
    left: 0,
    borderTopWidth:'1px',
    borderTopColor: theme.palette.grey.A100,
    borderTopStyle: 'solid',
  }
});

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(12),
  },
}))(Tooltip);

interface Props extends WithStyles<typeof styles> {}

class GroupList extends Component<Props> {

  state = {
    groups: [] as KdbxGroup[],
    recycleUuid: {} as KdbxUuid,
    selectedIndex: '' as string
  }
  static contextType = KeeDataContext;

  componentDidMount() {
      const keeData = (this.context as KeeData);
      const defaultGroup: KdbxGroup = keeData.database.getDefaultGroup();
      this.setState({
        groups: [defaultGroup],
        recycleUuid: keeData.recycleBinUuid
      });
      console.log(defaultGroup);
  }

  handleClick(selectedGroup: KdbxGroup | null) {
    const keeData = (this.context as KeeData);
    keeData.notifyGroupSubscribers(
      selectedGroup
        ? selectedGroup.entries
        : Array.from<KdbxEntry>((keeData.database.getDefaultGroup().allEntries()))
    );
    this.setState({selectedIndex: selectedGroup ? selectedGroup.uuid.id : "all"})
  }

  render()
  {
    const { classes }  = this.props;
    let recycleBin = this.state.groups[0]
      ?.groups?.filter(g => g.uuid.id.localeCompare(this.state.recycleUuid.id) === 0)[0];

    return(
      <>
        <div className={classes.optionList}>
          <List disablePadding>
            <ListItem button
              className={classes.listItem}
              onClick={ () => this.handleClick(null) }
              selected = {this.state.selectedIndex === "all" }
            >
              <ListItemIcon className={classes.icon}>
                <SvgPath path = {SystemIcon.allItems} />
              </ListItemIcon>
              <ListItemText
                classes={{primary:classes.listItemText, secondary:classes.listItemSubText}}>
                All Items
              </ListItemText>
            </ListItem>
          </List>
        </div>

        <div className={classes.mainList} style={ recycleBin ? {} : {bottom: 0} }>
          {this.renderList(this.state.groups)}
        </div>

        { recycleBin &&
          <div className={classes.rbList}>
            <List disablePadding>
              <div key = {recycleBin.uuid.id}>
                {this.renderListItem(recycleBin, 1)}
              </div>
            </List>
          </div>
        }

      </>
    );
  }

  renderList(groups: KdbxGroup[], nestLevel: number = 0)
  {
    return(
      <List disablePadding>
        {groups.filter(g => g.uuid.id !== this.state.recycleUuid.id).map(group => (
          <div key = {group.uuid.id} >
            {this.renderListItem(group, nestLevel)}
            {group.groups.length > 0 && this.renderList(group.groups, nestLevel + 1)}
          </div>
        ))}
      </List>
    );
  }

  renderListItem(group: KdbxGroup, nestLevel: number = 0){
    const { classes }  = this.props;
    const theme = createMuiTheme();
    return(
      <LightTooltip
        title={ group.notes ? <React.Fragment> {group.notes} </React.Fragment> : "" }
      >
        <ListItem button
          selected = {this.state.selectedIndex === group.uuid.id }
          className={classes.listItem}
          style={{paddingLeft: theme.spacing(1) + theme.spacing(4 * nestLevel)}}
          onClick={ () => this.handleClick(group) }>
          <ListItemIcon style={{ justifyContent:'center' }} className={classes.icon}>
            <SvgPath path = { DefaultKeeIcon.get(group.icon ?? 0) } />
          </ListItemIcon>
          <ListItemText
            classes={{primary:classes.listItemText, secondary:classes.listItemSubText}}
            primary = {group.name}
            secondary={group.times.lastModTime?.toDateString()} />
        </ListItem>
      </LightTooltip>
    )
  }
}

export default withStyles(styles, { withTheme: true })(GroupList);
