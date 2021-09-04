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

import {KdbxGroup} from "kdbxweb";
import {KeeData, KeeDataContext, DefaultKeeIcon, SystemIcon } from "../../entity";
import {SvgPath} from "../common";
import {ColorSelectListItem, TagSelectListItem} from '.'
import {groupListStyles} from "./groupListStyles"
import {formatDistance} from "date-fns";
import GroupListItem from "./GroupListItem";
import GroupContextMenu from "./GroupContextMenu";
import { DatabaseSavedEvent, GroupSelectedEvent } from "../../entity/KeeEvent";

interface IGroupListProps extends WithStyles<typeof groupListStyles> {}

class GroupListPanel extends React.Component<IGroupListProps> {
  constructor(props: IGroupListProps) {
    super(props);
    this.handleSelectGroup = this.handleSelectGroup.bind(this);
  }

  state = {
    onMenuOpen: () => {throw 'menu handler should be implemented'}
  }
  static contextType = KeeDataContext;
  get keeData() { return this.context as KeeData; }

  componentDidMount() {
    this.keeData.addEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleSelectGroup);
    this.keeData.addEventListener(DatabaseSavedEvent, KeeData.anyEntryUuid, this.handleSelectGroup);
  }

  componentWillUnmount() {
    this.keeData.removeEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleSelectGroup);
    this.keeData.removeEventListener(DatabaseSavedEvent, KeeData.anyEntryUuid, this.handleSelectGroup);
  }

  handleSelectGroup(_: GroupSelectedEvent | DatabaseSavedEvent) {
    this.forceUpdate();
  }

  render()
  {
    const {classes}  = this.props;
    const {isRecycleBinAvailable, recycleBinUuid, selectedGroupUuid, dbInfo } = (this.context as KeeData)

    return(
      <>
        <GroupContextMenu
          openMenuHandler = {menuOpenHandler => {this.setState({onMenuOpen: menuOpenHandler})}}
        />
        <div className = {classes.optionList}>
          <List disablePadding>
            <ListItem button
              className = {classes.listItem}
              onClick = {() => this.keeData.setSelectedGroup(KeeData.allGroupUuid)}
              selected = {selectedGroupUuid.equals(KeeData.allGroupUuid)}
            >
              <ListItemIcon className = {classes.icon}>
                <SvgPath path = {SystemIcon.allItems} />
              </ListItemIcon>
              <ListItemText
                classes = {{primary: classes.listItemText, secondary: classes.listItemSubText}}
                primary = 'All items'
                secondary = {
                  <>
                    {dbInfo.lastUpdated > 0 &&
                      <>
                        <SvgPath path = {SystemIcon.save} className = {classes.smallIcon} />
                        {formatDistance(new Date(dbInfo.lastUpdated), new Date(), { addSuffix: true })}
                      </>
                    }
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <SvgPath path = {DefaultKeeIcon.key} className = {classes.smallIcon} />
                    {dbInfo.totalEntries}
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
          {this.renderList([this.keeData.defaultGroup])}
        </div>

        { isRecycleBinAvailable &&
          <div className={classes.rbList}>
            <List disablePadding>
              <div key = {recycleBinUuid!.id}>
                <GroupListItem
                  group = {(this.context as KeeData).recycleBinGroup}
                  isSelected = {selectedGroupUuid.equals(recycleBinUuid)}
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

  renderList(groups: KdbxGroup[], nestLevel: number = 0) {
    const {recycleBinUuid, selectedGroupUuid} = (this.context as KeeData)
    return(
      <List disablePadding>
        {groups.filter(g => !g.uuid.equals(recycleBinUuid)).map(group => (
          <div key = {group.uuid.id} >
            <GroupListItem
              group = {group}
              isSelected = {selectedGroupUuid === group.uuid}
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
