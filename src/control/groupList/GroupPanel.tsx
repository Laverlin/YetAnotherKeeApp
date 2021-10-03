import { List, withStyles, WithStyles } from "@material-ui/core";
import React, { FC, ReactFragment } from "react";
import { useRecoilValue } from 'recoil'
import { keeStateSelector } from "../../entity/state/Atom";
import GroupEntry from './GroupEntry'
import clsx from 'clsx'
import { groupListStyles } from "./groupListStyles";
import { ColorSelectListItem, TagSelectListItem } from ".";
import { KdbxItemWrapper } from "../../entity/model/KdbxItemWrapper";
import { GroupContextMenu } from "./GroupContextMenu";

interface IProps extends WithStyles<typeof groupListStyles>{}

const GroupPanel: FC<IProps> = ({classes}) => {

  const entries = useRecoilValue(keeStateSelector);

  if (entries.length === 0)
    history.back();

  const defaultGroup = entries.find(e => e.isDefaultGroup);
  if (!defaultGroup)
    throw new Error('Fatal: cannot find Default Group');

  const allEntriesGroup = entries.find(e => e.isAllItemsGroup);
  if (!allEntriesGroup)
    throw new Error('Fatal: cannot find the All Items group');

  const recycleBinGroup = entries.find(e => e.isRecycleBin);

  const renderChildGroups = (group: KdbxItemWrapper, nestLevel: number = 0): ReactFragment => {
    return(
      <div key = {group.uuid.id}>
        <GroupEntry
          entry = {group}
          nestLevel = {nestLevel}
        />
        {entries
          .filter(e => e.isGroup && e.parentUuid && e.parentUuid.equals(group.uuid) && !e.isRecycleBin)
          .sort((a, b) => a.groupSortOrder - b.groupSortOrder)
          .map(childGroup => (
            renderChildGroups(childGroup, nestLevel + 1)
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
            entry = {allEntriesGroup}
            nestLevel = {0}
            isContextMenuDisabled = {true}
          />
          <ColorSelectListItem />
          <TagSelectListItem />
        </List>
      </div>

      <div
        className = {clsx(classes.scrollBar, classes.mainList)}
        style = { recycleBinGroup ? {} : {bottom: 0}}
      >
        {renderChildGroups(defaultGroup)}
      </div>

      { recycleBinGroup &&
        <div className = {classes.rbList}>
            <GroupEntry
              entry = {recycleBinGroup}
              nestLevel = {1}
              isContextMenuDisabled
            />
        </div>
      }
    </>
  )
}

export default withStyles(groupListStyles, { withTheme: true })(GroupPanel)

