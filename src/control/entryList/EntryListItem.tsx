import { createStyles, darken, IconButton, Theme, WithStyles, withStyles } from '@material-ui/core';
import React, { FC } from 'react';
import { useSetRecoilState, useRecoilValue} from 'recoil';
import clsx from 'clsx';
import {
  DefaultKeeIcon,
  SystemIcon,
  entryContextMenuAtom,
  notificationAtom,
  openItemContextMenu,
  itemStateAtom,
  selectItemSelector,
  displayFieldName
} from '../../entity';
import { LightTooltip, SvgPath } from '../common';
import { KdbxUuid } from 'kdbxweb';

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
  },

  changeMark: {
    position:'absolute',
    margin: '10px',
    height: '10px',
    width: '10px',
    backgroundColor: '#f35b04',
    borderRadius: '50%',
    display: 'block',
  }

});

interface IProps extends WithStyles<typeof styles>{
  entryUuid: KdbxUuid
}

const EntryListItem: FC<IProps> = ({classes, entryUuid}) => {

  const setSelection = useSetRecoilState(selectItemSelector);
  const setContextMenuState = useSetRecoilState(entryContextMenuAtom);
  const setNotification = useSetRecoilState(notificationAtom);
  const entry = useRecoilValue(itemStateAtom(entryUuid.id));

  const handleCopy = (fieldName: string) => {
    const value = entry.getFieldUnprotected(fieldName);
    if (value) {
      navigator.clipboard.writeText(value);
      setNotification(`${displayFieldName(fieldName)} is copied`);
    }
    else {
      setNotification(`Nothing to copy`);
    }
  }

  return (
    <LightTooltip title = {entry.getFieldUnprotected('Notes')}>
      <div
        draggable
        onDragStart = {e => e.dataTransfer.setData('text', entry.uuid.id)}
        onClick = {() => setSelection(entry.uuid)}
        className = {
          clsx(classes.listItem, entry.isSelected && classes.listItemSelected)
        }
      >
        <div style={{width:'8px', background: entry.bgColor }}/>
        {entry.isChanged && <div className = {classes.changeMark} />}
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
            <div className = {
              clsx(classes.title, entry.isExpiredNow && classes.titleExpired, entry.isGroup && classes.titleFolder)
            }>
              {entry.title}
            </div>
            {entry.isExpires &&
              <div className={clsx(
                classes.titleSecondary,
                classes.flexAlignRight,
                entry.isExpiredNow && classes.timeExpired)
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

export default withStyles(styles, { withTheme: true })(React.memo(EntryListItem));

