import React from 'react';
import { RecoilRoot } from 'recoil';
import { render } from 'react-dom';

import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import MainFrame from './control/MainFrame';
import MainLayout from './control/MainLayout';
import { ThemeProvider } from '@material-ui/core';
import { appTheme } from './appTheme';
import ErrorBoundary from './control/common/ErrorBoundary';
import GlobalObserver from './entity/state/GlobalObserver';
import OpenFilePanel  from './control/OpenFilePanel';


render(
  <RecoilRoot>
 {/*  <GlobalObserver /> */}
   <React.StrictMode>
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
    </React.StrictMode>
  </RecoilRoot>,
  document.getElementById('root')
);
