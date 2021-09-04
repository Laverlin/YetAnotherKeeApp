import { createStyles, darken, IconButton, Paper, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import { KdbxEntry, KdbxGroup } from 'kdbxweb';
import * as React from 'react';
import clsx from 'clsx';
import { DefaultFields, DefaultKeeIcon, KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { LightTooltip, SvgPath } from '../common';
import { EntryChangedEvent, EntrySelectedEvent } from '../../entity/KeeEvent';
import { EntryContextMenu } from './EntryContextMenu';


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

  notifyBase: {
    position:'absolute',
    bottom:0,
    right:40,
    opacity: 0,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(1/2),
    paddingBottom: theme.spacing(1/2),
  },

  titleFolder: {
    fontWeight: 'bold'
  }

});

interface IEntryListItemProps extends WithStyles<typeof styles>{
  entry: KdbxEntry | KdbxGroup;
  onCopy: (fieldName: keyof typeof DefaultFields, entry: KdbxEntry) => void;
  contextMenuRef: React.RefObject<EntryContextMenu>;
}

interface IEntryListItemState {
  isSelected: boolean
}

class EntryListItem extends React.Component<IEntryListItemProps, IEntryListItemState> {
  constructor(props: IEntryListItemProps) {
    super(props);

    this.state = {
      isSelected: false
    }

    this.handleEntrySelected = this.handleEntrySelected.bind(this);
    this.handleEntryChanged = this.handleEntryChanged.bind(this);
  }
  static contextType = KeeDataContext;
  #keeData = this.context as KeeData;

  componentDidMount() {
    this.#keeData = this.context as KeeData;
    this.#keeData.addEventListener(EntrySelectedEvent, this.props.entry.uuid, this.handleEntrySelected);
    this.#keeData.addEventListener(EntryChangedEvent, this.props.entry.uuid, this.handleEntryChanged);
  }

  componentWillUnmount() {
    this.#keeData.removeEventListener(EntrySelectedEvent, this.props.entry.uuid, this.handleEntrySelected);
    this.#keeData.removeEventListener(EntryChangedEvent, this.props.entry.uuid, this.handleEntryChanged);
  }

  get entryNotes() : string {
    return (this.props.entry instanceof KdbxEntry
      ? this.props.entry.fields.get('Notes') as string
      : this.props.entry.notes)
      || '';
  }

  get entryTitle() : string {
    return (this.props.entry instanceof KdbxEntry
      ? this.props.entry.fields.get('Title') as string
      : this.props.entry.name)
      || '(No Title)';
  }

  handleEntrySelected(event: EntrySelectedEvent) {
    this.setState({isSelected: !event.isRemoveSelection});
  }

  handleSelectionChanged() {
    this.#keeData.setSelectedEntry(this.props.entry.uuid);
  }

  handleEntryChanged(_: EntryChangedEvent) {
    this.forceUpdate();
  }

  handleContextMenuOpen() {
    let menuAnchor = document.getElementById('context-' + this.props.entry.uuid.id);
    if (!this.props.contextMenuRef.current || !menuAnchor)
      return;
    this.props.contextMenuRef.current.handleContextMenuOpen(menuAnchor, this.props.entry);
  }

  public render() {
    const {entry, classes} = this.props;
    const {isSelected} = this.state;


    return (
      <LightTooltip title = {this.entryNotes}>
        <div
          draggable
          onDragStart = {e => e.dataTransfer.setData('text', entry.uuid.id)}
          onClick = {() => this.handleSelectionChanged()}
          className = {
            clsx(classes.listItem, isSelected && classes.listItemSelected)
          }
        >
          <div style={{width:'8px', background: entry instanceof KdbxEntry ? entry.bgColor : '' }}/>

          <div
            className = {clsx(classes.mainIconDiv, classes.copyCursor)}
            onDoubleClick = {() => this.props.onCopy('Password', entry as KdbxEntry)}
          >
            {entry.customIcon && !entry.customIcon.empty
              ? <img
                  className = {classes.mainIconContent}
                  src = {(this.context as KeeData).getCustomIcon(entry.customIcon.id)}
                />
              : <SvgPath className = {classes.mainIconContent} path = {DefaultKeeIcon.get(entry.icon ?? 0)} />
            }

          </div>
          <div className = {classes.itemContent}>
            <div className = {classes.itemContentRow}>
              <div className={clsx(classes.title, entry instanceof KdbxGroup && classes.titleFolder)}>{this.entryTitle}</div>
              {entry.times.expires &&
                <div className={clsx(classes.titleSecondary, classes.flexAlignRight)}>
                  <SvgPath className={classes.inlineLeftIcon} path = {SystemIcon.expire} />
                  {entry.times.expiryTime?.toDateString()}
                </div>
              }
            </div>
            <div className = {classes.itemContentRow}>
              <div className={classes.titleSecondary}>
                {entry instanceof KdbxEntry && entry.fields.get('UserName') &&
                  <>
                    <SvgPath
                      className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                      path = {SystemIcon.user}
                      onDoubleClick = {() => this.props.onCopy('UserName', entry as KdbxEntry)}
                    />
                    {entry.fields.get('UserName')}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                  </>
                }
                {entry instanceof KdbxEntry && entry.fields.get('URL') &&
                  <>
                    <SvgPath
                      className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                      path = {DefaultKeeIcon.link}
                      onDoubleClick = {() => this.props.onCopy('URL', entry as KdbxEntry)}
                    />
                    {entry.fields.get('URL')}
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
            <Paper
              id = {'notify-' + entry.uuid.id}
              className = {classes.notifyBase}
            >
              <Typography />
            </Paper>
          </div>
          <div className = {classes.itemAttachIcon}>
            {entry instanceof KdbxEntry &&  entry.binaries.size > 0 &&
              <SvgPath path = {SystemIcon.attachFile} />
            }
          </div>
          <div className = {classes.contextMenuButton}>
            <IconButton
              id = {'context-' + entry.uuid.id}
              className = {classes.contextMenuIcon}
              onClick = {() => this.handleContextMenuOpen()}
            >
              <SvgPath path = {SystemIcon.dot_hamburger} />
            </IconButton>
          </div>

        </div>
      </LightTooltip>
    );
  }
}

export default withStyles(styles, { withTheme: true })(EntryListItem);
