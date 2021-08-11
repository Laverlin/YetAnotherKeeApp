import { createStyles, IconButton, Theme, withStyles, WithStyles } from '@material-ui/core';
import { KdbxEntry, KdbxEntryField, KdbxGroup } from 'kdbxweb';
import * as React from 'react';
import { KeeData, SystemIcon } from '../../entity';
import { SvgPath } from '../common';


const styles = (theme: Theme) =>  createStyles({

  itemBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display:'flex',
    flexDirection:'row',
    height: theme.spacing(8),
    padding: theme.spacing(1),
  },

  bottomIcon:{
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: theme.spacing(1/2),
  }
})

interface IItemToolbarProps extends WithStyles<typeof styles> {
  currentEntry: KdbxEntry | KdbxGroup,
}

class ItemToolbar extends React.Component<IItemToolbarProps> {

  constructor(props : IItemToolbarProps) {
    super(props);
  }



  public render() {
    const { classes }  = this.props;

    return (
      <div className={classes.itemBottom}>


        <IconButton aria-label="Delete Entry" style={{marginLeft:'auto'}}>
          <SvgPath className={classes.bottomIcon} path = {SystemIcon.delete}/>
        </IconButton>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ItemToolbar);
