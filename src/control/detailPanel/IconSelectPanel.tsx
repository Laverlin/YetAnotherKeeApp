import fs from 'fs';
import * as React from 'react';
import {
  Checkbox,
  createStyles,
  GridList,
  GridListTile,
  IconButton,
  Popover,
  Theme,
  Tooltip,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import { SvgPath, scrollBar } from '../common';
import clsx from 'clsx';
import { KdbxCustomIcon, KdbxUuid } from 'kdbxweb';
import { remote } from 'electron';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import {
  DefaultKeeIcon,
  SystemIcon,
  closePanel,
  iconChoisePanelAtom,
  KdbxItemState,
  itemStateAtom,
  currentContext,
  resizeImage,
  IIconInfo
} from '../../entity';
import { useEffect, useReducer, useState } from 'react';

let alwaysScroll = scrollBar;
alwaysScroll['overflow-y'] = 'scroll';

const styles = (theme: Theme) =>  createStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    //overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  },

  gridList: {
    width: 570,
    height: 450,
  },

  customIcon: {
    width: 24,
    height: 24
  },

  gridTitleHeader: {
    paddingTop: theme.spacing(1),
    backgroundColor:  theme.palette.background.default,
  },

  subHeader: {
    display:'flex',
    alignItems:'center',
    alignContent:'center',
    padding: 4,
    height: 46
  },

  scrollBar: alwaysScroll,

  pushRight: {
    marginLeft:'auto'
  },

  iconCheckbox: {
    position: 'absolute',
    right:0,
    top:0,
    color: 'lightgray',
    padding:3,
  },

  cell: {
    '&:hover $icon':{
      visibility:'visible',
    }
  },

  icon: {
    borderRadius: 3,
    width: 10,
    height: 10,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: theme.palette.background.default,
    visibility:'hidden',
  },
  checkedIcon: {
    backgroundColor: theme.palette.primary.main,
    visibility:'visible',
    '&:before': {
      display: 'block',
      width:10,
      height:10,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
  },

});

interface IProps  extends WithStyles<typeof styles> {
  entry: KdbxItemState
}

const IconSelectPanel: React.FC<IProps> = ({classes, entry}) => {

  // global state
  //
  const setEntryState = useSetRecoilState(itemStateAtom(entry.uuid.id));
  const [panelState, setPanelState] = useRecoilState(iconChoisePanelAtom);
  const dropCustomIcon = useRecoilCallback(({set}) => (itemId:string) => {
    set(itemStateAtom(itemId), cur => cur.dropCustomIcon());
  })

  // local state
  //
  const [update, forceUpdate] = useReducer(x => x + 1, 0);
  const [selectedIcons, setSelectedIcons] = useState([] as string[]);
  const [icons, setIcons] = useState([] as IIconInfo[]);

  useEffect(() => {
    const loadIcons = async () => setIcons(await currentContext().getAllCustomIcons());
    loadIcons();
  }, [update])

  if (!panelState.isShowPanel)
    return null;

  // handlers
  //
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

  const handleAddCustomIcon = async () => {
    const files = remote.dialog.showOpenDialogSync({properties: ['openFile']});
    if (!files) {
      return;
    }
    const data = fs.readFileSync(files[0]);
    const blob = await resizeImage(data, 64, 64);
    if (blob) {
      let icon: KdbxCustomIcon = {data: blob}
      const uuid = KdbxUuid.random();
      currentContext().setCustomIcon(uuid.id, icon);
      forceUpdate();
    }
  }

  const handleSelectIcon = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIcons(
      selectedIcons.includes(event.target.id)
        ? selectedIcons.filter(i => i !== event.target.id)
        : selectedIcons.concat(event.target.id)
    );
  }

  const handleRemoveUnused = () => {
    currentContext().removeUnusedIcons();
    forceUpdate();
  }

  const handleCompressSelected = async () => {
    await currentContext().compressIcons(selectedIcons);
    setSelectedIcons([]);
    forceUpdate();
  }

  const handleRemoveSelected = () => {
    const itemIds = currentContext().removeSelectedIcons(selectedIcons);
    for(let itemId of itemIds) {
      dropCustomIcon(itemId.id);
    }
    setSelectedIcons([]);
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
        <GridList cellHeight = {55} className = {clsx(classes.gridList, classes.scrollBar)} cols = {9}>
          <GridListTile key="defaultSubheader" cols = {9}  className = {classes.gridTitleHeader}>
              <Typography variant='h5' color = 'primary' className = {classes.subHeader}>Default Icons</Typography>
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
          <GridListTile key="customSubheader" cols = {9} className = {classes.gridTitleHeader}>

              <Typography variant='h5' color = 'primary' className = {classes.subHeader}>Custom Icons
                <Tooltip title = 'Add Icon' className = {classes.pushRight}>
                  <IconButton onClick = {() => handleAddCustomIcon()} color = 'primary'>
                    <SvgPath path = {SystemIcon.add} />
                  </IconButton>
                </Tooltip>
                <Tooltip title = 'Remove Unused Icons'>
                  <IconButton onClick = {() => handleRemoveUnused()} color = 'primary' >
                    <SvgPath path = {SystemIcon.clean} />
                  </IconButton>
                </Tooltip>
                <Tooltip title = 'Compress Selected Icons'>
                  <span>
                    <IconButton
                      onClick = {() => handleCompressSelected()}
                      color = 'primary'
                      disabled = {!selectedIcons.length}
                    >
                      <SvgPath path = {SystemIcon.zip} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title = 'Remove SelectedIcons'>
                  <span>
                    <IconButton
                      onClick = {() => handleRemoveSelected()}
                      color = 'primary'
                      disabled = {!selectedIcons.length}
                    >
                      <SvgPath path = {SystemIcon.delete} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Typography>

          </GridListTile>
          {icons.map(icon =>
            <GridListTile key = {icon.id} className={classes.cell}>
              <Checkbox
                id = {icon.id}
                className={classes.iconCheckbox}
                checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
                icon={<span className={classes.icon} />}
                checked = {selectedIcons.includes(icon.id)}
                onChange = {e => handleSelectIcon(e)}
              />
              <Tooltip
                title = {
                  <>
                    {icon.size.formatBytes()} <br/>
                    {`${icon.width} X ${icon.height}`}
                  </>
                }
              >
                <IconButton size='medium' onClick = {() => handleIconChange(false, icon.id)}>
                  <img
                    className = {classes.customIcon}
                    src = {icon.b64image}
                  />
                </IconButton>
              </Tooltip>

            </GridListTile>
          )}
        </GridList>
      </div>
    </Popover>
  );
}

export default withStyles(styles, { withTheme: true })(IconSelectPanel);

