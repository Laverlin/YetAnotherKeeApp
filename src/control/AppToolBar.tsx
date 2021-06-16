import electron from "electron"
import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {  createStyles, WithStyles, withStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Button, createMuiTheme, IconButton, InputAdornment, MuiThemeProvider, OutlinedInput, Popover} from "@material-ui/core";
import clsx from "clsx";

import { SystemIcon } from "../entity/GlobalObject";
import { SvgPath } from "./helper/SvgPath";
import { KeeDataContext } from "../entity/Context";
import KeeData from "../entity/KeeData";


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

    searchInput:{
      WebkitAppRegion:'no-drag',
      height: '24px',
      width: '400px',
      color: theme.palette.getContrastText(theme.palette.primary.dark),
      backgroundColor: theme.palette.primary.main,
      marginLeft:'16px',
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

const theme = (defaultTheme: Theme) => createMuiTheme({
  overrides: {
    MuiOutlinedInput: {
      root: {
        '&$root $notchedOutline': {
          border: '1px solid',
          borderColor: defaultTheme.palette.grey[600]
        },
        '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
          border: '1px solid',
          borderColor: defaultTheme.palette.grey[300]
        },
        '&$root$focused $notchedOutline': {
          border: '1px solid',
          borderColor: defaultTheme.palette.grey[500],
        },
      },
    }
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
  }

  info = {
    version : electron.remote.process.env.npm_package_version,
    environment: electron.remote.process.env.NODE_ENV,
    electron: electron.remote.process.versions.electron,
    node: electron.remote.process.versions.node
  }

  private _anchorEl = null as any;

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

  handleSearch(filter: string) {
    (document.getElementById("search") as HTMLInputElement)!.value = filter;
    (this.context as KeeData).notifySearchFilterSubscribers(filter);
  }

  render() {
    const { classes }  = this.props;
    return(
      <>
      <AppBar position="absolute">

        <Toolbar className = {classes.appBar}>
          <div className = {classes.resizer} />
          <IconButton
            color="inherit"
            className = {clsx(classes.button)}
            onClick={this.handleMenuOpen}
            buttonRef={node => { this._anchorEl = node }}
          >
            <SvgPath className = {classes.icon20} path = {SystemIcon.menuThin} />
          </IconButton>

          {(this.props.history.location.pathname != '/') &&
            <>
              <Typography style ={{marginLeft:'auto'}}>...{(this.context as KeeData).dbName}</Typography>
              <MuiThemeProvider theme = {theme}>
                <OutlinedInput
                  id = "search"
                  className = {classes.searchInput}
                  onChange = {event => this.handleSearch(event.target.value)}
                  onKeyDown = {event => event.key === 'Escape' && this.handleSearch('')}
                  placeholder = "Search"
                  endAdornment = {
                    <InputAdornment position="end">
                      <SvgPath className = {classes.icon15} path = {SystemIcon.search} />
                    </InputAdornment>
                  }
                />
              </MuiThemeProvider>
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
        anchorEl = {this._anchorEl}
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
