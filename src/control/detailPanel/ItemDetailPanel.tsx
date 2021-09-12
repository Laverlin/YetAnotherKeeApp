import React, { Component } from "react";
import { KdbxEntry, KdbxEntryField, KdbxGroup, ProtectedValue } from "kdbxweb";
import { DefaultKeeIcon, SystemIcon } from "../../entity/GlobalObject";
import { KeeDataContext } from "../../entity/Context";
import { scrollBar, SvgPath } from "../common";
import KeeData from "../../entity/KeeData";
import clsx from 'clsx';

import Autocomplete from '@material-ui/lab/Autocomplete';

import {
  Chip,
  createStyles,
  IconButton,
  Input,
  TextField,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import ItemToolbar from "./ItemToolbar";
import ItemInfoCard from "./ItemInfoCard";
import FieldInput from "./FieldInput";
import AttachInput from "./AttachInput";
import IconChoicePanel from "./IconChoicePanel";
import ColorChoicePanel from "./ColorChoicePanel";
import CustomPropertyPanel from "./CustomPropertyPanel";
import { EntryChangedEvent, EntrySelectedEvent, GroupSelectedEvent } from "../../entity/KeeEvent";
import PasswordGeneratorPanel from "./PasswordGeneratorPanel";

const styles = (theme: Theme) =>  createStyles({

  itemTitle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display:'inline-flex',
    flexDirection:'row',
    height: theme.spacing(9),
    paddingTop: theme.spacing(1),
  },

  titleStyle: {
    fontSize: theme.typography.h4.fontSize,
  },

  titleIcon:{
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: theme.spacing(2),
    paddingTop: 4
  },
  titleIconButton:{
    width: theme.spacing(8),
    height: theme.spacing(8),
    marginLeft: theme.spacing(2)
  },

  titleFlagIcon:{
    width: theme.spacing(6),
    height: theme.spacing(6),
    margin: theme.spacing(1),
  },

  entityItems:{
    position: 'absolute',
    top: theme.spacing(10),
    left: 0,
    right: 0,
    bottom: theme.spacing(10),
    padding: theme.spacing(2),
    paddingRight: theme.spacing(1),
    overflow:'hidden',
   },

   scrollBar: scrollBar,

  fieldInput: {
    padding: theme.spacing(1),
  },

  ellipsis: {
    whiteSpace:'nowrap',
    overflow:'hidden',
    textOverflow: 'ellipsis'
  },

  tagChip: {
    margin: '2px',
    maxWidth: '100px'
  },

  fieldMix:{
    padding: theme.spacing(1),
    display:'flex',
    flexDirection:'row',
    minWidth:'0',
    width:'100%'
  },

  emptySplash: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(7),
    color: theme.palette.action.disabled
  },

  smallIcon: {
    width: 10,
    height: 10
  }

});

class FieldInfo {
  sortOrder: number = 0;
  isMultiline: boolean = false;
  isProtected: boolean = false;
}

interface Props extends WithStyles<typeof styles> {}

class ItemDetailPanel extends Component<Props> {
  static contextType = KeeDataContext;

  state = {
    entry: undefined as KdbxEntry | KdbxGroup | undefined,
    isIconPanelOpen: false,
    isColorPanelOpen: false,
    isPropertyPanelOpen: false,
    isPasswordPanelOpen: false,
    historyIndex: 0,
    isInHistory: false
  }
  #iconPanelAncor: Element | null = null;
  #colorPanelAncor: Element | null = null;
  #propertyPanelAncor: Element | null = null;
  #passwordPanelAncor: Element | null = null;

  constructor(props : Props) {
    super(props);
    this.handleGroupOrEntrySelected = this.handleGroupOrEntrySelected.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleTagsChange = this.handleTagsChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleEntryChanged = this.handleEntryChanged.bind(this);
    this.handleHistoryState = this.handleHistoryState.bind(this);
    this.handleShowPassPanel = this.handleShowPassPanel.bind(this);
  }

  componentDidMount() {
    const keeData = (this.context as KeeData);
    keeData.addEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleGroupOrEntrySelected);
    keeData.addEventListener(EntrySelectedEvent, KeeData.anyEntryUuid, this.handleGroupOrEntrySelected);
  }

  componentWillUnmount() {
    const keeData = (this.context as KeeData);
    keeData.removeEventListener(GroupSelectedEvent, KeeData.anyEntryUuid, this.handleGroupOrEntrySelected);
    keeData.removeEventListener(EntrySelectedEvent, KeeData.anyEntryUuid, this.handleGroupOrEntrySelected);
    if (this.state.entry)
      keeData.removeEventListener(EntryChangedEvent, this.state.entry.uuid, this.handleEntryChanged);
  }

  handleEntryChanged(_: EntryChangedEvent) {
    if (this.state.entry instanceof KdbxEntry && !this.state.isInHistory)
      this.state.historyIndex = this.state.entry.history.length;
    this.forceUpdate();
  }

  async handleGroupOrEntrySelected(event: GroupSelectedEvent | EntrySelectedEvent) {
    const keeData = (this.context as KeeData);
    const entry = keeData.tryGetEntryOrGroup(event.entryId);
    if (!entry) {
      return
    }
    if (this.state.entry)
      keeData.removeEventListener(EntryChangedEvent, this.state.entry.uuid, this.handleEntryChanged);
    keeData.addEventListener(EntryChangedEvent, entry.uuid, this.handleEntryChanged);
    this.setState({
      entry: entry,
      isInHistory: false,
      historyIndex: entry instanceof KdbxEntry ? entry.history.length : 0
    });
  }

  handleShowPassPanel(passPanelAnchor: Element | null) {
    this.#passwordPanelAncor = passPanelAnchor;
    this.setState({isPasswordPanelOpen: true});
  }

  handleInputChange(fieldId: string, inputValue: string, isProtected: boolean) {
    if (!this.state.entry)
      return;

    (this.context as KeeData).updateEntry(
      this.state.entry,
      entry => {
        let kdbxValue = isProtected ? ProtectedValue.fromString(inputValue) : inputValue;
        if (entry instanceof KdbxEntry) {
          entry.fields.set(fieldId, kdbxValue);
        }
        else {
          if (fieldId === 'Title') {entry.name = kdbxValue as string};
          if (fieldId === 'Notes') {entry.notes = kdbxValue as string};
        }
      }
    );

  }

  handleTagsChange (_: any, values: string[]) {
    if (!this.state.entry)
      return;

    (this.context as KeeData).updateEntry(
      this.state.entry,
      entry => {
        entry.tags = values;
      }
    );
  }

  handleDateChange (date: MaterialUiPickersDate) {
    if (!this.state.entry)
      return;

    (this.context as KeeData).updateEntry(
      this.state.entry,
      entry => {
        entry.times.expires = !!date;
        if (date) {
          entry.times!.expiryTime = date;
        }
      }
    );
  }

  handleHistoryState(isInHistory: boolean, historyIndex: number) {
    this.setState({isInHistory: isInHistory, historyIndex: historyIndex});
  }

  getEntryFields(entry: KdbxEntry | KdbxGroup) {
    if (!entry) {
      throw 'entry is undefined';
    }
    return entry instanceof KdbxEntry
      ? entry.fields
      : new Map<string, KdbxEntryField>([
          ['Title', entry.name as string],
          ['Notes', entry.notes as string]
        ]);
  }

  get totalVersions() {
    return this.state.entry instanceof KdbxEntry ? this.state.entry.history.length : 0;
  }

  render(){
    const { classes }  = this.props;
    const { entry, historyIndex, isInHistory } = this.state;

    const fieldInfos = new Map<string, FieldInfo>([
      ['Title', {sortOrder: -5} as FieldInfo],
      ['UserName', {sortOrder: -4} as FieldInfo],
      ['Password', {sortOrder: -3, isProtected: true} as FieldInfo],
      ['URL', {sortOrder: -2} as FieldInfo],
      ['Notes', {sortOrder: 100, isMultiline: true} as FieldInfo]
    ]);

    if (!entry) {
      return (<Typography variant='h2' className = {classes.emptySplash}>Select Item to View</Typography>);
    }

    const entryView = (entry instanceof KdbxEntry && isInHistory)
      ? entry.history[historyIndex]
      : entry;

    return (

      <form noValidate autoComplete="off" >
        <div className = {classes.itemTitle}>

          <IconButton
            disabled = {isInHistory}
            className = {classes.titleIconButton}
            ref = {node => { this.#iconPanelAncor = node }}
            onClick = {() => this.setState({isIconPanelOpen: true})}
          >
            {entryView.customIcon && !entryView.customIcon.empty
              ? <img
                  className = {classes.titleIcon}
                  src={(this.context as KeeData).getCustomIcon(entryView.customIcon.id)}>
                </img>
              : <SvgPath className = {classes.titleIcon} path = {DefaultKeeIcon.get(entryView?.icon ?? 0)} />
            }
          </IconButton>
          <Input
            id = "Title"
            disabled = {isInHistory}
            value = {this.getEntryFields(entryView).get('Title')}
            fullWidth
            placeholder = "Title"
            disableUnderline = {this.getEntryFields(entryView).get("Title") ? true : false}
            inputProps = {{className: clsx(classes.titleStyle, classes.ellipsis)}}
            onChange = {e => this.handleInputChange("Title", e.target.value, false)}
          />
          {entryView instanceof KdbxEntry &&
            <IconButton
              disabled = {isInHistory}
              className = {classes.titleIconButton}
              onClick = {() => this.setState({isColorPanelOpen: true})}
              ref = {node => { this.#colorPanelAncor = node }}
            >
            { !entryView.bgColor
              ? <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorEmpty} />
              : <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorFilled}
                  style={{color: entryView.bgColor}}
                />
            }
            </IconButton>
          }
        </div>

        <div className = {clsx(classes.entityItems, classes.scrollBar)} >

          {Array.from(this.getEntryFields(entryView))
            .filter(f => f[0] !== 'Title')
            .map(field => {
              let info = (fieldInfos.get(field[0]) ? fieldInfos.get(field[0]) : {sortOrder: 0} as FieldInfo)
              return {...field, ...info}
            })
            .sort((a, b) => a.sortOrder as number - (b.sortOrder as number))
            .map(field =>
              <div key = {field[0]}>
                <FieldInput
                  key = {entryView.uuid.id + field[0]}
                  disabled = {isInHistory}
                  entry = {entryView}
                  fieldId = {field[0]}
                  inputValue = {field[1] instanceof ProtectedValue ? field[1].getText() : field[1]}
                  isProtected = {field.isProtected as boolean || field[1] instanceof ProtectedValue}
                  isMultiline = {field.isMultiline as boolean}
                  isCustomProperty = {field.sortOrder === 0}
                  onChange = {this.handleInputChange}
                  onShowPassPanel = {this.handleShowPassPanel}
                />
                {field[0] === 'URL' &&
                  <Tooltip title = 'Add Custom Property' key = 'plusButton'>
                    <IconButton
                      disabled = {isInHistory}
                      className = {classes.smallIcon}
                      onClick = {() => this.setState({isPropertyPanelOpen: true})}
                      ref = {node => {this.#propertyPanelAncor = node}}
                    >
                      <SvgPath path = {SystemIcon.add} />
                    </IconButton>
                  </Tooltip>
                }
              </div>
            )
          }

          <div className={classes.fieldInput}>
            <Autocomplete
              disabled = {isInHistory}
              multiple
              freeSolo
              id = "tags"
              options = {(this.context as KeeData).tags ?? []}
              value = {entryView.tags ?? []}
              onChange = {this.handleTagsChange}
              size = "small"
              fullWidth
              classes = {{listbox: classes.scrollBar}}
              renderTags = {(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip {...getTagProps({ index })}
                    size = "small" variant = "outlined" label = {option}
                    className = {classes.tagChip}
                    key = {index}
                  />
                ))
              }
              renderInput = {(params) => (
                <TextField {...params} fullWidth variant="outlined" label="Tags" />
              )}
            />
          </div>

          <div className={classes.fieldMix}>
            <div>
              <MuiPickersUtilsProvider utils = {DateFnsUtils}>
                <KeyboardDatePicker
                  id = "expireTime"
                  disabled = {isInHistory}
                  style = {{width:180}}
                  label = {entryView.times.expires ? "Expire Date" : "No Expiration"}
                  inputVariant = "outlined"
                  value = {entryView.times.expires ? entryView.times.expiryTime : null}
                  format = "dd-MMM-yyyy"
                  InputAdornmentProps = {{ position: "end" }}
                  onChange = {date => this.handleDateChange(date)}
                />
              </MuiPickersUtilsProvider>
            </div>

            {entryView instanceof KdbxEntry &&
              <AttachInput
                entry = {entryView}
                disabled = {isInHistory}
              />
            }
          </div>

          <div className = {classes.fieldInput}>
            <ItemInfoCard entry = {entry} />
          </div>
        </div>

        <ItemToolbar
          currentEntry = {entry}
          historyIndex = {historyIndex}
          totalVersions = {this.totalVersions}
          onSetHistory = {this.handleHistoryState}
        />

        {this.#iconPanelAncor &&
          <IconChoicePanel
            panelAncor = {this.#iconPanelAncor}
            isPanelOpen = {this.state.isIconPanelOpen}
            entry = {entry}
            onClose = {() => this.setState({isIconPanelOpen: false})}
          />
        }
        {this.#colorPanelAncor && entry instanceof KdbxEntry &&
          <ColorChoicePanel
            panelAncor = {this.#colorPanelAncor}
            isPanelOpen = {this.state.isColorPanelOpen}
            onClose = {() => this.setState({isColorPanelOpen: false})}
            entry = {entry}
          />
        }
        {this.#propertyPanelAncor && entry instanceof KdbxEntry &&
          <CustomPropertyPanel
            panelAncor = {this.#propertyPanelAncor}
            isPanelOpen = {this.state.isPropertyPanelOpen}
            onClose = {() => this.setState({isPropertyPanelOpen: false})}
            entry = {entry}
          />
        }

        {this.#passwordPanelAncor && entry instanceof KdbxEntry &&
          <PasswordGeneratorPanel
            panelAncor = {this.#passwordPanelAncor}
            isPanelOpen = {this.state.isPasswordPanelOpen}
            onClose = {() => this.setState({isPasswordPanelOpen: false})}
            entry = {entry}
          />
        }

      </form>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ItemDetailPanel);
