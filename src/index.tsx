import React from 'react';
import { render } from 'react-dom';
import { KeeDataContext } from './entity/Context';
import KeeData from './entity/KeeData';

import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import SelectDb from './control/SelectDb';
import MainFrame from './control/MainFrame';
import MainLayout from './control/MainLayout';
import { ThemeProvider } from '@material-ui/core';
import { appTheme } from './appTheme';
import { ipcRenderer } from 'electron';

const keeData = new KeeData();

render(
  <React.StrictMode>
    <KeeDataContext.Provider value = {keeData}>
      <ThemeProvider theme = {appTheme}>
        <Router>
          <MainFrame>
            <Switch>
              <Route path = "/app">
                <MainLayout />
              </Route>
              <Route path = "/">
                <SelectDb />
              </Route>
            </Switch>
          </MainFrame>
        </Router>
      </ThemeProvider>
    </KeeDataContext.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
