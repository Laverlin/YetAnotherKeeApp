// TODO::
// ts-simple-nameof
// try to reuse outlined for tags

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
  Input,
  Paper,
  TextField,
  Theme,
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
    isShowPassword: false,
    tags: [] as string[],
    expireTime: undefined as Date | undefined,
    isExpired: false,
    inputFields: new Map<string, KdbxEntryField>(),
    historyLength: 0
  }

  constructor(props : Props) {
    super(props);
    this.handleUpdateEntry = this.handleUpdateEntry.bind(this);
    this.handleUpdateGroup = this.handleUpdateGroup.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    const keeData = (this.context as KeeData);
    keeData.addEntryListener(this.handleUpdateEntry);
    keeData.addGroupListener(this.handleUpdateGroup)
  }

  componentWillUnmount() {
    const keeData = (this.context as KeeData);
    keeData.removeEntryListener(this.handleUpdateEntry);
    keeData.removeGroupListener(this.handleUpdateGroup);
  }

  savePrevChanges(prevEntry: KdbxEntry | KdbxGroup | undefined) {
    if (!prevEntry) {
      return
    }
    if (prevEntry instanceof KdbxEntry) {
      if (this.state.historyLength === prevEntry.history.length) {
        prevEntry.pushHistory();
      }
    }

    if (prevEntry instanceof KdbxGroup) {
      prevEntry.name = this.state.inputFields.get('Title') as string
      prevEntry.notes = this.state.inputFields.get('Notes') as string
    }

    prevEntry.tags = this.state.tags;
    prevEntry.times.expires = !!this.state.expireTime;
    prevEntry.times.expiryTime = this.state.expireTime;

    prevEntry.times.update();
  }

  componentDidUpdate() {
    this.savePrevChanges(this.state.entry);
  }

  handleUpdateEntry(entry: KdbxEntry){
    this.setState({entry: entry});
    this.setState({tags: entry.tags});
    this.setState({expireTime: entry.times.expiryTime});
    this.setState({isExpired: entry.times.expires})

    this.setState({inputFields: entry.fields});
    this.setState({historyLength: entry.history.length});
  }

  handleInputChange(fieldId: string, inputValue: string, isProtected: boolean) {
    let kdbxValue = isProtected ? ProtectedValue.fromString(inputValue) : inputValue;
    this.state.inputFields.set(fieldId, kdbxValue);
    this.setState({inputFields: this.state.inputFields});
  }

  handleUpdateGroup(groupId: string){
    const entry = (this.context as KeeData).database.getGroup(groupId);
    if (!entry) {
      return
    }

    this.setState({inputFields: new Map<string, KdbxEntryField>([
      ['Title', entry.name as string],
      ['Notes', entry.notes as string]
    ])})

    this.setState({entry: entry});
    this.setState({tags: entry.tags});
    this.setState({expireTime: entry.times.expiryTime});
    this.setState({isExpired: entry.times.expires})
  }

  handleTagsChange = (_: any, values: string[]) => {
    this.setState({tags: values });
  }

  handleDateChange = (date: MaterialUiPickersDate) => {
    this.setState({ isExpired: true, expireTime: date });
  }

  handleClickShowPassword = () => this.setState({isShowPassword: !this.state.isShowPassword});

  render(){
    const { classes }  = this.props;
    const {entry } = this.state;

    const fieldInfos = new Map<string, FieldInfo>([
      ['Title', {sortOrder: -5} as FieldInfo],
      ['UserName', {sortOrder: -4} as FieldInfo],
      ['Password', {sortOrder: -3, isProtected: true} as FieldInfo],
      ['URL', {sortOrder: -2} as FieldInfo],
      ['Notes', {sortOrder: 100, isMultiline: true} as FieldInfo]
    ]);

    if (!entry)
    {
      return (<Typography variant='h2' className = {classes.emptySplash}>Select Item to View</Typography>);
    }


    return (

      <form noValidate autoComplete="off" >
        <div className = {classes.itemTitle}>
          {entry.customIcon && !entry.customIcon.empty
            ? <img
                className={classes.titleIcon}
                src={(this.context as KeeData).getCustomIcon(entry.customIcon.id)}>
              </img>
            : <SvgPath className = {classes.titleIcon} path = {DefaultKeeIcon.get(this.state.entry?.icon ?? 0)} />
          }
          <Input id = "Title"
            value = {this.state.inputFields.get("Title")}
            fullWidth
            placeholder = "Title"
            disableUnderline = {this.state.inputFields.get("Title") ? true : false}
            inputProps = {{className: clsx(classes.titleStyle, classes.ellipsis)}}
            onChange = {e => this.handleInputChange("Title", e.target.value, false)}
          />
          { entry instanceof KdbxEntry && entry.bgColor === ''
            ? <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorEmpty} />
            : <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorFilled}
                style={{color: (entry as KdbxEntry).bgColor}}
              />
          }
        </div>



        <div className = {clsx(classes.entityItems, classes.scrollBar)} >

          {Array.from(this.state.inputFields)
            .filter(f => f[0] !== 'Title')
            .map(field => {
              let info = (fieldInfos.get(field[0]) ? fieldInfos.get(field[0]) : {sortOrder:0} as FieldInfo)
              return {...field, ...info}
            })
            .sort((a, b) => a.sortOrder as number - (b.sortOrder as number))
            .map(field =>
            <FieldInput
              key = {entry.uuid.id + field[0]}
              fieldId = {field[0]}
              inputValue = {field[1] instanceof ProtectedValue ? field[1].getText() : field[1]}
              isProtected = {field.isProtected as boolean}
              isMultiline = {field.isMultiline as boolean}
              handleInputChange = {this.handleInputChange}
            />
          )}

          <div className={classes.fieldInput}>
            <Autocomplete
              multiple
              freeSolo
              id = "tags"
              options = {(this.context as KeeData).tags ?? []}
              value = {this.state.tags ?? []}
              onChange = {this.handleTagsChange}
              size = "small"
              PaperComponent={({ children }) => (
                <Paper variant='elevation' className = {classes.scrollBar}>
                    {children}
                </Paper>
              )}
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
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker id="expireTime" style={{width:180}}
                  label={this.state.isExpired ? "Expire Date" : "No Expiration"}
                  inputVariant="outlined"
                  value={this.state.isExpired ? this.state.expireTime : null}
                  format="dd-MMM-yyyy"
                  InputAdornmentProps={{ position: "end" }}
                  onChange={date => this.handleDateChange(date)}
                />
              </MuiPickersUtilsProvider>
            </div>

            {entry instanceof KdbxEntry &&
              <AttachInput entry = {entry} />
            }
          </div>

          <div className = {classes.fieldInput}>
            <ItemInfoCard entry = {entry} />
          </div>
        </div>

        <ItemToolbar
          updatedFields = {this.state.inputFields}
          currentEntry = {entry}
          keeData = {this.context}
        />
      </form>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ItemDetailPanel);
