import electron from "electron"
import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {  createStyles, WithStyles, withStyles, Theme } from "@material-ui/core/styles";
import {AppBar, Toolbar, Button, IconButton, Popover, Typography} from "@material-ui/core";
import clsx from "clsx";

import { KeeData, KeeDataContext, SystemIcon } from "../../entity";
import { SvgPath } from "../common";
import SearchBox from "./SearchBox";
import SortMenu from "./SortMenu";


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
      width: 46,
      borderRadius:0,
      "&:hover": {
        backgroundColor: theme.palette.primary.main
      },
      padding:'16px'
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

    dbName: {
      marginLeft: 'auto',
      color: theme.palette.grey.A100
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
    isPopOpen: false,
    isSortMenuOpen: false,
    sortField: 'Title'
  }

  info = {
    version : electron.remote.process.env.npm_package_version,
    environment: electron.remote.process.env.NODE_ENV,
    electron: electron.remote.process.versions.electron,
    node: electron.remote.process.versions.node
  }

  #menuAncor = null as any;

  constructor(props: Props)
  {
    super(props);
    this.handleMaximizeWindow = this.handleMaximizeWindow.bind(this);
  }

  handleMaximizeWindow() {
    this.setState({isMaximized: !this.state.isMaximized});
    electron.remote.getCurrentWindow().isMaximized()
      ? electron.remote.getCurrentWindow().restore()
      : electron.remote.getCurrentWindow().maximize();
  }

  handleCloseWindow = () => electron.remote.getCurrentWindow().close();

  handleMinimizeWindow = () => electron.remote.getCurrentWindow().minimize();

  handleMenuOpen = () => 	this.setState({	isPopOpen: true });

	handleMenuClose = () => this.setState({ isPopOpen: false });

  handleBackClick = () => this.props.history.goBack();

  render() {
    const { classes, history }  = this.props;
    return(
      <>
      <AppBar position="absolute">

        <Toolbar className = {classes.appBar}>
          <div className = {classes.resizer} />
          <IconButton
            color="inherit"
            className = {clsx(classes.button)}
            onClick={this.handleMenuOpen}
            buttonRef={node => { this.#menuAncor = node }}
          >
            <SvgPath className = {classes.icon20} path = {SystemIcon.menuThin} />
          </IconButton>

          {(history.location.pathname != '/') &&
            <>
              <Typography className = {classes.dbName}>/// {(this.context as KeeData).dbName}</Typography>
              <SearchBox />
              <SortMenu buttonClassName = {classes.button}/>
            </>
          }

          <IconButton
            color="inherit"
            className = {clsx(classes.button, classes.buttonMinimize)}
          >
            <SvgPath className = {classes.icon20} path = {SystemIcon.settings} />
          </IconButton>
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

      <Popover
        open = {this.state.isPopOpen}
        anchorEl = {this.#menuAncor}
        anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin = {{vertical: 'top', horizontal: 'left'}}
        onClose = {this.handleMenuClose}
      >
        <Typography className = {classes.aboutPaper} variant="h6">
          Yet Another KeePass App
          <Typography className = {classes.aboutDetail} variant="body1">
            Version: <Typography variant="caption">{this.info.version}</Typography> <br/>
            Env: <Typography variant="caption">{this.info.environment}</Typography> <br/>
            Electron: <Typography variant="caption">{this.info.electron}</Typography> <br/>
            Node: <Typography variant="caption">{this.info.node}</Typography> <br/>
          </Typography>
        </Typography>
        <Button onClick={this.handleBackClick}>Get back</Button>
      </Popover>
    </>
    );
  }
}

export default withRouter(withStyles(styles, { withTheme: true })(AppToolBar));