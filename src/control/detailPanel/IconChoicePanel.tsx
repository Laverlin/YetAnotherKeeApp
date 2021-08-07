import fs from 'fs';
import * as React from 'react';
import { createStyles, GridList, GridListTile, IconButton, ListSubheader, Popover, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import { DefaultKeeIcon, KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { SvgPath, scrollBar } from '../common';
import clsx from 'clsx';
import { KdbxCustomIcon, KdbxEntry, KdbxGroup, KdbxUuid } from 'kdbxweb';
import { remote } from 'electron';

const styles = (theme: Theme) =>  createStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1)
  },

  gridList: {
    width: 500,
    height: 450,
  },

  customIcon: {
    width: 24,
    height: 24
  },

  gridTitleHeader: {
    height: '20px',
    paddingTop: theme.spacing(1)
  },

  scrollBar: scrollBar,
});

interface IIconChoicePanelProps  extends WithStyles<typeof styles> {
  panelAncor: Element;
  isPanelOpen: boolean;
  handlePanelClose: {(): void};
  currentEntry: KdbxEntry | KdbxGroup
}

class IconChoicePanel extends React.Component<IIconChoicePanelProps> {
  static contextType = KeeDataContext;
  constructor(props: IIconChoicePanelProps) {
    super(props);
  }

  handleSetDefaultIcon(iconKey: string) {
    const iconId = Object.keys(DefaultKeeIcon).findIndex(key => key === iconKey);
    this.props.currentEntry.customIcon = undefined;
    this.props.currentEntry.icon = iconId;
    (this.context as KeeData).notifyDbUpdateSubscribers(true);
    this.props.handlePanelClose();
  }

  handleSetCustomIcon(uuid: string) {
    this.props.currentEntry.customIcon = new KdbxUuid(uuid);
    (this.context as KeeData).notifyDbUpdateSubscribers(true);
    this.props.handlePanelClose();
  }

  handleAddCustomIcon() {
    const files = remote.dialog.showOpenDialogSync({properties: ['openFile']});
    if (!files) {
      return;
    }
    const data = fs.readFileSync(files[0]);
    let icon: KdbxCustomIcon = {data: new Uint8Array(data).buffer}
    const uuid = KdbxUuid.random();
    (this.context as KeeData).database.meta.customIcons.set(uuid.id, icon);

    this.forceUpdate();
  }

  public render() {

    const { classes, panelAncor, isPanelOpen } = this.props;

    return (
      <Popover
        open = {isPanelOpen}
        anchorEl = {panelAncor}
        anchorOrigin = {{vertical: 'bottom', horizontal: 'center'}}
        transformOrigin = {{vertical: 'top', horizontal: 'center'}}
        onClose = {() => this.props.handlePanelClose()}
      >
        <div className = {classes.root}>
          <GridList cellHeight = {50} className = {clsx(classes.gridList, classes.scrollBar)} cols = {9}>
            <GridListTile key="defaultSubheader" cols = {9} style = {{ height: 'auto' }} className = {classes.gridTitleHeader}>
              <ListSubheader component="div"><Typography variant='h5'>Default Icons</Typography></ListSubheader>
            </GridListTile>
            {Object.keys(DefaultKeeIcon).map(i =>
              <GridListTile key = {i}>
                <IconButton size='medium' onClick = {() => this.handleSetDefaultIcon(i)}>
                  <SvgPath path = {Reflect.get(DefaultKeeIcon, i)} />
                </IconButton>
              </GridListTile>
            )}
            <GridListTile key="customSubheader" cols = {9} style = {{ height: 'auto' }} className = {classes.gridTitleHeader}>
              <ListSubheader component="div">
                <Typography variant='h5'>Custom Icons
                  <IconButton onClick = {() => this.handleAddCustomIcon()} >
                    <SvgPath path = {SystemIcon.add} />
                  </IconButton>
                </Typography>
              </ListSubheader>
            </GridListTile>
            {Array.from((this.context as KeeData).database.meta.customIcons).map(icon =>
              <GridListTile key = {icon[0]}>
                <IconButton size='medium' onClick = {() => this.handleSetCustomIcon(icon[0])}>
                  <img
                    className = {classes.customIcon}
                    src={'data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(icon[1].data)))}/>
                </IconButton>
              </GridListTile>
            )}
          </GridList>
        </div>
      </Popover>
    );
  }
}

export default withStyles(styles, { withTheme: true })(IconChoicePanel);

