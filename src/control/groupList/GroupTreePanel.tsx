import { List, withStyles, WithStyles } from "@material-ui/core";
import React, { FC, ReactFragment } from "react";
import { useRecoilValue } from 'recoil'
import GroupEntry from './GroupListItem'
import clsx from 'clsx'
import { groupListStyles } from "./groupListStyles";
import { ColorSelectListItem, TagSelectListItem } from ".";
import { GroupContextMenu } from "./GroupContextMenu";
import { currentContext, GlobalContext, itemIdsAtom, KdbxItemState } from "../../entity";
import { KdbxUuid } from "kdbxweb";

interface IProps extends WithStyles<typeof groupListStyles>{}

const GroupTreePanel: FC<IProps> = ({classes}) => {

  const items = useRecoilValue(itemIdsAtom);

  if (items.length === 0)
    history.back();

  const renderChildGroups = (groupUuid: KdbxUuid, nestLevel: number = 0): ReactFragment => {
    return(
      <div key = {groupUuid.id}>
        <GroupEntry
          entryUuid = {groupUuid}
          nestLevel = {nestLevel}
        />
        {items
          .map(uuid => new KdbxItemState(uuid))
          .filter(e => e.isGroup && e.parentUuid && e.parentUuid.equals(groupUuid) && !e.isRecycleBin)
          .sort((a, b) => a.groupSortOrder - b.groupSortOrder)
          .map(childGroup => (
            renderChildGroups(childGroup.uuid, nestLevel + 1)
        ))}
      </div>
    );
  }

  return(
    <>
      <GroupContextMenu />
      <div className = {classes.optionList}>
        <List disablePadding>
          <GroupEntry
            entryUuid = {GlobalContext.allItemsGroupUuid}
            nestLevel = {0}
            isContextMenuDisabled = {true}
          />
          <ColorSelectListItem />
          <TagSelectListItem />
        </List>
      </div>

      <div
        className = {clsx(classes.scrollBar, classes.mainList)}
        style = { currentContext().isRecycleBinAvailable ? {} : {bottom: 0}}
      >
        {renderChildGroups(currentContext().defaultGroupUuid)}
      </div>

      { currentContext().isRecycleBinAvailable &&
        <div className = {classes.rbList}>
            <GroupEntry
              entryUuid = {currentContext().recycleBinUuid!}
              nestLevel = {1}
              isContextMenuDisabled
            />
        </div>
      }
    </>
  )
}

export default withStyles(groupListStyles, { withTheme: true })(GroupTreePanel)

