import React, { FC, useEffect } from 'react';
import { createStyles, IconButton, Theme, Tooltip, Typography, withStyles, WithStyles } from '@material-ui/core';
import { historyAtom, itemStateAtom, KdbxItemState, SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import { useRecoilState, useSetRecoilState } from 'recoil';

const styles = (theme: Theme) =>  createStyles({

  itemBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display:'flex',
    flexDirection:'row',
    height: theme.spacing(8),
    padding: theme.spacing(1),
    alignItems:'center',
    justifyContent: 'center'
  },

  bottomIcon:{
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: theme.spacing(1/2),
  },

  versionContent: {
    display: 'flex',
    flexDirection: 'column'
  },

  pushRight: {
    marginLeft:'auto'
  }
})

interface IProps extends WithStyles<typeof styles> {
  entry: KdbxItemState
}

const ItemToolbar: FC<IProps> = ({classes, entry}) => {

  const [historyState, setHistoryState] = useRecoilState(historyAtom(entry.uuid.id));
  const setEntryState = useSetRecoilState(itemStateAtom(entry.uuid.id));

  const totalVersions = entry.history.length;
  const isLast = totalVersions === historyState.historyIndex;
  const isFirst = 0 === historyState.historyIndex;

  useEffect(() => {
    setHistoryState({historyIndex: totalVersions, isInHistory: false});
  }, [entry.uuid.id, totalVersions]);

  const handleIndexChanged = (newIndex: number) => {
    if (newIndex < 0 || newIndex > totalVersions)
      return;

    setHistoryState({isInHistory: newIndex != totalVersions, historyIndex: newIndex});
  }

  const handleDeleteVersion = (index: number) => {
    if (index === totalVersions - 1)
      setHistoryState({isInHistory: false, historyIndex: index});
    setEntryState(entry.removeHistoryEntry(index));
  }

  const modifiedTime = new Date(
    !isLast
      ? entry.history[historyState.historyIndex].lastModTime
      : entry.lastModifiedTime
  ).toDateString();

  return (
    <div className={classes.itemBottom}>

      <IconButton
        aria-label="History back"
        disabled = {isFirst}
        onClick = {() => handleIndexChanged(historyState.historyIndex - 1)}
      >
        <SvgPath className={classes.bottomIcon} path = {SystemIcon.cone_left}/>
      </IconButton>


      <div className = {classes.versionContent}>
        <div><Typography variant='body1'>version: {historyState.historyIndex}</Typography></div>
        <div><Typography variant='caption'>{modifiedTime}</Typography></div>
      </div>

      <IconButton
        aria-label = "History forward"
        disabled = {isLast}
        onClick = {() => handleIndexChanged(historyState.historyIndex + 1)}
      >
        <SvgPath className={classes.bottomIcon} path = {SystemIcon.cone_right}/>
      </IconButton>


      <Tooltip title = 'Remove this version from history'>
        <span className = {classes.pushRight}>
          <IconButton
            aria-label = "Remove Version"
            disabled = {isLast}
            onClick = {() => handleDeleteVersion(historyState.historyIndex)}
          >
            <SvgPath className={classes.bottomIcon} path = {SystemIcon.delete}/>
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
}


export default withStyles(styles, { withTheme: true })(ItemToolbar);
