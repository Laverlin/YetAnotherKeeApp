import React from 'react';
import { RecoilRoot } from 'recoil';
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
import ErrorBoundary from './control/common/ErrorBoundary';
import GlobalObserver from './entity/state/GlobalObserver';
import OpenFilePanel  from './control/OpenFilePanel';


const keeData = new KeeData();

render(
  <RecoilRoot>
  <GlobalObserver />
  <React.StrictMode>
    <KeeDataContext.Provider value = {keeData}>
      <ThemeProvider theme = {appTheme}>
        <Router>
          <ErrorBoundary>
            <MainFrame>
              <Switch>
                <Route path = "/app">
                  <MainLayout />
                </Route>
                <Route path = "/">
                  <OpenFilePanel />
                </Route>
              </Switch>
            </MainFrame>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </KeeDataContext.Provider>
  </React.StrictMode>
  </RecoilRoot>,
  document.getElementById('root')
);
