import React from "react";
import clsx from "clsx";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles,
  WithStyles
} from "@material-ui/core";

import {KdbxEntry, KdbxGroup} from "kdbxweb";
import {KeeData, KeeDataContext, DefaultKeeIcon, SystemIcon } from "../../entity";
import {SvgPath} from "../common";
import {ColorSelectListItem, TagSelectListItem} from '.'
import {groupListStyles} from "./groupListStyles"
import {formatDistance} from "date-fns";
import GroupListItem from "./GroupListItem";
import GroupContextMenu from "./GroupContextMenu";
import { GroupSelectedEvent } from "../../entity/KeeEvent";

interface IGroupListProps extends WithStyles<typeof groupListStyles> {}

class GroupListPanel extends React.Component<IGroupListProps> {
  state = {
    groups: [] as KdbxGroup[],
    lastUpdate: 0,
    totalEntries: 0,
    isContextMenuHidden: true,
    onMenuOpen: () => {throw 'menu handler should be implemented'}
  }

  constructor(props:IGroupListProps) {
    super(props);
    this.handleSelectGroup = this.handleSelectGroup.bind(this);
  }

  static contextType = KeeDataContext;
  get keeData() { return this.context as KeeData; }

  componentDidMount() {
      const defaultGroup: KdbxGroup = this.keeData.database.getDefaultGroup();
      this.setState({
        groups: [defaultGroup],
        lastUpdate: Math.max( ...Array.from(defaultGroup.allEntries()).map(e=>e.times.lastModTime!.valueOf())),
        totalEntries: Array.from<KdbxEntry>(defaultGroup.allEntries()).length
      });
      this.keeData.addEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleSelectGroup);
  }

  componentWillUnmount() {
    this.keeData.removeEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleSelectGroup);
  }

  handleSelectGroup(_: GroupSelectedEvent) {
    this.forceUpdate();
  }

  render()
  {
    const {classes}  = this.props;
    const {isRecycleBinAvailable, recycleBinGroup, selectedGroupUuid: selectedGroupId } = (this.context as KeeData)

    return(
      <>
        <GroupContextMenu
          openMenuHandler = {menuOpenHandler => {this.setState({onMenuOpen: menuOpenHandler})}}
        />
        <div className={classes.optionList}>
          <List disablePadding>
            <ListItem button
              className = {classes.listItem}
              onClick = {() => this.keeData.setSelectedGroup(KeeData.allGroupUuid)}
              selected = {selectedGroupId === KeeData.allGroupUuid}
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
          style = {isRecycleBinAvailable ? {} : {bottom: 0}}
        >
          {this.renderList(this.state.groups)}
        </div>

        { isRecycleBinAvailable &&
          <div className={classes.rbList}>
            <List disablePadding>
              <div key = {recycleBinGroup.uuid.id}>
                <GroupListItem
                  group = {recycleBinGroup}
                  isSelected = {selectedGroupId === recycleBinGroup.uuid}
                  nestLevel = {1}
                  contextMenuHandler = {() => {}}
                  isContextMenuDisabled
                />
              </div>
            </List>
          </div>
        }
      </>
    );
  }

  renderList(groups: KdbxGroup[], nestLevel: number = 0)
  {
    const {recycleBinUuid, selectedGroupUuid: selectedGroupId } = (this.context as KeeData)
    return(
      <List disablePadding>
        {groups.filter(g => !g.uuid.equals(recycleBinUuid)).map(group => (
          <div key = {group.uuid.id} >
            <GroupListItem
              group = {group}
              isSelected = {selectedGroupId === group.uuid}
              nestLevel = {nestLevel}
              contextMenuHandler = {this.state.onMenuOpen}
            />
            {group.groups.length > 0 && this.renderList(group.groups, nestLevel + 1)}
          </div>
        ))}
      </List>
    );
  }
}

export default withStyles(groupListStyles, { withTheme: true })(GroupListPanel)

