import React from "react";
import {
  createMuiTheme,
  createStyles,
  InputAdornment,
  MuiThemeProvider,
  OutlinedInput,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { KeeData, KeeDataContext, SystemIcon } from "../../entity";
import { SvgPath } from "../common";

const styles = (theme: Theme) =>  createStyles({

  searchInput:{
    WebkitAppRegion:'no-drag',
    height: '24px',
    width: '400px',
    color: theme.palette.getContrastText(theme.palette.primary.dark),
    backgroundColor: theme.palette.primary.main,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1)
  },

  icon15:{
    height: 15,
    width: 15
  },

});

const searchTheme = (defaultTheme: Theme) => createMuiTheme({
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

interface Props extends WithStyles<typeof styles> {}

class SearchBox extends React.Component<Props>
{
  static contextType = KeeDataContext;

  handleSearch(query: string) {
    (this.context as KeeData).entryFilter.queryFilter = query;
    this.forceUpdate();
  }

  render() {
    const {classes} = this.props;
    const {entryFilter} = (this.context as KeeData)
    return (
      <MuiThemeProvider theme = {searchTheme}>
        <OutlinedInput
          id = "search"
          className = {classes.searchInput}
          onChange = {event => this.handleSearch(event.target.value)}
          onKeyDown = {event => event.key === 'Escape' && this.handleSearch('')}
          value = {entryFilter.queryFilter}
          placeholder = "Search"
          endAdornment = {
            <InputAdornment position="end">
              <SvgPath className = {classes.icon15} path = {SystemIcon.search} />
            </InputAdornment>
          }
        />
      </MuiThemeProvider>
    )
  }
}

export default withStyles(styles, { withTheme: true })(SearchBox);
