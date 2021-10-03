import { IconButton, ListItem, ListItemIcon, ListItemText, withStyles, WithStyles } from "@material-ui/core";
import { format } from 'date-fns';
import { KdbxUuid } from "kdbxweb";
import React, { FC } from "react";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil'
import { appTheme } from "../../appTheme";
import { DefaultKeeIcon, SystemIcon } from "../../entity";
import { KdbxItemWrapper } from "../../entity/model/KdbxItemWrapper";
import { KeeFileManager } from "../../entity/model/KeeFileManager";
import { selectedGroupSelector, groupStatiscicAtom, editSelectedItem, keeStateAtom } from "../../entity/state/Atom";
import { groupContextMenuAtom, openItemContextMenu } from "../../entity/state/PanelStateAtoms";
import { LightTooltip, SvgPath } from "../common";
import { groupListStyles } from "./groupListStyles";


interface IProps extends WithStyles<typeof groupListStyles>{
  entry: KdbxItemWrapper
  nestLevel: number
  isContextMenuDisabled?: boolean
}

const GroupEntry: FC<IProps> = ({classes, entry, nestLevel, isContextMenuDisabled}) => {

  const groupStat = useRecoilValue(groupStatiscicAtom(entry.uuid.id));
  const setSelection = useSetRecoilState(selectedGroupSelector);
  const setContextMenu = useSetRecoilState(groupContextMenuAtom);
  const setEntryState = useSetRecoilState(editSelectedItem);
  const getDropped = useRecoilCallback(({snapshot}) => (uuid: string) =>{
    return snapshot.getLoadable(keeStateAtom).valueMaybe()?.find(i => i.uuid.equals(uuid))
  })

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    const entryId = event.dataTransfer.getData('text');
    event.dataTransfer.clearData();
    const droppedItem = getDropped(entryId);
    if (droppedItem)
      setEntryState(KeeFileManager.moveItem(droppedItem, entry));
  }

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
    return (
      <>
        <SvgPath path = {SystemIcon.save} className = {classes.smallIcon} />
        {format(groupStat.lastChanged, 'dd MMM yyyy')}
      </>
    )
  }


  console.log(`${entry.title} being refreshed: ${entry.groupSortOrder}`);

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
        onClick = {() => setSelection(entry)}
      >

          <ListItemIcon className = {classes.icon}>
            <SvgPath path = {entry.isAllItemsGroup ? SystemIcon.allItems : DefaultKeeIcon.get(entry.defaultIconId)} />
          </ListItemIcon>

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

export default withStyles(groupListStyles, { withTheme: true })(React.memo(GroupEntry))

