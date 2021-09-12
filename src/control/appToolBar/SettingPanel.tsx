import electron from "electron"
import * as React from 'react';
import { Box, createStyles, Popover, Tab, Tabs, Theme, Typography, withStyles, WithStyles } from '@material-ui/core';
import { TabContext, TabPanel } from "@material-ui/lab";


const styles = (theme: Theme) =>  createStyles({
  root: {
    padding: theme.spacing(2),
    height: '500px',
    width: '800px',
  },
  infoLine: {
    height: theme.spacing(4),
    width: '100%'
  }
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

interface ISettingPanelProps extends WithStyles<typeof styles> {
  isPanelOpen: boolean;
  onClose: () => void;
}

interface ISettingPanelState {
  tabId: number;

}

class SettingPanel extends React.Component<ISettingPanelProps, ISettingPanelState> {
  constructor(props: ISettingPanelProps) {
    super(props);

    this.state = {
      tabId: 0,
    }
  }

  info = {
    version : electron.remote.app.getVersion(),
    environment: electron.remote.process.env.NODE_ENV,
    electron: electron.remote.process.versions.electron,
    node: electron.remote.process.versions.node
  }

  handleTabChange(tabId: number) {
    this.setState({tabId: tabId});
  }


  public render() {

    const { isPanelOpen, onClose, classes } = this.props;
    const { tabId } = this.state;

    let cpuUsage = 0.0;
    let memory = 0.0;
    for(const metric of electron.remote.app.getAppMetrics()){
      cpuUsage += metric.cpu.percentCPUUsage;
      memory += metric.memory.workingSetSize;
    }
    const version = electron.remote.app.getVersion();
    const electronVersion = electron.remote.process.versions.electron;
    const node = electron.remote.process.versions.node;

    return (

      <Popover
        open = {isPanelOpen}
        onClose = {() => onClose()}
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
          <TabContext value = {tabId.toString()}>
            <Tabs
              value = {tabId}
              indicatorColor = "primary"
              textColor = "primary"
              onChange = {(_, tabId) => this.handleTabChange(tabId)}
            >
              <Tab label="Info" />
              <Tab label="Database" />
            </Tabs>

            <TabPanel value={'0'} >
              <Typography variant="body1" className = {classes.infoLine}>
                Yet Another KeePass App, version: <b>{version}</b>
              </Typography>
              <Typography  variant="body1" className = {classes.infoLine}>
                CPU usage: <b>{cpuUsage.toLocaleString('en-us', {maximumFractionDigits: 2})}%</b>
              </Typography>
              <Typography  variant="body1" className = {classes.infoLine}>
                Memory: <b>{memory.toLocaleString('en-us')}</b>
              </Typography>
              <Typography  variant="body1" className = {classes.infoLine}>
                Electron version: <b>{electronVersion}</b>
              </Typography>
              <Typography  variant="body1" className = {classes.infoLine}>
                Node version: <b>{node}</b>
              </Typography>
            </TabPanel>
            <TabPanel value={'1'} >
              Item Two
            </TabPanel>
          </TabContext>


        </div>
      </Popover>

    );
  }
}

export default withStyles(styles, { withTheme: true })(SettingPanel);

/*
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
*/
