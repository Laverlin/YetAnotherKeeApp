import {
  Theme,
  Tooltip,
  withStyles
} from "@material-ui/core";


export const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(12),
  },
})) (Tooltip);
