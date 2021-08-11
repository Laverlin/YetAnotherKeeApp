// TODO::
// ts-simple-nameof
// try to reuse outlined for tags

import React, { Component } from "react";
import { KdbxEntry, KdbxEntryField, KdbxGroup, KdbxUuid, ProtectedValue } from "kdbxweb";
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
    isPropertyPanelOpen: false
  }
  #iconPanelAncor: Element | null = null;
  #colorPanelAncor: Element | null = null;
  #propertyPanelAncor: Element | null = null;
  #editedItems: string[] = [];

  constructor(props : Props) {
    super(props);
    this.handleUpdateEntry = this.handleUpdateEntry.bind(this);
    this.handleUpdateGroup = this.handleUpdateGroup.bind(this);
    this.updateEntityState = this.updateEntityState.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDbUpdate = this.handleDbUpdate.bind(this);

    this.handleTagsChange = this.handleTagsChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentDidMount() {
    const keeData = (this.context as KeeData);
    keeData.addEntryListener(this.handleUpdateEntry);
    keeData.addGroupListener(this.handleUpdateGroup);
    keeData.addDbChangeListener(this.handleDbUpdate);
  }

  componentWillUnmount() {
    const keeData = (this.context as KeeData);
    keeData.removeEntryListener(this.handleUpdateEntry);
    keeData.removeGroupListener(this.handleUpdateGroup);
    keeData.removeDbChangeListener(this.handleDbUpdate);
  }

  // Update entity state: push history, set update time, notify
  // and apply changes form function
  //
  updateEntityState(changeState: {(entry: KdbxEntry | KdbxGroup): void}, forceUpdate: boolean = false) {
    const entry = this.state.entry;
    if (!entry) {
      return
    }

    // need to push history of entry only once per save db
    // for this edited items are traked
    //
    if (!this.#editedItems.find(i => i === entry.uuid.id)) {
      this.#editedItems.push(entry.uuid.id);
      if (entry instanceof KdbxEntry) {
        entry.pushHistory();
      }
      entry.times.update();
      (this.context as KeeData).notifyDbChangeListeners(true);
    }

    changeState(entry);
    if (forceUpdate) {
      this.forceUpdate();
    }
  }

  // clear change history after db has been saved
  //
  handleDbUpdate(isDbChanged: boolean) {
    if(!isDbChanged) {
      this.#editedItems = [];
    }
  }

  handleInputChange(fieldId: string, inputValue: string, isProtected: boolean) {
    this.updateEntityState(entry => {
      let kdbxValue = isProtected ? ProtectedValue.fromString(inputValue) : inputValue;
      if (entry instanceof KdbxEntry) {
        entry.fields.set(fieldId, kdbxValue);
      }
      else {
        if (fieldId === 'Title') {entry.name = kdbxValue as string};
        if (fieldId === 'Notes') {entry.notes = kdbxValue as string};
      }
    }, true);
  }

  handleUpdateEntry(entry: KdbxEntry) {
    this.setState({entry: entry});
  }

  handleUpdateGroup(groupId: string) {
    const entry = (this.context as KeeData).database.getGroup(groupId);
    if (!entry) {
      return
    }
    this.setState({entry: entry});
  }

  handleTagsChange (_: any, values: string[]) {
    this.updateEntityState(entry => {
      entry.tags = values;
    }, true);
  }

  handleDateChange (date: MaterialUiPickersDate) {
    this.updateEntityState(entry => {
      entry.times.expires = !!date;
      if (date) {
        entry.times!.expiryTime = date;
      }
    }, true);
  }

  get entryFields() {
    if (!this.state.entry) {
      throw 'entry is undefined';
    }
    return this.state.entry instanceof KdbxEntry
      ? this.state.entry.fields
      : new Map<string, KdbxEntryField>([
          ['Title', this.state.entry.name as string],
          ['Notes', this.state.entry.notes as string]
        ]);
  }

  render(){
    const { classes }  = this.props;
    const { entry } = this.state;

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

    return (

      <form noValidate autoComplete="off" >
        <div className = {classes.itemTitle}>

          <IconButton
            className = {classes.titleIconButton}
            ref = {node => { this.#iconPanelAncor = node }}
            onClick = {() => this.setState({isIconPanelOpen: true})}
          >
            {entry.customIcon && !entry.customIcon.empty
              ? <img
                  className = {classes.titleIcon}
                  src={(this.context as KeeData).getCustomIcon(entry.customIcon.id)}>
                </img>
              : <SvgPath className = {classes.titleIcon} path = {DefaultKeeIcon.get(this.state.entry?.icon ?? 0)} />
            }
          </IconButton>
          <Input id = "Title"
            value = {this.entryFields.get('Title')}
            fullWidth
            placeholder = "Title"
            disableUnderline = {this.entryFields.get("Title") ? true : false}
            inputProps = {{className: clsx(classes.titleStyle, classes.ellipsis)}}
            onChange = {e => this.handleInputChange("Title", e.target.value, false)}
          />
          {entry instanceof KdbxEntry &&
            <IconButton
              className = {classes.titleIconButton}
              onClick = {() => this.setState({isColorPanelOpen: true})}
              ref = {node => { this.#colorPanelAncor = node }}
            >
            { !entry.bgColor
              ? <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorEmpty} />
              : <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorFilled}
                  style={{color: (entry as KdbxEntry).bgColor}}
                />
            }
            </IconButton>
          }
        </div>

        <div className = {clsx(classes.entityItems, classes.scrollBar)} >

          {Array.from(this.entryFields)
            .filter(f => f[0] !== 'Title')
            .map(field => {
              let info = (fieldInfos.get(field[0]) ? fieldInfos.get(field[0]) : {sortOrder: 0} as FieldInfo)
              return {...field, ...info}
            })
            .sort((a, b) => a.sortOrder as number - (b.sortOrder as number))
            .map(field =>
              <>
                <FieldInput
                  key = {entry.uuid.id + field[0]}
                  fieldId = {field[0]}
                  inputValue = {field[1] instanceof ProtectedValue ? field[1].getText() : field[1]}
                  isProtected = {field.isProtected as boolean || field[1] instanceof ProtectedValue}
                  isMultiline = {field.isMultiline as boolean}
                  isCustomProperty = {field.sortOrder === 0}
                  handleEntryUpdate = {this.updateEntityState}
                  handleInputChange = {this.handleInputChange}
                />
                {field[0] === 'URL' &&
                  <Tooltip title = 'Add Custom Property' key = 'plusButton'>
                    <IconButton
                      className = {classes.smallIcon}
                      onClick = {() => this.setState({isPropertyPanelOpen: true})}
                      ref = {node => {this.#propertyPanelAncor = node}}
                    >
                      <SvgPath path = {SystemIcon.add} />
                    </IconButton>
                  </Tooltip>
                }
              </>
            )
          }

          <div className={classes.fieldInput}>
            <Autocomplete
              multiple
              freeSolo
              id = "tags"
              options = {(this.context as KeeData).tags ?? []}
              value = {entry.tags ?? []}
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
                <KeyboardDatePicker id = "expireTime" style = {{width:180}}
                  label = {entry.times.expires ? "Expire Date" : "No Expiration"}
                  inputVariant = "outlined"
                  value = {entry.times.expires ? entry.times.expiryTime : null}
                  format = "dd-MMM-yyyy"
                  InputAdornmentProps = {{ position: "end" }}
                  onChange = {date => this.handleDateChange(date)}
                />
              </MuiPickersUtilsProvider>
            </div>

            {entry instanceof KdbxEntry &&
              <AttachInput
                entry = {entry}
                handleEntryUpdate = {this.updateEntityState}
              />
            }
          </div>

          <div className = {classes.fieldInput}>
            <ItemInfoCard entry = {entry} />
          </div>
        </div>

        <ItemToolbar
          currentEntry = {entry}
        />

        {this.#iconPanelAncor &&
          <IconChoicePanel
            panelAncor = {this.#iconPanelAncor}
            isPanelOpen = {this.state.isIconPanelOpen}
            handleEntryUpdate = {this.updateEntityState}
            onClose = {() => this.setState({isIconPanelOpen: false})}
          />
        }
        {this.#colorPanelAncor &&
          <ColorChoicePanel
            panelAncor = {this.#colorPanelAncor}
            isPanelOpen = {this.state.isColorPanelOpen}
            onClose = {() => this.setState({isColorPanelOpen: false})}
            handleEntryUpdate = {this.updateEntityState}
          />
        }
        {this.#propertyPanelAncor &&
          <CustomPropertyPanel
            panelAncor = {this.#propertyPanelAncor}
            isPanelOpen = {this.state.isPropertyPanelOpen}
            onClose = {() => this.setState({isPropertyPanelOpen: false})}
            handleEntryUpdate = {this.updateEntityState}
          />
        }

      </form>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ItemDetailPanel);
