import clsx from "clsx";
import React from "react";
import { createStyles, Theme, Typography,  withStyles, WithStyles} from "@material-ui/core";

import { KdbxEntry, KdbxGroup, ProtectedValue} from "kdbxweb";
import { KeeData, KeeDataContext, DefaultFields} from "../../entity";
import { scrollBar } from "../common";
import { compareAsc } from "date-fns";
import { EntryContextMenu } from "./EntryContextMenu";
import { FilterChangedEvent, GroupSelectedEvent } from "../../entity/KeeEvent";
import EntryListItem from "./EntryListItem";

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

  emptySplash: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(7),
    color: theme.palette.action.disabled
  }
});

interface Props extends WithStyles<typeof styles> {}

class EntryListPanel extends React.Component<Props> {
  static contextType = KeeDataContext;
  #keeData: KeeData = this.context;

  state = {
    entries: [] as (KdbxEntry | KdbxGroup)[],
    sortField: 'Title',
  }

  #contextMenuRef = React.createRef<EntryContextMenu>();

  constructor(props : Props){
    super(props);
    this.handleGroupSelected = this.handleGroupSelected.bind(this);
    this.handleFilterChanged = this.handleFilterChanged.bind(this);
    this.sort = this.sort.bind(this);
    this.filter = this.filter.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.showCopyNotify = this.showCopyNotify.bind(this);
  }

  componentDidMount() {
    this.#keeData = (this.context as KeeData);
    this.#keeData.addEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleGroupSelected);
    this.#keeData.addEventListener(FilterChangedEvent, KeeData.anyEntryUuid, this.handleFilterChanged);
    this.#keeData.setSelectedGroup(KeeData.allGroupUuid);
  }

  componentWillUnmount() {
    this.#keeData.removeEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleGroupSelected);
    this.#keeData.removeEventListener(FilterChangedEvent, KeeData.anyEntryUuid, this.handleFilterChanged);
  }

  // get the list of entries form the new group
  //
  handleGroupSelected(keeEvent: GroupSelectedEvent) {
    if (keeEvent.entryId.equals(KeeData.allGroupUuid)) {
      this.setState({entries: this.#keeData.allEntries});
      return;
    }
    if (keeEvent.entryId.equals(this.#keeData.recycleBinUuid)) {
      this.setState({
        entries: Array.from(this.#keeData.recycleBinGroup.allGroupsAndEntries())
          .filter(e => !e.uuid.equals(this.#keeData.recycleBinUuid))
      });
      return;
    }
    const selectedGroup = this.#keeData.database.getGroup(keeEvent.entryId);
    const entries = selectedGroup ? selectedGroup.entries : [];
    this.setState({entries: entries});
  }

  handleFilterChanged(_: FilterChangedEvent) {
    this.forceUpdate();
  }

  handleCopy(fieldName: keyof typeof DefaultFields, entry: KdbxEntry): void {
    const field = entry.fields.get(fieldName);
    if (!field)
      return;

    const copyText = (field instanceof ProtectedValue)
      ? field.getText()
      : field.toString();
    navigator.clipboard.writeText(copyText);
    this.showCopyNotify(entry.uuid.id, fieldName);
  }

  showCopyNotify(id: string, fieldName: keyof typeof DefaultFields) {
    const notify = document.getElementById('notify-' + id);
    if (!notify)
      return;

    (notify.childNodes[0] as HTMLSpanElement).innerText = DefaultFields[fieldName] + ' is copied';
    notify.style.opacity = '1';
    notify.style.transition = 'all 350ms linear';
    notify.ontransitionend = () => {
      notify.style.opacity = '0';
      notify.style.transition = 'all 350ms linear 1s';
    }
  }

  filter(entry: KdbxEntry | KdbxGroup): boolean {
    let filter = true;
    if (this.#keeData.entryFilter.queryFilter && entry instanceof KdbxEntry) {
      filter = !!Array.from(entry.fields.values())
        .find(v => v.includes(this.#keeData.entryFilter.queryFilter));
    }
    if (this.#keeData.entryFilter.colorFilter && entry instanceof KdbxEntry) {
       filter = filter && entry.bgColor === this.#keeData.entryFilter.colorFilter;
    }
    if (this.#keeData.entryFilter.tagFilter.length > 0) {
      filter = filter && entry.tags.filter(i => this.#keeData.entryFilter.tagFilter.includes(i)).length > 0
    }
    return filter;
  }

  sort(entryA: KdbxEntry | KdbxGroup, entryB: KdbxEntry | KdbxGroup) {
    const sortingField = this.#keeData.entryFilter.sortField;
    if (sortingField === 'creationTime') {
      const timeA = entryA.times.creationTime;
      const timeB = entryB.times.creationTime;
      if (!timeA || !timeB) {return -1}
      return  compareAsc(timeA, timeB);
    }
    if (entryA instanceof KdbxGroup || entryB instanceof KdbxGroup)
      return 0;

    const fieldA = entryA.fields.get(sortingField) as string || '';
    const fieldB = entryB.fields.get(sortingField) as string || '';
    return fieldA.localeCompare(fieldB);
  }


  render(){

    const { classes } = this.props;
    const filteredEntries = this.state.entries.filter(this.filter);

    if (filteredEntries.length === 0) {
      return (
        <Typography variant='h2' className = {classes.emptySplash}>
          No Items <br />
          Select another group or change filter criteria
        </Typography>
      )
    }

    return (
      <>
        <EntryContextMenu
          ref = {this.#contextMenuRef}
          handleCopy = {this.handleCopy}
        />
        <div className = {clsx(classes.list, classes.scrollBar)}>
          {filteredEntries
            .sort(this.sort)
            .map(entry =>
              <EntryListItem
                key = {entry.uuid.id}
                entry = {entry}
                onCopy = {this.handleCopy}
                contextMenuRef = {this.#contextMenuRef}
              />
            )
          }
        </div>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(EntryListPanel);
