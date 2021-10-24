import React, { FC } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { ProtectedValue } from "kdbxweb";
import { DefaultKeeIcon, IKdbxItemState, SystemIcon } from "../../entity";
import { scrollBar, SvgPath } from "../common";
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
import AttachInput from "./AttachInput";
import IconSelectPanel from "./IconSelectPanel";
import ColorSelectPanel from "./ColorSelectPanel";
import CustomPropertyPanel from "./CustomPropertyPanel";
import PasswordGeneratorPanel from "./PasswordGeneratorPanel";
import {
  tagSelector,
  colorChoisePanelAtom,
  customPropertyPanelAtom,
  historyAtom,
  iconChoisePanelAtom,
  openPanel,
  itemStateAtom,
  KdbxEntryStateReadOnly,
  selectItemSelector,
  GlobalContext,
} from "../../entity";
import PropertyInput from "./PropertyInput";
import { CustomPropertyMenu } from "./CustomPropertyMenu";



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

interface IProps extends WithStyles<typeof styles> {}

const ItemDetailPanel: FC<IProps> = ({classes}) => {

  // Global state
  //
  const entryUuid = useRecoilValue(selectItemSelector) || GlobalContext.allItemsGroupUuid;
  const [entry, setEntryState] = useRecoilState(itemStateAtom(entryUuid.id));
  const historyState = useRecoilValue(historyAtom(entryUuid.id));
  const setCustomPropPanel = useSetRecoilState(customPropertyPanelAtom);
  const setIconPanel = useSetRecoilState(iconChoisePanelAtom);
  const setColorPanel = useSetRecoilState(colorChoisePanelAtom);
  const allTags = useRecoilValue(tagSelector);

  if (!entry || entry.isAllItemsGroup) {
    return (<Typography variant='h2' className = {classes.emptySplash}>Select Item to View</Typography>);
  }

  // handlers
  //
  const handleTitleChange = (inputValue: string) => {
    setEntryState(entry.setTitle(inputValue));
  }

  const handleTagsChange = (values: (string[] | string)[]) => {
    setEntryState(entry.setTags(values as string[]));
  }

  const handleDateChange = (date: MaterialUiPickersDate) => {
    setEntryState(entry.setExpiryTime(date || undefined));
  }

  // helpers
  //
  const fieldInfos = new Map<string, FieldInfo>([
      ['Title', {sortOrder: -5} as FieldInfo],
      ['UserName', {sortOrder: -4} as FieldInfo],
      ['Password', {sortOrder: -3, isProtected: true} as FieldInfo],
      ['URL', {sortOrder: -2} as FieldInfo],
      ['Notes', {sortOrder: 100, isMultiline: true} as FieldInfo]
    ]);

  const entryView = historyState.isInHistory
    ? new KdbxEntryStateReadOnly(entry.history[historyState.historyIndex])
    : entry

  return (
    <form noValidate autoComplete = "off" >
      <div className = {classes.itemTitle}>
        <IconButton
          className = {classes.titleIconButton}
          onClick = {e => setIconPanel(openPanel(e.currentTarget))}
          disabled = {historyState.isInHistory}
        >
          {entryView.customIcon
            ? <img className = {classes.titleIcon} src={entryView.customIcon} />
            : <SvgPath className = {classes.titleIcon} path = {DefaultKeeIcon.get(entryView.defaultIconId)} />
          }
        </IconButton>
        <Input
          id = "Title"
          value = {entryView.title}
          fullWidth
          placeholder = "Title"
          disableUnderline = {entryView.title ? true : false}
          inputProps = {{className: clsx(classes.titleStyle, classes.ellipsis)}}
          onChange = {e => handleTitleChange(e.target.value)}
          disabled = {historyState.isInHistory}
        />
          {!entry.isGroup &&
            <IconButton
              className = {classes.titleIconButton}
              onClick = {e => setColorPanel(openPanel(e.currentTarget))}
              disabled = {historyState.isInHistory}
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
          {Array.from(entryView.fields)
            .map(field => {
              let info = (fieldInfos.get(field[0]) || {sortOrder: 0} as FieldInfo)
              return {name: field[0], value: field[1], ...info }
            })
            .filter(f => f.name !== 'Title')
            .sort((a, b) => a.sortOrder as number - (b.sortOrder as number))
            .map(field =>
              <div key = {field.name}>
                <PropertyInput
                  entry = {entryView}
                  fieldId = {field.name}
                  inputValue = {field.value instanceof ProtectedValue ? field.value.getText() : field.value}
                  isProtected = {field.isProtected as boolean || field.value instanceof ProtectedValue}
                  isMultiline = {field.isMultiline as boolean}
                  isCustomProperty = {field.sortOrder === 0}
                  disabled = {historyState.isInHistory}
                />
                {field.name === 'URL' &&
                  <Tooltip title = 'Add Custom Property' key = 'plusButton'>
                    <IconButton
                      className = {classes.smallIcon}
                      onClick = {e => setCustomPropPanel(openPanel(e.currentTarget))}
                      disabled = {historyState.isInHistory}
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
              multiple
              freeSolo
              id = "tags"
              options = {allTags}
              value = {entryView.tags ?? []}
              onChange = {(_, value) => handleTagsChange(value)}
              size = "small"
              disabled = {historyState.isInHistory}
              fullWidth
              classes = {{listbox: classes.scrollBar}}
              renderTags = {(value: string[], getTagProps) =>
                value.map((value: string, index: number) => (
                  <Chip {...getTagProps({ index })}
                    size = "small" variant = "outlined" label = {value}
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
                  style = {{width:180}}
                  label = {entryView.isExpires? "Expire Date" : "No Expiration"}
                  inputVariant = "outlined"
                  value = {entryView.isExpires ? entryView.expiryTime : null}
                  format = "dd-MMM-yyyy"
                  InputAdornmentProps = {{ position: "end" }}
                  onChange = {date => handleDateChange(date)}
                  disabled = {historyState.isInHistory}
                />
              </MuiPickersUtilsProvider>
            </div>
            {!entry.isGroup &&
              <AttachInput entry = {entryView} disabled = {historyState.isInHistory} />
            }
          </div>
          <div className = {classes.fieldInput}>
            <ItemInfoCard entry = {entryView} />
          </div>

        </div>
        {!entry.isGroup &&
          <ItemToolbar entry = {entry} />
        }

        <CustomPropertyMenu entry = {entry} />
        <CustomPropertyPanel entry = {entry} />
        <IconSelectPanel entry = {entry} />
        <ColorSelectPanel entry = {entry} />
        <PasswordGeneratorPanel entry = {entry} />

      </form>
    )
}

export default withStyles(styles, { withTheme: true })(React.memo(ItemDetailPanel));
