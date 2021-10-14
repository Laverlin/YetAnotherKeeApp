import { IconButton, ListItem, ListItemIcon, ListItemText, withStyles, WithStyles } from "@material-ui/core";
import { format } from 'date-fns';
import { KdbxUuid } from "kdbxweb";
import React, { FC } from "react";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil'
import { appTheme } from "../../appTheme";
import {
  DefaultKeeIcon,
  groupContextMenuAtom,
  groupStatSelector,
  itemStateAtom,
  openItemContextMenu,
  selectItemSelector,
  SystemIcon,
  itemIdsUpdateSelector,
} from "../../entity";
import { LightTooltip, SvgPath } from "../common";
import { groupListStyles } from "./groupListStyles";


interface IProps extends WithStyles<typeof groupListStyles>{
  entryUuid: KdbxUuid
  nestLevel: number
  isContextMenuDisabled?: boolean
}

const GroupListItem: FC<IProps> = ({classes, entryUuid, nestLevel, isContextMenuDisabled}) => {

  const entry = useRecoilValue(itemStateAtom(entryUuid.id));
  const setSelection = useSetRecoilState(selectItemSelector);
  const setContextMenu = useSetRecoilState(groupContextMenuAtom);
  const setTreeState = useSetRecoilState(itemIdsUpdateSelector);
  const getDropped = useRecoilCallback(({snapshot}) => (uuid: string) => {
    return snapshot.getLoadable(itemStateAtom(uuid)).valueMaybe()
  })

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    const entryId = event.dataTransfer.getData('text');
    event.dataTransfer.clearData();
    const droppedItem = getDropped(entryId);
    setTreeState(droppedItem?.moveItem(entryUuid));
  }

  const groupStat = useRecoilValue(groupStatSelector(entryUuid.id));

  const showTotalEntries = () => {
    return (
      <>
        <SvgPath path = {DefaultKeeIcon.key} className = {classes.smallIcon} />
        {groupStat.totalEntries}
      </>
    )
  }

  const showCloseEpire = () => {
    if (!groupStat.closeExpired)
      return;
    return (
      <>
        <SvgPath path = {SystemIcon.expire} className = {classes.smallIcon} />
        {format(groupStat.closeExpired, 'dd MMM yyyy')}
      </>
    )
  }

  const showLastModified = () => {
    if (!groupStat.lastChanged)
      return;
    return (
      <>
        <SvgPath path = {SystemIcon.save} className = {classes.smallIcon} />
        {format(groupStat.lastChanged, 'dd MMM yyyy')}
      </>
    )
  }

  return (
    <LightTooltip title = { entry.getFieldUnprotected('Notes') }>
      <ListItem
        button
        onDragOver = {e => {
          e.preventDefault();
          e.currentTarget.focus();
        }}
        onDragLeave = {e => {
          e.preventDefault();
          e.currentTarget.blur();
        }}
        onMouseLeave = {e => {
          e.preventDefault();
          e.currentTarget.blur();
        }}
        selected = {entry.isSelected}
        className = {classes.listItem}
        style = {{paddingLeft: appTheme.spacing(1) + appTheme.spacing(4 * nestLevel)}}
        onClick = {() => setSelection(entry.uuid)}
      >
        <ListItemIcon className = {classes.icon}>
          <SvgPath path = {entry.isAllItemsGroup ? SystemIcon.allItems : DefaultKeeIcon.get(entry.defaultIconId)} />
        </ListItemIcon>

        {entry.isChanged && <div className = {classes.changeMark} />}
        <ListItemText
          draggable = {!entry.isDefaultGroup && !entry.isRecycleBin}
          onDragStart = {e => {
            e.dataTransfer.setData('text', entry.uuid.id);
            e.stopPropagation()
          }}
          onDrop = {handleDrop}
          classes = {{primary: classes.listItemText, secondary: classes.listItemSubText}}
          primary = {entry.title}
          secondary = {
            <>
              {groupStat.totalEntries > 0 &&
                <>
                  {showTotalEntries()}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {entry.isAllItemsGroup ? showLastModified() : showCloseEpire()}
                </>
              }
            </>
          }
        />
        {!isContextMenuDisabled &&
          <div className = {classes.menuButtonDiv}>
            <IconButton
              onClick = {e => setContextMenu(openItemContextMenu(e.currentTarget, entry))}
              className = {classes.icon}
            >
              <SvgPath path = {SystemIcon.dot_hamburger} />
            </IconButton>
          </div>
        }
      </ListItem>
    </LightTooltip>
  )
}

export default withStyles(groupListStyles, { withTheme: true })(React.memo(GroupListItem))

