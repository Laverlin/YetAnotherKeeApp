// TODO::
// ts-simple-nameof
// outlined in separate class
// try to reuse outlined for tags
// add icon to files to add files


import React, { Component } from "react";
import { KdbxEntry, ProtectedValue } from "kdbxweb";
import { DefaultKeeIcon, SystemIcon } from "../entity/GlobalObject";
import { KeeDataContext } from "../entity/Context";
import KeeData from "../entity/KeeData";
import clsx from 'clsx';

import Autocomplete from '@material-ui/lab/Autocomplete';

import {
  Card,
  CardContent,
  Chip,
  createStyles,
  IconButton,
  Input,
  InputAdornment,
  SvgIcon,
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
import { SvgPath } from "./common/SvgPath";

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
    overflowY:'scroll',
    display:'inline-flex',
    flexDirection:'column',
    "&::-webkit-scrollbar" : {
      width: '10px',
    },
    "&::-webkit-scrollbar-track": {
      background: 'transparent',
    },
    "&::-webkit-scrollbar-thumb": {
      background: 'transparent',
      borderRadius: '10px',
      backgroundClip: 'padding-box',
      borderRight: '2px transparent solid',
      borderLeft: '2px transparent solid'
    },
    "&:hover": {
      "&::-webkit-scrollbar-thumb": {
        //"-webkit-box-shadow": 'inset 0 0 6px rgba(0,0,0,0.9)'
        backgroundColor:'rgba(0,0,0,0.4)'
      }
    }
   },

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
    color: theme.palette.action.active,
    backgroundColor: theme.palette.background.default,
  },

  outlinedContent: {
    marginLeft:  theme.spacing(1/2),
    marginRight: theme.spacing(1/2),
    alignItems:'center',
    display:'flex'
  },

  itemBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display:'flex',
    flexDirection:'row',
    height: theme.spacing(8),
    padding: theme.spacing(1),
  },

  bottomIcon:{
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: theme.spacing(1/2),
  }
});

interface Props extends WithStyles<typeof styles> {}

class ItemDetailPanel extends Component<Props> {
  static contextType = KeeDataContext;

  state = {
    entry: {} as KdbxEntry | undefined,
    isShowPassword: false,
    title: '',
    userName: '',
    url: '',
    password: '',
    notes: '',
    tags: [] as string[],
    expireTime: null as Date | null,
    isExpired: false
  }

  constructor(props : Props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  async componentDidMount() {
    const keeData = (this.context as KeeData);
    keeData.addEntryListener(this.handleUpdate);
  }

  componentWillUnmount() {
    const keeData = (this.context as KeeData);
    keeData.removeEntryListener(this.handleUpdate);
  }

  handleUpdate(entry: KdbxEntry){
    this.setState({entry: entry});
    this.setState({title: entry.fields.get('Title')});
    this.setState({userName: entry.fields.get('UserName')});
    this.setState({url: entry.fields.get('URL')});
    this.setState({password: entry.fields.get('Password') && (entry.fields.get('Password') as ProtectedValue)?.getText() });
    this.setState({notes: entry.fields.get('Notes') ?? ''});
    this.setState({tags: entry.tags});
    this.setState({expireTime: entry.times.expiryTime});
    this.setState({isExpired: entry.times.expires})
  }

  handleChange = (event: any) => {
    this.setState({[event.target.id]: event.target.value})
  }

  handleTagsChange = (_: any, values: string[]) => {
    this.setState({tags: values });
  }

  handleDateChange = (date: MaterialUiPickersDate) => {
    this.setState({ isExpired: true, expireTime: date });
  }

  handleDelete(){}

  handleClickShowPassword = () => this.setState({isShowPassword: !this.state.isShowPassword});

  render(){
    const { classes }  = this.props;

    return (
      <form noValidate autoComplete="off" >
        <div className = {classes.itemTitle}>
          {this.state.entry?.customIcon && !this.state.entry.customIcon.empty
            ? <img
                className={classes.titleIcon}
                src={(this.context as KeeData).getCustomIcon(this.state.entry.customIcon.id)}>
              </img>
            : <SvgPath className = {classes.titleIcon} path = {DefaultKeeIcon.get(this.state.entry?.icon ?? 0)} />
          }
          <Input id = "title"
            value = {this.state.title}
            fullWidth
            placeholder = "Title"
            disableUnderline = {this.state.title ? true : false}
            inputProps = {{className: clsx(classes.titleStyle, classes.ellipsis)}}
            onChange = {this.handleChange}
          />
          { this.state.entry?.bgColor === ''
            ? <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorEmpty} />
            : <SvgPath className={classes.titleFlagIcon} path = {SystemIcon.colorFilled}
                style={{color: this.state.entry?.bgColor}}
              />
          }
        </div>

        <div className = {classes.entityItems} >
          <div className = {classes.fieldInput}>
            <TextField
              id = "userName"
              fullWidth
              label = "User Name"
              variant = "outlined"
              inputProps = {{className: classes.ellipsis}}
              value = {this.state.userName}
              onChange = {this.handleChange}
            />
          </div>
          <div className = {classes.fieldInput}>
            <TextField
              id = "password"
              fullWidth
              type = {this.state.isShowPassword ? 'text' : 'password'}
              label = "Password"
              variant = "outlined"
              value = {this.state.password}
              onChange = {this.handleChange}
              InputProps = {{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={this.handleClickShowPassword}
                    >
                      {this.state.isShowPassword
                            ? <SvgIcon><path d={SystemIcon.visibilityOn}/></SvgIcon>
                            : <SvgIcon><path d={SystemIcon.visibilityOff}/></SvgIcon>
                      }
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </div>
          <div className={classes.fieldInput}>
            <TextField
              id = "url"
              fullWidth
              label = "URL"
              variant = "outlined"
              inputProps = {{className: classes.ellipsis}}
              value = {this.state.url}
              onChange = {this.handleChange}
            />
          </div>
          <div className={classes.fieldInput}>
            <TextField
              id="notes"
              fullWidth
              multiline
              label = "Notes"
              variant = "outlined"
              value = {this.state.notes}
              onChange = {this.handleChange}
            />
          </div>

          <div className={classes.fieldInput}>
            <Autocomplete
              multiple
              freeSolo
              id = "tags"
              options = {this.state.tags ? this.state.tags : []}
              value = {this.state.tags ? this.state.tags : []}
              onChange = {this.handleTagsChange}
              size = "small"
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

            <div className = {classes.outlined} >
              <Typography variant="caption" className = {classes.outlinedCaption}>&nbsp;Attached&nbsp;</Typography>
              <div className = {clsx(classes.outlinedContent, classes.ellipsis)}>
                { this.state.entry && this.state.entry.binaries &&
                  Array.from(this.state.entry.binaries.keys()).map(k =>
                    <Tooltip title={k} key = {k}>
                      <Chip className = {classes.ellipsis}
                        style = {{margin:'2px'}}
                        variant = "outlined" size = "small" label = {k} onClick={this.handleDelete} onDelete={this.handleDelete}
                      />
                    </Tooltip>
                  )
                }
              </div>
            </div>
          </div>

          <div className={classes.fieldInput}>
            {this.state.entry?.times &&
              <Card variant="outlined" >
                <CardContent style={{paddingTop:4, paddingBottom: 4 }}>
                  <Typography variant="body1"  className={classes.ellipsis}>
                    Created&nbsp;:&nbsp;
                    <Typography variant="caption">
                      { this.state.entry.times.creationTime?.toDateString() }
                      &nbsp;
                      { this.state.entry.times.creationTime?.toTimeString() }
                    </Typography>
                  </Typography>

                  <Typography variant="body1" className={classes.ellipsis}>
                    Last Modified&nbsp;:&nbsp;
                    <Typography variant="caption">
                      { this.state.entry.times.lastModTime?.toDateString() }
                      &nbsp;
                      { this.state.entry.times.lastModTime?.toTimeString() }
                    </Typography>
                  </Typography>

                  <Typography variant="body1" className={classes.ellipsis}>
                    Last Access&nbsp;:&nbsp;
                    <Typography variant="caption">
                      { this.state.entry.times.lastAccessTime?.toDateString() }
                      &nbsp;
                      { this.state.entry.times.lastAccessTime?.toTimeString() }
                    </Typography>
                  </Typography>

                  <Typography variant="body1" className={classes.ellipsis}>
                    Used&nbsp;:&nbsp;<Typography variant="caption">{ this.state.entry.times.usageCount }</Typography>
                    &nbsp;&nbsp;
                    Group&nbsp;:&nbsp;<Typography variant="caption">{ this.state.entry.parentGroup?.name }</Typography>
                    &nbsp;&nbsp;
                    UUID&nbsp;:&nbsp;<Typography variant="caption">{ this.state.entry.uuid.toString() }</Typography>
                  </Typography>

                </CardContent>
              </Card>
            }
          </div>
        </div>

        <div className={classes.itemBottom}>
          <IconButton aria-label="Add Field"><SvgPath className={classes.bottomIcon} path = {SystemIcon.add}/></IconButton>
          <IconButton aria-label="Add Attachment">
            <SvgPath className={classes.bottomIcon} path  = {SystemIcon.attachFile} />
          </IconButton>
          <IconButton aria-label="Copy Entry"><SvgPath className={classes.bottomIcon} path = {SystemIcon.copyFile}/></IconButton>
          <IconButton aria-label="Delete Entry" style={{marginLeft:'auto'}}>
          <SvgPath className={classes.bottomIcon} path = {SystemIcon.delete}/>
          </IconButton>
        </div>
      </form>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ItemDetailPanel);
