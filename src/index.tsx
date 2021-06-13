import { unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core';
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

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    customSize: {
      topBar: {
        height: number | string;
      },
    };
  }
  // allow configuration using `createMuiTheme`
  //
  interface ThemeOptions {
    customSize?: {
      topBar?: {
        height?: number | string;
      },
    };
  }
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3a506b'//'#253d5b',
    }
  },

  customSize: {
    topBar: {
      height: 36
    },
  }
});


const keeData = new KeeData();

render(
  <React.StrictMode>
    <KeeDataContext.Provider value={keeData}>
      <ThemeProvider theme={theme}>
        <Router>
          <MainFrame>
            <Switch>
              <Route path="/app">
                <MainLayout/>
              </Route>
              <Route path="/">
                <SelectDb/>
              </Route>
            </Switch>
          </MainFrame>
        </Router>
      </ThemeProvider>
    </KeeDataContext.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
