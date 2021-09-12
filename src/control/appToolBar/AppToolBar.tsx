import electron from "electron"
import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {  createStyles, WithStyles, withStyles, Theme } from "@material-ui/core/styles";
import {AppBar, Toolbar, IconButton, Typography, Tooltip} from "@material-ui/core";
import clsx from "clsx";

import { KeeData, KeeDataContext, SystemIcon } from "../../entity";
import { SvgPath } from "../common";
import SearchBox from "./SearchBox";
import SortMenu from "./SortMenu";
import { EntryChangedEvent } from "../../entity/KeeEvent";
import SettingPanel from "./SettingPanel";


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

interface Props extends WithStyles<typeof styles>, RouteComponentProps  {}

// Tool Bar
//
class AppToolBar extends React.Component<Props>
{
  static contextType = KeeDataContext;

  state = {
    isMaximized: electron.remote.getCurrentWindow().isMaximized(),
    isSortMenuOpen: false,
    sortField: 'Title',
    isDbChanged: false,
    isSettingPanelOpen: false
  }

  constructor(props: Props)
  {
    super(props);
    this.handleMaximizeWindow = this.handleMaximizeWindow.bind(this);
    this.handleEntryChanded = this.handleEntryChanded.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
  }

  componentDidMount() {
    (this.context as KeeData).addEventListener(EntryChangedEvent, KeeData.anyEntryUuid, this.handleEntryChanded);
  }

  componentWillUnmount() {
    (this.context as KeeData).removeEventListener(EntryChangedEvent, KeeData.anyEntryUuid, this.handleEntryChanded);
  }

  handleEntryChanded(_: EntryChangedEvent) {
    this.setState({isDbChanged: true});
  }

  handleMaximizeWindow() {
    this.setState({isMaximized: !this.state.isMaximized});
    electron.remote.getCurrentWindow().isMaximized()
      ? electron.remote.getCurrentWindow().restore()
      : electron.remote.getCurrentWindow().maximize();
  }

  handleCloseWindow = () => electron.remote.getCurrentWindow().close();

  handleMinimizeWindow = () => electron.remote.getCurrentWindow().minimize();

  handleBackClick() {
    this.setState({isDbChanged: false});
    this.props.history.goBack();
  }

  async handleSave() {
    await (this.context as KeeData).saveDb();
    this.setState({isDbChanged: false});
  }

  render() {
    const { classes, history }  = this.props;
    const { isSettingPanelOpen } = this.state;
    return(
      <>
      <AppBar position="absolute">

        <Toolbar className = {classes.appBar}>
          <div className = {classes.resizer} />


          {(history.location.pathname != '/') &&
            <>
              <Typography className = {classes.dbName}> {'/// ' + (this.context as KeeData).dbName}</Typography>
              <div className = {classes.space15}>
                {this.state.isDbChanged && <Typography variant='h5'>*</Typography>}
              </div>
              <Tooltip title = {'Save ' + (this.context as KeeData).dbName}>
                <IconButton
                  color = "inherit"
                  className = {clsx(this.state.isDbChanged ? classes.button : classes.buttonDisabled)}
                  onClick = {this.handleSave}
                >
                  <SvgPath className = {classes.icon20} path = {SystemIcon.save} />
                </IconButton>
              </Tooltip>
              <Tooltip title = {'Open another file'}>
                <IconButton
                  color = "inherit"
                  className = {classes.button}
                  onClick = {this.handleBackClick}
                >
                  <SvgPath className = {classes.icon20} path = {SystemIcon.openFile} />
                </IconButton>
              </Tooltip>
              <div className = {classes.pushRight}>
                <SearchBox />
              </div>
              <SortMenu buttonClassName = {classes.button}/>
            </>
          }

          <Tooltip title = 'Settings'>
            <IconButton
              color="inherit"
              className = {clsx(classes.button, classes.buttonMinimize)}
              onClick = {() => this.setState({isSettingPanelOpen: true})}
            >
              <SvgPath className = {classes.icon20} path = {SystemIcon.settings} />
            </IconButton>
          </Tooltip>
          <span className = {classes.space}/>
          <IconButton
            color="inherit"
            className = {clsx(classes.button)}
            onClick={this.handleMinimizeWindow}>
            <SvgPath className = {classes.icon15} path = {SystemIcon.minimizeThin} />
          </IconButton>
          <IconButton
            color="inherit"
            className = {clsx(classes.button)}
            onClick={this.handleMaximizeWindow}>
            { this.state.isMaximized
              ? <SvgPath className = {classes.icon15} path = {SystemIcon.restoreThin} />
              : <SvgPath className = {classes.icon15} path = {SystemIcon.maximizeThin} />
            }
          </IconButton>
          <IconButton
            color="inherit"
            className = {clsx(classes.button, classes.buttonClose)}
            onClick={this.handleCloseWindow}>
            <SvgPath className = {classes.icon15} path = {SystemIcon.xMarkThin} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <SettingPanel
        isPanelOpen = {isSettingPanelOpen}
        onClose = {() => this.setState({isSettingPanelOpen: false})}
      />

    </>
    );
  }
}

export default withRouter(withStyles(styles, { withTheme: true })(AppToolBar));
