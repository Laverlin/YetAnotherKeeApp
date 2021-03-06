import clsx from "clsx";
import React, { FC } from "react";
import {useRecoilValue} from 'recoil';
import { createStyles, Theme, Typography,  withStyles, WithStyles} from "@material-ui/core";
import { scrollBar } from "../common";
import { filteredEntriesSelector } from "../../entity";
import EntryItem from "./EntryListItem";
import { EntryContextMenu } from "./EntryContextMenu";

const styles = (theme: Theme) =>  createStyles({
  list: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    paddingTop: theme.spacing(2),
  },

  scrollBar: scrollBar,

  emptySplash: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(7),
    color: theme.palette.action.disabled
  }
});

interface IProps extends WithStyles<typeof styles> {}

const EntryListPanel: FC<IProps> = ({classes}) => {

  const filteredEntries = useRecoilValue(filteredEntriesSelector);

  if (filteredEntries.length === 0) {
    return (
      <Typography variant='h2' className = {classes.emptySplash}>
        No Items <br />
        Select another group or change filter criteria
      </Typography>
    )
  }

  return (
    <>
      <div className = {clsx(classes.list, classes.scrollBar)}>
        {filteredEntries
          .map(entryUuid =>
            <EntryItem
              key = {entryUuid.id}
              entryUuid = {entryUuid}
            />
          )
        }
      </div>
      <EntryContextMenu />
    </>
  )
}

export default withStyles(styles, { withTheme: true })(EntryListPanel);
