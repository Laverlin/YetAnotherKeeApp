import * as React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  createStyles,
  Typography,
  withStyles,
  WithStyles
} from '@material-ui/core';
import { ByteUtils, KdbxEntry, KdbxGroup } from 'kdbxweb';
import { SystemIcon } from '../../entity';
import { SvgPath } from '../common';

const styles = () =>  createStyles({

  ellipsis: {
    whiteSpace:'nowrap',
    overflow:'hidden',
    textOverflow: 'ellipsis'
  },

  content: {
    width: '100%'
  }

});

interface IItemInfoCardProps extends WithStyles<typeof styles> {
  entry: KdbxEntry | KdbxGroup
}

class ItemInfoCard extends React.Component<IItemInfoCardProps> {

  public render() {
    const {classes, entry} = this.props;

    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<SvgPath path={SystemIcon.cone_down} />}
          aria-controls="panel-content"
          id="panel-header"
        >
          <Typography variant = 'body1'>Entry Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className = {classes.content}>
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
              {entry instanceof KdbxEntry &&
              <>
                &nbsp;&nbsp;
                History&nbsp;:&nbsp;<Typography variant="caption">{ entry.history.length }</Typography>
              </>
              }
            </Typography>
            <Typography variant="body1" className={classes.ellipsis}>
              UUID&nbsp;:&nbsp;<Typography variant="caption">{ ByteUtils.bytesToHex(ByteUtils.base64ToBytes(entry.uuid.id)).toUpperCase() }</Typography>
            </Typography>

          </div>
        </AccordionDetails>
      </Accordion>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ItemInfoCard);
