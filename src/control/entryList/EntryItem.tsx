import { createStyles, darken, IconButton, Theme, WithStyles, withStyles } from '@material-ui/core';
import React, { FC } from 'react';
import {useSetRecoilState} from 'recoil';
import clsx from 'clsx';
import { DefaultFields, DefaultKeeIcon, SystemIcon } from '../../entity';
import { LightTooltip, SvgPath } from '../common';

import { KdbxItemWrapper } from '../../entity/model/KdbxItemWrapper';
import { selectedEntrySelector } from '../../entity/state/Atom';
import { itemContextMenuAtom, notificationAtom, openItemContextMenu } from '../../entity/state/PanelStateAtoms';


const styles = (theme: Theme) =>  createStyles({

  title: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    fontFamily: theme.typography.subtitle1.fontFamily,
    fontWeight: theme.typography.subtitle1.fontWeight,
    fontSize: theme.typography.subtitle1.fontSize,
    lineHeight: theme.typography.subtitle1.lineHeight,
    letterSpacing: theme.typography.subtitle1.letterSpacing,
  },

  titleSecondary: {
    color: theme.palette.text.secondary,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    fontFamily: theme.typography.caption.fontFamily,
    fontWeight: theme.typography.caption.fontWeight,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    letterSpacing: theme.typography.caption.letterSpacing,
  },

  inlineLeftIcon: {
    width: 10,
    height: 10,
    paddingRight: theme.spacing(1),
  },

  copyCursor: {
    cursor: 'pointer'
  },

  listItem : {
    position:'relative',
    display:'flex',
    flexDirection:'row',
    height: theme.spacing(9 + 1/2),
    borderBottom:'1px dotted lightgray',
    '&:hover': {
      backgroundColor: theme.palette.background.default,
      '& $contextMenuButton': {
        visibility: 'visible'
      }
    },
  },

  contextMenuButton: {
    visibility: 'hidden',
    display: 'flex',
    justifyContent: 'middle',
  },

  contextMenuIcon:{
    marginTop: (theme.spacing(9 + 1/2) - 46) / 2,
    marginBottom: (theme.spacing(9 + 1/2) - 46) / 2,
  },

  listItemSelected: {
    backgroundColor: darken(theme.palette.background.default, 0.03),
    '&:hover': {
      backgroundColor: darken(theme.palette.background.default, 0.03)
    },
    '& $contextMenuButton': {
      visibility: 'visible'
    }
  },

  mainIconDiv: {
    width: 50,
    height: 50,
    margin: 16,
    display:'flex'
  },

  mainIconContent: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
  },

  flexAlignRight: {
    marginLeft: 'auto',
  },

  itemContent: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0
  },

  itemContentRow: {
    display:'flex',
    flexDirection:'row',
    minWidth: 0,
    paddingRight: theme.spacing(1),
  },

  itemAttachIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginRight: 52,
    color: 'gray'
  },

  itemContentLastRow: {
    color: '#CCCCCC',
    marginRight: 30
  },

  titleFolder: {
    fontWeight: 'bold'
  },

  titleExpired: {
    textDecoration: 'line-through'
  },

  timeExpired: {
    color: theme.palette.secondary.main
  }

});

interface IProps extends WithStyles<typeof styles>{
  entry: KdbxItemWrapper
}

const EntryItem: FC<IProps> = ({classes, entry}) => {

  const changeSelection = useSetRecoilState(selectedEntrySelector);
  const setContextMenuState = useSetRecoilState(itemContextMenuAtom);
  const setNotification = useSetRecoilState(notificationAtom);

  const handleCopy = (fieldName: keyof typeof DefaultFields) => {
    const value = entry.getFieldUnprotected(fieldName);
    if (value) {
      navigator.clipboard.writeText(value);
      setNotification(`${DefaultFields[fieldName]} is copied`);
    }
    else {
      setNotification(`Nothing to copy`);
    }
  }

  console.log(`${entry.title} rendered`);

  return (
    <LightTooltip title = {entry.getFieldUnprotected('Notes')}>
      <div
        draggable
        onDragStart = {e => e.dataTransfer.setData('text', entry.uuid.id)}
        onClick = {() => changeSelection(entry)}
        className = {
          clsx(classes.listItem, entry.isSelected && classes.listItemSelected)
        }
      >
        <div style={{width:'8px', background: entry.bgColor }}/>

        <div
          className = {clsx(classes.mainIconDiv,  entry.hasPassword && classes.copyCursor)}
          onDoubleClick = {() => entry.hasPassword && handleCopy('Password')}
        >
          {entry.customIcon
            ? <img className = {classes.mainIconContent} src = {entry.customIcon} />
            : <SvgPath className = {classes.mainIconContent} path = {DefaultKeeIcon.get(entry.defaultIconId)} />
          }
        </div>
        <div className = {classes.itemContent}>
          <div className = {classes.itemContentRow}>
            <div className = {clsx(classes.title,
                               entry.isExpires &&
                                (entry.expiryTime?.valueOf() || 0) < Date.now() &&
                                classes.titleExpired,
                               entry.isGroup && classes.titleFolder
                             )}
            >
              {entry.title}
            </div>
            {entry.isExpires &&
              <div className={clsx(
                classes.titleSecondary,
                classes.flexAlignRight,
                entry.isExpires && (entry.expiryTime?.valueOf() || 0) < Date.now() && classes.timeExpired)
              }>
                <SvgPath className={classes.inlineLeftIcon} path = {SystemIcon.expire} />
                {entry.expiryTime?.toDateString()}
              </div>
            }
          </div>
          <div className = {classes.itemContentRow}>
            <div className={classes.titleSecondary}>
              {!entry.isGroup && entry.getFieldUnprotected('UserName') &&
                <>
                  <SvgPath
                    className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                    path = {SystemIcon.user}
                    onDoubleClick = {() => handleCopy('UserName')}
                  />
                  {entry.getFieldUnprotected('UserName')}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                </>
              }
              {!entry.isGroup && entry.getFieldUnprotected('URL') &&
                <>
                  <SvgPath
                    className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                    path = {DefaultKeeIcon.link}
                    onDoubleClick = {() => handleCopy('URL')}
                  />
                  {!entry.isGroup && entry.getFieldUnprotected('URL')}
                </>
              }
            </div>
          </div>

          <div className={clsx(classes.titleSecondary, classes.itemContentLastRow)} >
            { entry.tags.length > 0 &&
              <>
                <SvgPath className={classes.inlineLeftIcon} path = {SystemIcon.tag} />
                {entry.tags.join(', ')}
              </>
            }
          </div>
        </div>
        <div className = {classes.itemAttachIcon}>
          {!entry.isGroup &&  entry.binaries.size > 0 &&
            <SvgPath path = {SystemIcon.attachFile} />
          }
        </div>
        <div className = {classes.contextMenuButton}>
          <IconButton
            id = {'context-' + entry.uuid.id}
            className = {classes.contextMenuIcon}
            onClick = {e => setContextMenuState(openItemContextMenu(e.currentTarget, entry))}
          >
            <SvgPath path = {SystemIcon.dot_hamburger} />
          </IconButton>
        </div>

      </div>
    </LightTooltip>
  );

}

export default withStyles(styles, { withTheme: true })(React.memo(EntryItem));

