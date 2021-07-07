import React from "react";
import clsx from "clsx";
import {
  createMuiTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles,
  WithStyles
} from "@material-ui/core";

import {KdbxEntry, KdbxGroup, KdbxUuid } from "kdbxweb";
import {KeeData, KeeDataContext, DefaultKeeIcon, SystemIcon } from "../../entity";
import {SvgPath, LightTooltip} from "../common";
import {ColorSelectListItem, TagSelectListItem} from '.'
import {groupListStyles} from "./groupListStyles"
import {formatDistance, format, compareAsc} from "date-fns";

interface IGroupListProps extends WithStyles<typeof groupListStyles> {}

class GroupListPanel extends React.Component<IGroupListProps> {
  state = {
    groups: [] as KdbxGroup[],
    recycleUuid: {} as KdbxUuid,
    selectedIndex: KeeData.allGroupId,
    lastUpdate: 0,
    totalEntries: 0
  }

  static contextType = KeeDataContext;
  get keeData() { return this.context as KeeData; }

  componentDidMount() {
      const defaultGroup: KdbxGroup = this.keeData.database.getDefaultGroup();
      this.setState({
        groups: [defaultGroup],
        recycleUuid: this.keeData.recycleBinUuid,
        lastUpdate: Math.max( ...Array.from<KdbxEntry>(defaultGroup.allEntries()).map(e=>e.times.lastModTime!.valueOf())),
        totalEntries: Array.from<KdbxEntry>(defaultGroup.allEntries()).length
      });
      this.handleSelectGroup(null);
  }

  handleSelectGroup(selectedGroup: KdbxGroup | null) {
    this.keeData.notifyGroupSubscribers(
      selectedGroup
        ? selectedGroup.uuid.id
        : KeeData.allGroupId
    );
    this.setState({selectedIndex: selectedGroup ? selectedGroup.uuid.id : KeeData.allGroupId});
  }

  render()
  {
    const {classes}  = this.props;
    const {groups, recycleUuid, selectedIndex} = this.state;
    let recycleBin = groups[0]
      ?.groups?.filter(g => g.uuid.id.localeCompare(recycleUuid.id) === 0)[0];

    return(
      <>
        <div className={classes.optionList}>
          <List disablePadding>
            <ListItem button
              className = {classes.listItem}
              onClick = {() => this.handleSelectGroup(null)}
              selected = {selectedIndex === KeeData.allGroupId}
            >
              <ListItemIcon className = {classes.icon}>
                <SvgPath path = {SystemIcon.allItems} />
              </ListItemIcon>
              <ListItemText
                classes = {{primary: classes.listItemText, secondary: classes.listItemSubText}}
                primary = 'All items'
                secondary = {
                  <>
                  {formatDistance(new Date(this.state.lastUpdate), new Date(), { addSuffix: true })}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <SvgPath path = {DefaultKeeIcon.key} className = {classes.smallIcon}/>
                  {this.state.totalEntries}
                  </>
                }
              />
            </ListItem>
            <ColorSelectListItem />
            <TagSelectListItem />
          </List>
        </div>

        <div
          className = {clsx(classes.scrollBar, classes.mainList)}
          style={recycleBin ? {} : {bottom: 0}}
        >
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
    const closeExpired = group.entries
      .filter(e => e.times.expires)
      .map(e => e.times.expiryTime || 0)
      .sort(compareAsc)[0];
    return(
      <LightTooltip
        title = {group.notes ? <React.Fragment> {group.notes} </React.Fragment> : ''}
      >
        <ListItem
          button
          selected = {this.state.selectedIndex === group.uuid.id}
          className = {classes.listItem}
          style = {{paddingLeft: theme.spacing(1) + theme.spacing(4 * nestLevel)}}
          onClick = {() => this.handleSelectGroup(group)}
        >
          <ListItemIcon style = {{justifyContent:'center'}} className = {classes.icon}>
            <SvgPath path = {DefaultKeeIcon.get(group.icon ?? 0)} />
          </ListItemIcon>

          <ListItemText
            classes = {{primary: classes.listItemText, secondary: classes.listItemSubText}}
            primary = {group.name}
            secondary = {
              <>
                {group.entries.length === 0 ||
                  <>
                    <SvgPath path = {DefaultKeeIcon.key} className = {classes.smallIcon} />
                    {group.entries.length}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {closeExpired
                      ? <SvgPath path = {SystemIcon.expire} className = {classes.smallIcon} />
                      : ''
                    }
                    {closeExpired && format(closeExpired, 'dd MMM yyyy')}
                  </>
                }
              </>
            }
          />
        </ListItem>
      </LightTooltip>
    )
  }
}

export default withStyles(groupListStyles, { withTheme: true })(GroupListPanel)

