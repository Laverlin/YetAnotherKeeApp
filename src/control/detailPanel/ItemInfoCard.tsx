import React, { FC } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  createStyles,
  Typography,
  withStyles,
  WithStyles
} from '@material-ui/core';
import { ByteUtils } from 'kdbxweb';
import { SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import { KdbxItemWrapper } from '../../entity/model/KdbxItemWrapper';

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

interface IProps extends WithStyles<typeof styles> {
  entry: KdbxItemWrapper
}

const ItemInfoCard: FC<IProps> = ({classes, entry}) => {

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
              { entry.creationTime?.toDateString() }
              &nbsp;
              { entry.creationTime?.toTimeString() }
            </Typography>
          </Typography>

          <Typography variant="body1" className={classes.ellipsis}>
            Last Modified&nbsp;:&nbsp;
            <Typography variant="caption">
              { entry.lastModifiedTime.toDateString() }
              &nbsp;
              { entry.lastModifiedTime.toTimeString() }
            </Typography>
          </Typography>

          <Typography variant="body1" className={classes.ellipsis}>
            Last Access&nbsp;:&nbsp;
            <Typography variant="caption">
              { entry.lastAccessTime.toDateString() }
              &nbsp;
              { entry.lastAccessTime.toTimeString() }
            </Typography>
          </Typography>

          <Typography variant="body1" className={classes.ellipsis}>
            Used&nbsp;:&nbsp;<Typography variant="caption">{ entry.usageCount }</Typography>
            &nbsp;&nbsp;
            History&nbsp;:&nbsp;<Typography variant="caption">{ entry.history.length }</Typography>
          </Typography>
          <Typography variant="body1" className={classes.ellipsis}>
            UUID&nbsp;:&nbsp;
            <Typography variant="caption">
              { ByteUtils.bytesToHex(ByteUtils.base64ToBytes(entry.uuid.id)).toUpperCase() }
            </Typography>
          </Typography>

        </div>
      </AccordionDetails>
    </Accordion>
  );
}

export default withStyles(styles, { withTheme: true })(ItemInfoCard);
