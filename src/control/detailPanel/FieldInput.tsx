import * as React from 'react';
import {
  createStyles,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  SvgIcon,
  TextField,
  Theme,
  withStyles,
  WithStyles
} from '@material-ui/core';
import { DefaultKeeIcon, KeeDataContext, SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import { KdbxEntry, KdbxGroup, ProtectedValue } from 'kdbxweb';

const styles = (theme: Theme) =>  createStyles({
  fieldInput: {
    padding: theme.spacing(1),
  },
})

interface IFieldInputProps extends WithStyles<typeof styles> {
  fieldId: string,
  inputValue: string,
  isProtected: boolean,
  isMultiline: boolean,
  isCustomProperty: boolean,
  handleInputChange: {(fieldId: string, inputValue: string, isProtected: boolean): void},
  handleEntryUpdate: {(changeEntry: {(entry: KdbxEntry | KdbxGroup): void}, forceUpdate?: boolean): void},
}

class FieldInput extends React.Component<IFieldInputProps> {
  static contextType = KeeDataContext;
  constructor(props: IFieldInputProps) {
    super(props);
    this.handlePropertyProtection = this.handlePropertyProtection.bind(this);

    this.handleDeleteProperty = this.handleDeleteProperty.bind(this);
  }
  #menuAnchor: Element | null = null
  state = {
    isShowText: !this.props.isProtected,
    isShowMenu: false
  }

  handlePropertyProtection() {
    this.props.handleEntryUpdate(entry => {
      if (entry instanceof KdbxGroup) {
        return;
      }
      const field = (this.props.isProtected)
        ? this.props.inputValue
        : ProtectedValue.fromString(this.props.inputValue);
      entry.fields.set(this.props.fieldId, field);
    }, true);
    this.setState({isShowMenu: false, isShowText: this.props.isProtected});
  }

  handleDeleteProperty(fieldId: string) {
    this.props.handleEntryUpdate(entry => {
      if (entry instanceof KdbxEntry) {
        entry.fields.delete(fieldId);
      }
    }, true);
  }

  public render() {
    const {
      classes,
      fieldId,
      inputValue,
      isProtected,
      isCustomProperty,
      isMultiline,
    }  = this.props;

    const adornment = {
      endAdornment: (
        <InputAdornment position="end">
          {isCustomProperty &&
            <IconButton
              ref = {node => {this.#menuAnchor = node}}
              aria-label="context menu"
              onClick = {() => this.setState({isShowMenu: true})}
            >
              <SvgIcon><path d={SystemIcon.dot_hamburger}/></SvgIcon>
            </IconButton>
          }
          {isProtected &&
            <IconButton
              aria-label="toggle text visibility"
              onClick = {() => this.setState({isShowText: !this.state.isShowText})}
            >
              {this.state.isShowText
                    ? <SvgIcon><path d={SystemIcon.visibilityOn}/></SvgIcon>
                    : <SvgIcon><path d={SystemIcon.visibilityOff}/></SvgIcon>
              }
            </IconButton>
          }
        </InputAdornment>
      )
    }

    return (
      <div className = {classes.fieldInput}>
        <TextField
          id = {fieldId}
          fullWidth
          multiline = {isMultiline}
          type = {this.state.isShowText ? 'text' : 'password'}
          label = {fieldId}
          variant = "outlined"
          value = {inputValue}
          onChange = {e => this.props.handleInputChange(fieldId, e.target.value, isProtected)}
          InputProps = {adornment}
        />
        <Menu
          keepMounted
          open = {this.state.isShowMenu}
          onClose = {() => this.setState({isShowMenu: false})}
          anchorEl = {this.#menuAnchor}
          anchorOrigin = {{vertical: 'top', horizontal: 'left'}}
          transformOrigin = {{vertical: 'top', horizontal: 'right'}}
          getContentAnchorEl = {null}
        >

          <MenuItem onClick = {() => this.handlePropertyProtection()}>
            <ListItemIcon>
                <SvgPath path = {isProtected ? DefaultKeeIcon['unlock-alt'] : DefaultKeeIcon.lock} />
            </ListItemIcon>
            {isProtected ? 'Remove Protection' : 'Protect Value'}
          </MenuItem>
          <MenuItem onClick = {() => this.handleDeleteProperty(fieldId)} >
            <ListItemIcon >
                <SvgPath path = {SystemIcon.delete} />
            </ListItemIcon>
            Delete Property
          </MenuItem>

        </Menu>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(FieldInput);
