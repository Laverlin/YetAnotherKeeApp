import { Card, CardContent, createStyles, Typography, withStyles, WithStyles } from '@material-ui/core';
import { KdbxEntry, KdbxGroup } from 'kdbxweb';
import * as React from 'react';

const styles = () =>  createStyles({

  ellipsis: {
    whiteSpace:'nowrap',
    overflow:'hidden',
    textOverflow: 'ellipsis'
  },

});

interface IItemInfoCardProps extends WithStyles<typeof styles> {
  entry: KdbxEntry | KdbxGroup
}

class ItemInfoCard extends React.Component<IItemInfoCardProps> {

  public render() {
    const {classes, entry} = this.props;

    return (
      <Card variant="outlined" >
      <CardContent style={{paddingTop:4, paddingBottom: 4 }}>
        <Typography variant="body1"  className={classes.ellipsis}>
          Created&nbsp;:&nbsp;
          <Typography variant="caption">
            { entry.times.creationTime?.toDateString() }
            &nbsp;
            { entry.times.creationTime?.toTimeString() }
          </Typography>
        </Typography>

        <Typography variant="body1" className={classes.ellipsis}>
          Last Modified&nbsp;:&nbsp;
          <Typography variant="caption">
            { entry.times.lastModTime?.toDateString() }
            &nbsp;
            { entry.times.lastModTime?.toTimeString() }
          </Typography>
        </Typography>

        <Typography variant="body1" className={classes.ellipsis}>
          Last Access&nbsp;:&nbsp;
          <Typography variant="caption">
            { entry.times.lastAccessTime?.toDateString() }
            &nbsp;
            { entry.times.lastAccessTime?.toTimeString() }
          </Typography>
        </Typography>

        <Typography variant="body1" className={classes.ellipsis}>
          Used&nbsp;:&nbsp;<Typography variant="caption">{ entry.times.usageCount }</Typography>
          &nbsp;&nbsp;
          Group&nbsp;:&nbsp;<Typography variant="caption">{ entry.parentGroup?.name }</Typography>
          &nbsp;&nbsp;
          UUID&nbsp;:&nbsp;<Typography variant="caption">{ entry.uuid.toString() }</Typography>
        </Typography>

      </CardContent>
    </Card>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ItemInfoCard);
