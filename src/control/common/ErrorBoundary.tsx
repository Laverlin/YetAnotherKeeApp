import electron from "electron";
import { Button, createStyles, Popover, Theme, Typography, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import clsx from "clsx";

const styles = (theme: Theme) =>  createStyles({
  root: {
    padding: theme.spacing(2),
    width: '800px',
  },
  header: {
    display:'flex',
    width:'100%',
    justifyContent: 'center',
    paddingBottom: theme.spacing(4)
  },
  content: {
    display:'flex',
    width:'100%',
    height: theme.spacing(8),
    flexDirection:'row',
    alignContent: 'end',
    alignItems: 'end',
  },
  footer: {
    display:'flex',
    width:'100%',
    justifyContent: 'center',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  contentItem:{
    display:'flex',
    alignSelf:'flex-end',
    alignItems:'flex-end',
    paddingLeft: theme.spacing(2),
  },
  errorText:{
    paddingBottom:'3px'
  },
  errorType:{
    color: 'red',
    fontWeight:'bold'
  }

});

interface IErrorBoundaryProps extends WithStyles<typeof styles> {
}

interface IErrorBoundaryState {
  hasError: boolean;
  error: any;
  info: any;
}

class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  constructor(props: IErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: '',
      info: '',
    }
  }

  componentDidCatch(error: any, info: any) {

    this.setState({ hasError: true, error: error, info: info });

  }

  handleRelaunch() {
    electron.remote.app.relaunch();
    electron.remote.app.exit(1);
  }

  public render() {
    const { error } = this.state;
    const { classes, children } = this.props;
    return(
      <>
        <Popover
          open = {this.state.hasError}
          onClose = {() => this.setState({hasError: false})}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 50, left: window.innerWidth / 2 }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div className = {classes.root}>
            <Typography variant = 'h3' className = {classes.header}>Something went wrong</Typography>
            <div className = {classes.content}>
              {error instanceof Error
                ? <>
                    <Typography
                      variant = 'h6'
                      className = {clsx(classes.contentItem, classes.errorType)}>
                        {error.name}:
                    </Typography>
                    <Typography
                      variant = 'body1'
                      className = {clsx(classes.contentItem, classes.errorText)}
                    >
                        {error.message}
                    </Typography>
                  </>
                : <Typography variant = 'body1' className = {classes.contentItem}>{error.toString()}</Typography>
              }
            </div>
            <div className = {classes.footer}>
              <Button
                variant = 'contained'
                color = "primary"
                onClick = {() => this.handleRelaunch()}
              >
                Relaunch application
              </Button>
            </div>
          </div>

        </Popover>
        {children}
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ErrorBoundary);
