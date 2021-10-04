import React, { FC } from "react";
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
import { SystemIcon, searchFilterAtom } from "../../entity";
import { SvgPath } from "../common";
import { useRecoilState } from "recoil";

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

interface IProps extends WithStyles<typeof styles> {}

const SearchBox: FC<IProps> = ({classes}) => {

  const [searchFilter, setSearchFilter] = useRecoilState(searchFilterAtom);

  return (
    <MuiThemeProvider theme = {searchTheme}>
      <OutlinedInput
        id = "search"
        className = {classes.searchInput}
        onChange = {event => setSearchFilter(event.target.value)}
        onKeyDown = {event => event.key === 'Escape' && setSearchFilter('')}
        value = {searchFilter}
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

export default withStyles(styles, { withTheme: true })(SearchBox);
