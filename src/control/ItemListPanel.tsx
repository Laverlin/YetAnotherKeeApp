import clsx from "clsx";
import React from "react";
import { createStyles, darken, Divider, ListItemIcon, Menu, MenuItem, Paper, Theme, Tooltip,  Typography,  withStyles, WithStyles} from "@material-ui/core";

import { KdbxEntry, ProtectedValue} from "kdbxweb";
import { DefaultFields, DefaultKeeIcon, SystemIcon } from "../entity/GlobalObject";
import { KeeDataContext } from "../entity/Context";
import KeeData from "../entity/KeeData";
import { SvgPath } from "./helper/SvgPath";
import DateFnsUtils from "@date-io/date-fns";

const styles = (theme: Theme) =>  createStyles({
  list: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    paddingTop: theme.spacing(2),
    overflow: 'hidden',
    "overflow-y": 'overlay',
    "&::-webkit-scrollbar" : {
      width: '10px',
    },
    "&::-webkit-scrollbar-track": {
      background: 'transparent',
    },
    "&::-webkit-scrollbar-thumb": {
      background: 'transparent',
      borderRadius: '6px',
      backgroundClip: 'padding-box',
      borderRight: '2px transparent solid',
      borderLeft: '2px transparent solid'
    },
    "&:hover": {
      "&::-webkit-scrollbar-thumb": {
        backgroundColor:'rgba(0, 0, 0, 0.4)'
      }
    }
  },

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
    height:86,
    borderBottom:'1px dotted lightgray',
    "&:hover": {
      backgroundColor: theme.palette.background.default
    }
  },

  listItemSelected: {
    backgroundColor: darken(theme.palette.background.default, 0.03),
    "&:hover": {
      backgroundColor: darken(theme.palette.background.default, 0.03)
    }
  },

  mainIconDiv: {
    width:50, height:50, margin:16, display:'flex'
  },

  mainIconContent: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
  },

  flexAlignRight: {
    marginLeft: 'auto'
  },

  itemContent: {
    display:'flex',
    flexDirection:'column',
    width:'100%',
    minWidth:0
  },

  itemContentRow: {
    display:'flex',
    flexDirection:'row',
    minWidth:0,
    paddingRight: theme.spacing(1),
  },

  itemAttachIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginRight: 12,
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
});

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(12),
  },
}))(Tooltip);


interface Props extends WithStyles<typeof styles> {}

class ItemListPanel extends React.Component<Props> {
  static contextType = KeeDataContext;

  state = {
    entries: [] as KdbxEntry[] | undefined,
    selectedEntryId: '',
    filterString: '',
    copiedFileld: '',
    isContextMenuOpen: false,
    mouseX: 0,
    mouseY: 0,
    selectedEntry: undefined as KdbxEntry | undefined,
    sortField: 'Title'
  }

  constructor(props : Props){
    super(props);
    this.handleGroupUpdate = this.handleGroupUpdate.bind(this);
    this.handleSearchUpdate = this.handleSearchUpdate.bind(this);
    this.handleSortUpdate = this.handleSortUpdate.bind(this);
    this.handleContextMenuOpen = this.handleContextMenuOpen.bind(this);
    this.handleContextMenuClose = this.handleContextMenuClose.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
  }

  componentDidMount() {
    const keeData = (this.context as KeeData);
    keeData.addGroupListener(this.handleGroupUpdate);
    const entities = keeData.database.getDefaultGroup().entries;
    this.setState({entries: Array.from(entities)});
    keeData.addSearchFilterListener(this.handleSearchUpdate);
    keeData.addSortListener(this.handleSortUpdate);
  }

  componentWillUnmount() {
    const keeData = (this.context as KeeData);
    keeData.removeGroupListener(this.handleGroupUpdate);
    keeData.removeSearchFilterListener(this.handleSearchUpdate);
    keeData.removeSortListener(this.handleSortUpdate);
  }

  handleSearchUpdate(query: string) {
    this.setState({filterString: query});
  }

  handleSortUpdate(sortField: string) {
    this.setState({sortField: sortField});
  }

  handleGroupUpdate(entries: KdbxEntry[]) {
    this.setState({entries: entries});
  }

  handleClick(entry: KdbxEntry) {
    (this.context as KeeData).notifyEntrySubscribers(entry);
    this.setState({selectedEntryId: entry.uuid.id})
  }

  showCopyNotify(id: string) {
    const notify = document.getElementById('notify-' + id);
    if (notify) {
      notify.style.opacity = '1';
      notify.style.transition = 'all 350ms linear';
    }
  }

  hideCopyNotify(id: string) {
    const notify = document.getElementById('notify-' + id);
    if (notify) {
      notify.style.opacity = '0';
      notify.style.transition = 'all 350ms linear 1s';
    }
  }

  handleCopy(
    fieldName: string,
    event: React.MouseEvent<Element, MouseEvent>,
    entry: KdbxEntry | undefined = undefined
  ): void {
    event.stopPropagation();
    entry = entry ?? this.state.selectedEntry;
    if (!entry) {
      return;
    }
    const field = entry.fields.get(fieldName);
    if (field) {
      const copyText = (fieldName === 'Password')
        ? (field  as ProtectedValue).getText()
        : field.toString();
      navigator.clipboard.writeText(copyText);
      this.setState({
        copiedFileld: DefaultFields[fieldName as keyof typeof DefaultFields],
        isContextMenuOpen: false
      });
      this.showCopyNotify(entry.uuid.id);
    }
  }

  handleContextMenuOpen(event: React.MouseEvent<HTMLDivElement>, entry: KdbxEntry) {
    event.preventDefault();
    this.setState({
      isContextMenuOpen: true,
      mouseX: event.clientX,
      mouseY: event.clientY,
      selectedEntry: entry,
    });
  }

  handleContextMenuClose() {
    this.setState({isContextMenuOpen: false});
  }

  filter(entry: KdbxEntry, filterString: string): boolean {
    return entry.fields.get('Title')?.toString().toLowerCase().includes(filterString) ||
      entry.fields.get('UserName')?.toString().toLowerCase().includes(filterString) ||
      entry.fields.get('URL')?.toString().toLowerCase().includes(filterString) as boolean
  }

  sort(entryA: KdbxEntry, entryB: KdbxEntry, sortingField: string) {
    if (sortingField === 'creationTime') {
      const timeA = entryA.times.creationTime;
      const timeB = entryB.times.creationTime;
      if (!timeA || !timeB) {return -1}
      return  (timeA.valueOf() - timeB.valueOf());
    }
    const fieldA = entryA.fields.get(sortingField);
    const fieldB = entryB.fields.get(sortingField);
    if (!fieldA || !fieldB) { return -1 }
    return fieldA.toString().localeCompare(fieldB.toString());
  }

  render(){
    const { classes } = this.props;
    const { entries, filterString } = this.state;

    return (
      <>
        <div className = {classes.list}>
          {entries?.filter(entry => this.filter(entry, filterString))
            .sort((a, b) => this.sort(a, b, this.state.sortField))
            .map((entry) =>
            <LightTooltip
              key = {entry.uuid.id}
              title = {
                entry.fields.get('Notes')
                  ? <React.Fragment> {entry.fields.get('Notes')} </React.Fragment>
                  : ""
              }
            >
              <div
                onClick = {() => this.handleClick(entry)}
                onContextMenu = {event => this.handleContextMenuOpen(event, entry)}
                className = {
                  clsx(classes.listItem, (this.state.selectedEntryId === entry.uuid.id) && classes.listItemSelected)
                }
              >
                <div
                  className = {clsx(classes.mainIconDiv, classes.copyCursor)}
                  onDoubleClick = {event => this.handleCopy('Password', event, entry)}
                >
                  {entry.customIcon && !entry.customIcon.empty
                    ? <img
                        className = {classes.mainIconContent}
                        src={(this.context as KeeData).getCustomIcon(entry.customIcon.id)}
                      >
                      </img>
                    : <SvgPath className = {classes.mainIconContent} path = {DefaultKeeIcon.get(entry.icon ?? 0)} />
                  }

                </div>
                <div className = {classes.itemContent}>
                  <div className = {classes.itemContentRow}>
                    <div className={classes.title}>
                      {entry.fields.get('Title') === '' ? "(No Title)" : entry.fields.get('Title')}
                    </div>
                    {entry.times.expires &&
                      <div className={clsx(classes.titleSecondary, classes.flexAlignRight)}>
                        <SvgPath className={classes.inlineLeftIcon} path = {SystemIcon.expire} />
                        {entry.times.expiryTime?.toDateString()}
                      </div>
                    }
                  </div>
                  <div className = {classes.itemContentRow}>
                    <div className={classes.titleSecondary}>
                      { entry.fields.get('UserName') !== '' &&
                        <>
                          <SvgPath
                            className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                            path = {SystemIcon.user}
                            onDoubleClick = {event => this.handleCopy('UserName', event, entry)}
                          />
                          {entry.fields.get('UserName')}
                        </>
                      }
                    </div>

                  </div>
                  <div className={classes.titleSecondary}>
                    { entry.fields.get('URL') !== '' &&
                      <>
                        <SvgPath
                          className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                          path = {DefaultKeeIcon.link}
                          onDoubleClick = {event => this.handleCopy('URL', event, entry)}
                        />
                        {entry.fields.get('URL')}
                      </>
                    }
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
                    className={classes.notifyBase}
                    onTransitionEnd={() => this.hideCopyNotify(entry.uuid.id)}
                  >
                    <Typography>
                      {this.state.copiedFileld} copied
                    </Typography>
                  </Paper>
                </div>
                <div className = {classes.itemAttachIcon}>
                  { entry.binaries.size > 0 && <SvgPath path = {SystemIcon.attachFile} /> }
                </div>
                <div style={{width:'8px', backgroundColor: entry.bgColor}}/>
              </div>
            </LightTooltip>
          )}
        </div>
        <Menu
          keepMounted
          open = {this.state.isContextMenuOpen}
          onClose = {this.handleContextMenuClose}
          anchorReference = "anchorPosition"
          anchorPosition = {{ top: this.state.mouseY, left: this.state.mouseX }}
        >
          <MenuItem onClick = {event => this.handleCopy('Password', event)}>
            <ListItemIcon>
              <SvgPath path = {DefaultKeeIcon.key}/>
            </ListItemIcon>
            Copy Password
          </MenuItem>
          <MenuItem onClick = {event => this.handleCopy('UserName', event)}>
            <ListItemIcon>
              <SvgPath path = {SystemIcon.user}/>
            </ListItemIcon>
            Copy User Name
          </MenuItem>
          <MenuItem onClick = {event => this.handleCopy('URL', event)}>
            <ListItemIcon>
              <SvgPath path = {DefaultKeeIcon.link} />
            </ListItemIcon>
            Copy Url
          </MenuItem>
          <Divider/>
          <MenuItem onClick={this.handleContextMenuClose}>Go to Url</MenuItem>
          <MenuItem onClick={this.handleContextMenuClose}>Auto-Type</MenuItem>
        </Menu>
      </>
    )
  }

}

export default withStyles(styles, { withTheme: true })(ItemListPanel);
