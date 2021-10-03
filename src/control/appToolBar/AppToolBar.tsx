import electron from "electron"
import React, { FC, useState } from "react";
import { RouteComponentProps, useLocation, withRouter } from "react-router-dom";
import {  createStyles, WithStyles, withStyles, Theme } from "@material-ui/core/styles";
import {AppBar, Toolbar, IconButton, Typography, Tooltip} from "@material-ui/core";
import clsx from "clsx";

import {  SystemIcon } from "../../entity";
import { SvgPath } from "../common";
import SearchBox from "./SearchBox";
import SortMenu from "./SortMenu";
import SettingPanel from "./SettingPanel";
import { useSetRecoilState, useRecoilState } from "recoil";
import { openPanel, toolSortMenuAtom } from "../../entity/state/PanelStateAtoms";
import { isDbSavedSelector } from "../../entity/state/Atom";
import { KeeFileManager } from "../../entity/model/KeeFileManager";
import path from "path";


const styles = (theme: Theme) =>  createStyles({
    appBar: {
      WebkitAppRegion:'drag',
      paddingRight: 0,
      paddingLeft: 0,
      minHeight: theme.customSize.topBar.height,
      backgroundColor: theme.palette.primary.dark,
    },

    resizer:{
      position: 'absolute',
      top:0,
      left:0,
      right:0,
      height:4,
      WebkitAppRegion:'no-drag',
    },

    button: {
      WebkitAppRegion:'no-drag',
      height: theme.customSize.topBar.height,
      width: theme.customSize.topBar.height,
      borderRadius:0,
      "&:hover": {
        backgroundColor: theme.palette.primary.main
      },
    },

    buttonDisabled: {
      height: theme.customSize.topBar.height,
      width: theme.customSize.topBar.height,
      borderRadius: 0,
      color: theme.palette.grey.A200
    },

    buttonClose: {
      "&:hover": {
        backgroundColor: '#D70012'
      },
    },

    buttonMinimize: {
      marginLeft:'auto'
    },

    icon15:{
      height: 15,
      width: 15
    },

    icon20:{
      height: 20,
      width: 20
    },

    space15: {
      width: '15px',
    },

    dbName: {
      color: theme.palette.grey.A100,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1/4),
    },

    pushRight: {
      marginLeft: 'auto',
    },

    aboutPaper: {
      padding: theme.spacing(2)
    },

    aboutDetail: {
      paddingLeft: theme.spacing(1)
    },

    space: {
      width: theme.spacing(3)
    }
});

interface IProps extends WithStyles<typeof styles>, RouteComponentProps  {}

// Tool Bar
//
const AppToolBar: FC<IProps> = ({classes}) => {

  const setSortMenu = useSetRecoilState(toolSortMenuAtom);
  const [isDbSaved, setDbSaved] = useRecoilState(isDbSavedSelector);

  const [isMaximized, setIsMaximized] = useState(electron.remote.getCurrentWindow().isMaximized());
  const [isSettingPanelOpen, setSettingPanel] = useState(false);

  const handleMaximizeWindow = () => {
    setIsMaximized(!isMaximized);
    electron.remote.getCurrentWindow().isMaximized()
      ? electron.remote.getCurrentWindow().restore()
      : electron.remote.getCurrentWindow().maximize();
  }

  const handleCloseWindow = () => electron.remote.getCurrentWindow().close();

  const handleMinimizeWindow = () => electron.remote.getCurrentWindow().minimize();

  const handleBackClick = () => {
    //this.setState({isDbChanged: false});
    history.back();
  }

  const handleSave = () => {
    KeeFileManager.SaveFile();
    setDbSaved(true);
  }

  const dbName = path.basename(KeeFileManager.filePath);
  const location = useLocation();

  return(
    <>
    <AppBar position="absolute">

      <Toolbar className = {classes.appBar}>
        <div className = {classes.resizer} />


        {(location.pathname != '/') &&
          <>
            <Typography className = {classes.dbName}> {`/// ${dbName}`}</Typography>
            <div className = {classes.space15}>
              {isDbSaved && <Typography variant='h5'>*</Typography>}
            </div>
            <Tooltip title = {`Save ${dbName}`}>
              <IconButton
                color = "inherit"
                className = {clsx(isDbSaved ? classes.button : classes.buttonDisabled)}
                onClick = {handleSave}
              >
                <SvgPath className = {classes.icon20} path = {SystemIcon.save} />
              </IconButton>
            </Tooltip>
            <Tooltip title = {'Open another file'}>
              <IconButton
                color = "inherit"
                className = {classes.button}
                onClick = {handleBackClick}
              >
                <SvgPath className = {classes.icon20} path = {SystemIcon.openFile} />
              </IconButton>
            </Tooltip>
            <div className = {classes.pushRight}>
              <SearchBox />
            </div>
            <Tooltip title = 'Sort'>
              <IconButton
                color="inherit"
                className = {classes.button}
                onClick = {e => setSortMenu(openPanel(e.currentTarget))}
              >
                <SvgPath className = {classes.icon20} path = {SystemIcon.sort}/>
              </IconButton>
            </Tooltip>
            <SortMenu />
          </>
        }

        <Tooltip title = 'Settings'>
          <IconButton
            color="inherit"
            className = {clsx(classes.button, classes.buttonMinimize)}
            onClick = {() => setSettingPanel(true)}
          >
            <SvgPath className = {classes.icon20} path = {SystemIcon.settings} />
          </IconButton>
        </Tooltip>
        <span className = {classes.space}/>
        <IconButton
          color="inherit"
          className = {clsx(classes.button)}
          onClick = {handleMinimizeWindow}>
          <SvgPath className = {classes.icon15} path = {SystemIcon.minimizeThin} />
        </IconButton>
        <IconButton
          color="inherit"
          className = {clsx(classes.button)}
          onClick = {handleMaximizeWindow}>
          { isMaximized
            ? <SvgPath className = {classes.icon15} path = {SystemIcon.restoreThin} />
            : <SvgPath className = {classes.icon15} path = {SystemIcon.maximizeThin} />
          }
        </IconButton>
        <IconButton
          color="inherit"
          className = {clsx(classes.button, classes.buttonClose)}
          onClick={handleCloseWindow}>
          <SvgPath className = {classes.icon15} path = {SystemIcon.xMarkThin} />
        </IconButton>
      </Toolbar>
    </AppBar>

    <SettingPanel
      isPanelOpen = {isSettingPanelOpen}
      onClose = {() => setSettingPanel(false)}
    />
  </>
  );
}

export default withRouter(withStyles(styles, { withTheme: true })(AppToolBar));
