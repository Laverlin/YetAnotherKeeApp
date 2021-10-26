import electron from "electron"
import * as React from 'react';
import { Box, Button, createStyles, Grid, Paper, Popover, styled, Tab, Tabs, Theme, Typography, withStyles, WithStyles } from '@material-ui/core';
import { TabContext, TabPanel } from "@material-ui/lab";
import { currentContext, isContextLoaded, notificationAtom, SystemIcon } from "../../entity";
import { Spinner, SvgPath } from "../common";
import { FC, useReducer, useState } from "react";
import { useSetRecoilState } from "recoil";

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

interface IProps extends WithStyles<typeof styles> {
  isPanelOpen: boolean;
  onClose: () => void;
}

const SettingPanel: FC<IProps> = ({classes, isPanelOpen, onClose}) => {


  const setNotification = useSetRecoilState(notificationAtom);

  const [tabId, setTabId] = useState(0);
  const [isProcess, setProcess] = useState(false);

  const handleTabChange = (tabId: number) => {
    setTabId(tabId);
  }


  let cpuUsage = 0.0;
  let memory = 0.0;
  for(const metric of electron.remote.app.getAppMetrics()){
    cpuUsage += metric.cpu.percentCPUUsage;
    memory += metric.memory.workingSetSize;
  }
  const version = electron.remote.app.getVersion();
  const electronVersion = electron.remote.process.versions.electron;
  const node = electron.remote.process.versions.node;

  const info = [
    { name:'version', value: version },
    { name:'CPU usage', value: `${cpuUsage.toLocaleString('en-us', {maximumFractionDigits: 2})}%` },
    { name: 'electron version', value: electronVersion},
    { name:'memory', value: memory.formatBytes() },
    { name: 'node version', value: node},
  ]

  const actionCopy = () => {
    return (
        <Button
          onClick = {() => {
            navigator.clipboard.writeText(currentContext().filePath);
            setNotification(`Database file path is copied`);
          }}
        >
          <SvgPath path={SystemIcon.copyFile}/>
          &nbsp;&nbsp;Copy Path
        </Button>
    )
  }

  const actionCompress = () => {
    return (
      <Button
        onClick = {async () => {
          setProcess(true);
          await currentContext().compressDatabase();
          setNotification(`Database has been cleaned`);
          setProcess(false);
        }}
      >
          {!isProcess
            ? <SvgPath path={SystemIcon.zip}/>
            : <Spinner size = {25} thickness = {1} />
          }
        &nbsp;&nbsp;Compress
      </Button>
    )
  }

  const actionCreateOrClean = () => {
    return (
        <Button
          onClick = {()=>{}}
        >
          <SvgPath path={SystemIcon.add}/>
          &nbsp;&nbsp;Add Recycle Bin
        </Button>
    )
  }

  const dbInfo = isContextLoaded()
  ? [
      { name: 'database', value: currentContext().filePath , action: actionCopy()},
      { name: 'size', value: currentContext().fileSize.formatBytes(), action: actionCompress() },
      { name: 'recycle bin', value: currentContext().isRecycleBinAvailable ? 'yes' : 'no', action: actionCreateOrClean() },
      { name: 'entries', value: currentContext().allItemIds.length },
    ]
  : []

  const HeaderItem = styled(Box)(({ theme }) => ({
    ...theme.typography.h6,
    padding: theme.spacing(0),
    textAlign: 'center',
    color: theme.palette.text.primary,
  }));

  const Item = styled(Box)(({ theme }) => ({
    ...theme.typography.body1,
    padding: theme.spacing(0),
    textAlign: 'left',
    color: theme.palette.text.primary,
  }));

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
              onChange = {(_, tabId) => handleTabChange(tabId)}
            >
              <Tab label="About" />
              <Tab label="Database" />
            </Tabs>

            <TabPanel value={'0'} >

              <Grid container spacing = {1}>
                <Grid item xs = {12}>
                  <HeaderItem>
                    <b>Yet Another KeePass App</b>
                  </HeaderItem>
                </Grid>
                {info.map(i =>
                  <>
                    <Grid item xs = {3}>
                      <Item>{i.name}</Item>
                    </Grid>
                    <Grid item xs = {3}>
                      <Item>{i.value}</Item>
                    </Grid>
                  </>
                )}
              </Grid>
            </TabPanel>
            <TabPanel value={'1'} >
              <Grid  container spacing = {2}>
                <Grid item xs = {12}>
                  <HeaderItem>Database</HeaderItem>
                </Grid>
                {dbInfo.map(i =>
                  <>
                    <Grid item xs={2}><Item><b>{i.name}</b></Item></Grid>
                    <Grid item xs={6}><Item>{i.value}</Item></Grid>
                    <Grid item xs={4}><Item>{i.action}</Item></Grid>
                  </>
                )}
              </Grid>
            </TabPanel>
          </TabContext>


        </div>
      </Popover>

    );
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
