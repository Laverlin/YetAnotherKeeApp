import fs from 'fs';
import path from 'path';
import * as React from 'react';
import {
  Chip,
  createStyles,
  IconButton,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles
} from '@material-ui/core';
import clsx from 'clsx';
import { SystemIcon } from '../../entity';
import { KdbxBinary, KdbxBinaryWithHash, KdbxEntry, KdbxGroup, ProtectedValue } from 'kdbxweb';
import { SvgPath } from '../common';
import { remote } from 'electron';

const styles = (theme: Theme) =>  createStyles({
  outlined: {
    width: '100%',
    display: 'flex',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    position: 'relative',
    minWidth: 0,
    overflowY: 'visible',
    border: 1,
    borderColor: theme.palette.action.disabled,
    borderStyle: 'solid',
    borderRadius:'4px',
    '&:hover': {
      borderColor: theme.palette.text.primary
    },
  },

  outlinedCaption: {
    position:'absolute',
    left:0,
    top:0,
    transform:'translate(14px, -10px) ',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
  },

  outlinedContent: {
    width:'100%',
    marginLeft:  theme.spacing(1/2),
    marginRight: theme.spacing(1/2),
    alignItems:'center',
    display:'flex'
  },

  emptySplash: {
    fontSize: theme.typography.body1.fontSize,
    fontFamily: theme.typography.body1.fontFamily,
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary
  },

  ellipsis: {
    whiteSpace:'nowrap',
    overflow:'hidden',
    textOverflow: 'ellipsis'
  },
})

interface IAttachInputProps extends WithStyles<typeof styles> {
  entry: KdbxEntry,
  handleEntryUpdate: {(changeEntry: {(entry: KdbxEntry | KdbxGroup ): void}): void};
}

class AttachInput extends React.Component<IAttachInputProps> {
  constructor(props: IAttachInputProps) {
    super(props);
    this.handleAddAttachment = this.handleAddAttachment.bind(this);
    this.handleDeleteAttachment = this.handleDeleteAttachment.bind(this);
    this.handleSaveAttachment = this.handleSaveAttachment.bind(this);
  }

  handleAddAttachment() {
    const files = remote.dialog.showOpenDialogSync({properties: ['openFile']});
    if (!files){
      return
    }
    this.props.handleEntryUpdate(entry => {
      if (entry instanceof KdbxEntry) {
        files.forEach(file => {
          const buffer = fs.readFileSync(file);
          const binary: KdbxBinary = new Uint8Array(buffer).buffer;
          entry.binaries.set(path.basename(file), binary);
        })
      }
    });
    this.forceUpdate();
  }

  handleDeleteAttachment(key: string) {
    this.props.handleEntryUpdate(entry => {
      (entry as KdbxEntry).binaries.delete(key);
    });
    this.forceUpdate();
  }

  handleSaveAttachment(key: string) {
    const filePath = remote.dialog.showSaveDialogSync({defaultPath: key});
    if (!filePath){
      return
    }
    let buffer = this.props.entry.binaries.get(key);
    if (!buffer) {
      return
    }

    buffer = (buffer as KdbxBinaryWithHash).value
      ? (buffer as KdbxBinaryWithHash).value
      : buffer as KdbxBinary;
    const data = buffer instanceof ProtectedValue ? buffer.getBinary() : buffer;
    fs.writeFileSync(filePath, new Uint8Array(data));
  }

  public render() {
    const { classes, entry }  = this.props;
    return (
      <div className = {classes.outlined} >
        <Typography variant="caption" className = {classes.outlinedCaption}>&nbsp;Attached&nbsp;</Typography>
        <div className = {clsx(classes.outlinedContent, classes.ellipsis)}>
          { Array.from(entry.binaries.keys()).map(k =>
              <Tooltip title = {k} key = {k}>
                <Chip className = {classes.ellipsis}
                  style = {{margin:'2px'}}
                  variant = "outlined"
                  size = "small"
                  label = {k}
                  onDoubleClick = {()=>{this.handleSaveAttachment(k)}}
                  onDelete = {()=>{this.handleDeleteAttachment(k)}}
                />
              </Tooltip>
            )
          }
          {entry.binaries.size === 0 &&

            <div className = {clsx(classes.ellipsis, classes.emptySplash)}>
              No Attachments
            </div>

          }
          <div style = {{marginLeft:'auto'}}>
            <IconButton onClick = {this.handleAddAttachment}><SvgPath path = {SystemIcon.attachFile} /></IconButton>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AttachInput);


