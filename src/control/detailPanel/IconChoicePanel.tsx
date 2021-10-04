import fs from 'fs';
import * as React from 'react';
import { createStyles, GridList, GridListTile, IconButton, ListSubheader, Popover, Theme, Tooltip, Typography, WithStyles, withStyles } from '@material-ui/core';
import { SvgPath, scrollBar } from '../common';
import clsx from 'clsx';
import { KdbxCustomIcon, KdbxUuid } from 'kdbxweb';
import { remote } from 'electron';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DefaultKeeIcon, SystemIcon, closePanel, iconChoisePanelAtom, KdbxItemState, itemStateAtom, currentContext  } from '../../entity';
import { useReducer } from 'react';

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

interface IProps  extends WithStyles<typeof styles> {
  entry: KdbxItemState
}

const IconChoicePanel: React.FC<IProps> = ({classes, entry}) => {

  const setEntryState = useSetRecoilState(itemStateAtom(entry.uuid.id));
  const [panelState, setPanelState] = useRecoilState(iconChoisePanelAtom);

  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  const handleIconChange = (isPredefinedIcon: boolean, iconId: string) => {
    if (isPredefinedIcon) {
      const defaultIconId = Object.keys(DefaultKeeIcon).findIndex(key => key === iconId);
      if (defaultIconId > -1) {
        setEntryState(entry.setDefaultIconId(defaultIconId))
      }
    }
    else {
      setEntryState(entry.setCustomIconUuid(new KdbxUuid(iconId)));
    }
    setPanelState(closePanel);
  }

  const handleAddCustomIcon = () => {
    const files = remote.dialog.showOpenDialogSync({properties: ['openFile']});
    if (!files) {
      return;
    }
    const data = fs.readFileSync(files[0]);
    let icon: KdbxCustomIcon = {data: new Uint8Array(data).buffer}
    const uuid = KdbxUuid.random();
    currentContext.database.meta.customIcons.set(uuid.id, icon);
    forceUpdate();
  }

  const handleRemoveUnused = () => {
    currentContext.removeUnusedIcons();
    forceUpdate();
  }

  return (
    <Popover
      open = {panelState.isShowPanel}
      anchorEl = {panelState.panelAnchor}
      anchorOrigin = {{vertical: 'bottom', horizontal: 'center'}}
      transformOrigin = {{vertical: 'top', horizontal: 'center'}}
      onClose = {() => setPanelState(closePanel)}
    >
      <div className = {classes.root}>
        <GridList cellHeight = {50} className = {clsx(classes.gridList, classes.scrollBar)} cols = {9}>
          <GridListTile key="defaultSubheader" cols = {9} style = {{ height: 'auto' }} className = {classes.gridTitleHeader}>
            <ListSubheader component="div"><Typography variant='h5'>Default Icons</Typography></ListSubheader>
          </GridListTile>
          {Object.keys(DefaultKeeIcon).filter(i => i !== 'get').map(i =>
            <GridListTile key = {i}>
              <IconButton
                size='medium'
                onClick = {() => handleIconChange(true, i)}
              >
                <SvgPath path = {Reflect.get(DefaultKeeIcon, i)} />
              </IconButton>
            </GridListTile>
          )}
          <GridListTile key="customSubheader" cols = {9} style = {{ height: 'auto' }} className = {classes.gridTitleHeader}>
            <ListSubheader component="div">
              <Typography variant='h5'>Custom Icons
                <Tooltip title = 'Add Icon'>
                  <IconButton onClick = {() => handleAddCustomIcon()} >
                    <SvgPath path = {SystemIcon.add} />
                  </IconButton>
                </Tooltip>
                <Tooltip title = 'Remove Unused Icons'>
                  <IconButton onClick = {() => handleRemoveUnused()} >
                    <SvgPath path = {DefaultKeeIcon.wrench} />
                  </IconButton>
                </Tooltip>
              </Typography>
            </ListSubheader>
          </GridListTile>
          {currentContext.allCustomIcons.map(icon =>
            <GridListTile key = {icon.iconId}>
              <IconButton size='medium' onClick = {() => handleIconChange(false, icon.iconId)}>
                <img
                  className = {classes.customIcon}
                  src={icon.iconImage}/>
              </IconButton>
            </GridListTile>
          )}
        </GridList>
      </div>
    </Popover>
  );
}


export default withStyles(styles, { withTheme: true })(IconChoicePanel);

