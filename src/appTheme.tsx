import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core';

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

export const appTheme = createMuiTheme({
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
