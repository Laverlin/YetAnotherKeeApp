import { createMuiTheme, IconButton, ListItem, ListItemIcon, ListItemText, WithStyles, withStyles } from '@material-ui/core';
import { compareAsc, format } from 'date-fns';
import { KdbxGroup, KdbxUuid } from 'kdbxweb';
import * as React from 'react';
import { DefaultKeeIcon, KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { EntryChangedEvent } from '../../entity/KeeEvent';
import { LightTooltip, SvgPath } from '../common';
import {groupListStyles} from "./groupListStyles"

interface IGroupListItemProps extends WithStyles<typeof groupListStyles>{
  group: KdbxGroup
  isSelected: boolean
  nestLevel: number
  contextMenuHandler(groupUuid: KdbxUuid, menuAnchor: Element): void
  isContextMenuDisabled?: boolean
}

interface IGroupListItemState {

}

class GroupListItem extends React.Component<IGroupListItemProps, IGroupListItemState> {
  static contextType = KeeDataContext;
  constructor(props: IGroupListItemProps) {
    super(props);
    this.handleGroupChanged = this.handleGroupChanged.bind(this);
    this.state = {
    }
  }

  componentDidMount() {
    (this.context as KeeData).addEventListener(EntryChangedEvent, this.props.group.uuid, this.handleGroupChanged);
  }

  componentWillUnmount() {
    (this.context as KeeData).removeEventListener(EntryChangedEvent, this.props.group.uuid, this.handleGroupChanged);
  }

  handleGroupChanged(_: EntryChangedEvent) {
    this.forceUpdate();
  }

  handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.blur();
    const entryId = event.dataTransfer.getData('text');
    event.dataTransfer.clearData();
    (this.context as KeeData).moveEntryOrGroup(this.props.group, new KdbxUuid(entryId));
  }

  get menuButtonId() {
    return 'btniId' + this.props.group.uuid.id;
  }

  public render() {
    const {classes, group, isSelected, nestLevel} = this.props;
    const theme = createMuiTheme();
    const closeExpired = group.entries
      .filter(e => e.times.expires)
      .map(e => e.times.expiryTime || 0)
      .sort(compareAsc)[0];

    return (
        <LightTooltip title = {group.notes ? <> {group.notes} </> : ''} >
          <ListItem
            button
            draggable
            onDragStart = {(e) => {
              e.dataTransfer.setData('text', group.uuid.id);
            }}
            onDragOver = {(e) => {
              e.preventDefault();
              e.currentTarget.focus();
            }}
            onDragLeave = {(e) => {
              e.preventDefault();
              e.currentTarget.blur();
            }}
            onDrop = {e => this.handleDrop(e)}
            selected = {isSelected}
            className = {classes.listItem}
            style = {{paddingLeft: theme.spacing(1) + theme.spacing(4 * nestLevel)}}
            onClick = {() => (this.context as KeeData).setSelectedGroup(group.uuid)}
          >

            <ListItemIcon className = {classes.icon}>
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
            {!(this.props.isContextMenuDisabled) &&
              <div className = {classes.menuButtonDiv}>
                <IconButton
                  id = {this.menuButtonId}
                  onClick = {() => this.props.contextMenuHandler(
                    group.uuid,
                    (document.getElementById(this.menuButtonId) as Element))
                  }
                  className = {classes.icon}
                >
                  <SvgPath path = {SystemIcon.dot_hamburger} />
                </IconButton>
              </div>
            }

          </ListItem>
        </LightTooltip>

    );
  }
}

export default withStyles(groupListStyles, { withTheme: true })(GroupListItem)
