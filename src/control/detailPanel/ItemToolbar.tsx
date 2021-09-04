import { createStyles, IconButton, Theme, Tooltip, Typography, withStyles, WithStyles } from '@material-ui/core';
import { KdbxEntry, KdbxGroup } from 'kdbxweb';
import * as React from 'react';
import { KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { SvgPath } from '../common';


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

interface IItemToolbarProps extends WithStyles<typeof styles> {
  currentEntry: KdbxEntry | KdbxGroup,
  onSetHistory: (isInHistory: boolean, historyIndex: number) => void,
  totalVersions: number,
  historyIndex: number
}


class ItemToolbar extends React.Component<IItemToolbarProps> {
  static contextType = KeeDataContext;
  constructor(props : IItemToolbarProps) {
    super(props);
    this.handleIndexChanged = this.handleIndexChanged.bind(this);
    this.handleDeleteVersion = this.handleDeleteVersion.bind(this);
  }


  handleIndexChanged(newIndex: number) {
    if (this.props.currentEntry instanceof KdbxGroup ||
      newIndex < 0 ||
      newIndex > this.props.currentEntry.history.length
    )
      return;

    const actualVersion = this.props.currentEntry.history.length;
    this.props.onSetHistory(newIndex !== actualVersion, newIndex);
    this.setState({historyIndex: newIndex});
  }

  handleDeleteVersion(index: number) {
    if (this.props.currentEntry instanceof KdbxGroup)
      return;

    if (index === this.props.totalVersions - 1)
      this.props.onSetHistory(false, index);
    (this.context as KeeData).removeHistoryEntry(index);
  }

  public render() {
    const { classes, currentEntry, historyIndex, totalVersions }  = this.props;
    const isEnableHistory = (currentEntry instanceof KdbxEntry)
    const isLast = totalVersions === historyIndex;
    const isFirst = historyIndex === 0;

    const modifiedTime = new Date(
      (currentEntry instanceof KdbxEntry && !isLast)
        ? currentEntry.history[historyIndex].lastModTime
        : currentEntry.lastModTime
    ).toDateString();

    return (
      <div className={classes.itemBottom}>

        <IconButton
          aria-label="History back"
          disabled = {!isEnableHistory || isFirst}
          onClick = {() => this.handleIndexChanged(historyIndex - 1)}
        >
          <SvgPath className={classes.bottomIcon} path = {SystemIcon.cone_left}/>
        </IconButton>


        <div className = {classes.versionContent}>
          <div><Typography variant='body1'>version: {historyIndex}</Typography></div>
          <div><Typography variant='caption'>{modifiedTime}</Typography></div>
        </div>

        <IconButton
          aria-label = "History forward"
          disabled = {!isEnableHistory || isLast}
          onClick = {() => this.handleIndexChanged(historyIndex + 1)}
        >
          <SvgPath className={classes.bottomIcon} path = {SystemIcon.cone_right}/>
        </IconButton>


        <Tooltip title = 'Remove this version from history'>
          <span className = {classes.pushRight}>
            <IconButton
              aria-label = "Remove Version"
              disabled = {!isEnableHistory || isLast}
              onClick = {() => this.handleDeleteVersion(historyIndex)}
            >
              <SvgPath className={classes.bottomIcon} path = {SystemIcon.delete}/>
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ItemToolbar);
