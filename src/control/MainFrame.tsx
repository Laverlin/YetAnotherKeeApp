import React from 'react';
import {
  createStyles,
  WithStyles,
  withStyles,
  Theme,
} from '@material-ui/core/styles';
import AppToolBar from './appToolBar/AppToolBar';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const styles = (theme: Theme) => createStyles({
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: theme.customSize.topBar.height,
    },

    mainContent: {
      position: 'absolute',
      top: theme.customSize.topBar.height,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      background: theme.palette.background.paper
    }
  });

interface Props extends WithStyles<typeof styles>, RouteComponentProps {}

class MainFrame extends React.Component<Props> {

  render() {
    const { classes } = this.props;
    return (
      <>
        <div className = {classes.topBar}>
          <AppToolBar />
        </div>
        <div className = {classes.mainContent}>
          {this.props.children}
        </div>
      </>
    );
  }
}

export default withRouter(withStyles(styles, { withTheme: true })(MainFrame));
