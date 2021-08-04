import clsx from "clsx";
import React from "react";
import { createStyles, darken, Paper, Theme, Typography,  withStyles, WithStyles} from "@material-ui/core";

import { KdbxEntry, ProtectedValue} from "kdbxweb";
import { KeeData, KeeDataContext, DefaultFields, DefaultKeeIcon, SystemIcon } from "../../entity";
import { scrollBar, SvgPath, LightTooltip } from "../common";
import { compareAsc } from "date-fns";
import { ContextMenu } from "./ContextMenu";

const styles = (theme: Theme) =>  createStyles({
  list: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    paddingTop: theme.spacing(2),
    overflow: 'hidden',
  },

  scrollBar: scrollBar,

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
    marginRight: theme.spacing(1)
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

  emptySplash: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(7),
    color: theme.palette.action.disabled
  }
});

interface Props extends WithStyles<typeof styles> {}

class ItemListPanel extends React.Component<Props> {
  static contextType = KeeDataContext;

  state = {
    entries: [] as KdbxEntry[],
    selectedEntryId: '',
    filterString: '',
    copiedFileld: '',
    sortField: 'Title',
    colorFilter: '',
    selectedTags: [] as string[]
  }

  #contextMenuRef = React.createRef<ContextMenu>();

  constructor(props : Props){
    super(props);
    this.handleGroupUpdate = this.handleGroupUpdate.bind(this);
    this.handleSearchUpdate = this.handleSearchUpdate.bind(this);
    this.handleSortUpdate = this.handleSortUpdate.bind(this);
    this.handleContextMenuOpen = this.handleContextMenuOpen.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleColorFilter = this.handleColorFilter.bind(this);
    this.handleTagFilter = this.handleTagFilter.bind(this);
    this.showCopyNotify = this.showCopyNotify.bind(this);
  }

  componentDidMount() {
    const keeData = (this.context as KeeData);
    keeData.addGroupListener(this.handleGroupUpdate);
    keeData.addSearchFilterListener(this.handleSearchUpdate);
    keeData.addSortListener(this.handleSortUpdate);
    keeData.addColorFilterListener(this.handleColorFilter);
    keeData.addTagFilterListener(this.handleTagFilter);
    this.handleGroupUpdate(keeData.selectedGroupId);
  }

  componentWillUnmount() {
    const keeData = (this.context as KeeData);
    keeData.removeGroupListener(this.handleGroupUpdate);
    keeData.removeSearchFilterListener(this.handleSearchUpdate);
    keeData.removeSortListener(this.handleSortUpdate);
    keeData.removeColorFilterListener(this.handleColorFilter);
    keeData.removeTagFilterListener(this.handleTagFilter);
  }

  handleSearchUpdate(query: string) {
    this.setState({filterString: query});
  }

  handleSortUpdate(sortField: string) {
    this.setState({sortField: sortField});
  }

  handleGroupUpdate(groupId: string) {
    if (groupId === KeeData.allGroupId) {
      this.setState({entries: Array.from<KdbxEntry>(
        ((this.context as KeeData).database.getDefaultGroup().allEntries()))});
      return;
    }
    const selectedGroup = (this.context as KeeData).database.getGroup(groupId);
    const entries = selectedGroup ? selectedGroup.entries : [];
    this.setState({entries: entries});
  }

  handleColorFilter(colorFilter: string) {
    this.setState({colorFilter: colorFilter});
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
    entry: KdbxEntry,
    event?: React.MouseEvent<Element, MouseEvent>
  ): void {
    event?.stopPropagation();
    const field = entry.fields.get(fieldName);
    if (field) {
      const copyText = (field instanceof ProtectedValue)
        ? field.getText()
        : field.toString();
      navigator.clipboard.writeText(copyText);
      this.setState({ copiedFileld: DefaultFields[fieldName as keyof typeof DefaultFields] });
      this.showCopyNotify(entry.uuid.id);
    }
  }

  handleContextMenuOpen(event: React.MouseEvent<HTMLDivElement>, entry: KdbxEntry) {
    event.preventDefault();
    this.#contextMenuRef?.current?.handleContextMenuOpen(event, entry);
  }

  filter(entry: KdbxEntry, filterString: string, selectedTag: string[]): boolean {
    let filter = entry.fields.get('Title')?.toString().toLowerCase().includes(filterString) ||
      entry.fields.get('UserName')?.toString().toLowerCase().includes(filterString) ||
      entry.fields.get('URL')?.toString().toLowerCase().includes(filterString) as boolean
    if (this.state.colorFilter !== '') {
       filter = filter && entry.bgColor === this.state.colorFilter;
    }
    if (this.state.selectedTags.length > 0) {
      filter = filter && entry.tags.filter(i => selectedTag.includes(i)).length > 0
    }
    return filter;
  }

  sort(entryA: KdbxEntry, entryB: KdbxEntry, sortingField: string) {
    if (sortingField === 'creationTime') {
      const timeA = entryA.times.creationTime;
      const timeB = entryB.times.creationTime;
      if (!timeA || !timeB) {return -1}
      return  compareAsc(timeA, timeB);
    }
    const fieldA = entryA.fields.get(sortingField);
    const fieldB = entryB.fields.get(sortingField);
    if (!fieldA || !fieldB) { return -1 }
    return fieldA.toString().localeCompare(fieldB.toString());
  }

  handleTagFilter(tags: string[]) {
    this.setState({selectedTags: tags});
  }

  render(){
    const { classes } = this.props;
    const { entries, filterString, selectedTags } = this.state;

    if (entries.length === 0) {
      return (<Typography variant='h2' className = {classes.emptySplash}>No Items</Typography>)
    }

    return (
      <>
        <div className = {clsx(classes.list, classes.scrollBar)}>
          {entries.filter(entry => this.filter(entry, filterString, selectedTags))
            .sort((a, b) => this.sort(a, b, this.state.sortField))
            .map((entry) =>
            <LightTooltip
              key = {entry.uuid.id}
              title = {
                entry.fields.get('Notes')
                  ? <> {entry.fields.get('Notes')} </>
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
                <div style={{width:'8px', background: entry.bgColor }}/>
                <div
                  className = {clsx(classes.mainIconDiv, classes.copyCursor)}
                  onDoubleClick = {event => this.handleCopy('Password', entry, event)}
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
                    <div className={classes.title}>
                      {!entry.fields.get('Title') ? "(No Title)" : entry.fields.get('Title')}
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
                      { entry.fields.get('UserName') &&
                        <>
                          <SvgPath
                            className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                            path = {SystemIcon.user}
                            onDoubleClick = {event => this.handleCopy('UserName', entry, event)}
                          />
                          {entry.fields.get('UserName')}
                          &nbsp;&nbsp;&nbsp;&nbsp;
                        </>
                      }
                      { entry.fields.get('URL') &&
                        <>
                          <SvgPath
                            className={clsx(classes.inlineLeftIcon, classes.copyCursor)}
                            path = {DefaultKeeIcon.link}
                            onDoubleClick = {event => this.handleCopy('URL', entry, event)}
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
                    onTransitionEnd = {() => this.hideCopyNotify(entry.uuid.id)}
                  >
                    <Typography>
                      {this.state.copiedFileld} copied
                    </Typography>
                  </Paper>
                </div>
                <div className = {classes.itemAttachIcon}>
                  { entry.binaries.size > 0 && <SvgPath path = {SystemIcon.attachFile} /> }
                </div>

              </div>
            </LightTooltip>
          )}
        </div>
        <ContextMenu ref = {this.#contextMenuRef} handleCopy = {this.handleCopy} />
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ItemListPanel);
