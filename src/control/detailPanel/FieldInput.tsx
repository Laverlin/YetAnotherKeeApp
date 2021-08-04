import * as React from 'react';
import {
  createStyles,
  IconButton,
  InputAdornment,
  SvgIcon,
  TextField,
  Theme,
  withStyles,
  WithStyles
} from '@material-ui/core';
import { SystemIcon } from '../../entity';

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
  handleInputChange: {(fieldId: string, inputValue: string, isProtected: boolean): void}
}

class FieldInput extends React.Component<IFieldInputProps> {
  constructor(props: IFieldInputProps) {
    super(props);
  }

  state = {
    isShowText: !this.props.isProtected,
  }

  public render() {
    const { classes, fieldId, inputValue, isProtected, isMultiline, handleInputChange }  = this.props;

    const adornment = {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle text visibility"
            onClick = {() => this.setState({isShowText: !this.state.isShowText})}
          >
            {this.state.isShowText
                  ? <SvgIcon><path d={SystemIcon.visibilityOn}/></SvgIcon>
                  : <SvgIcon><path d={SystemIcon.visibilityOff}/></SvgIcon>
            }
          </IconButton>
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
          onChange = {e => handleInputChange(fieldId, e.target.value, isProtected)}
          InputProps = {isProtected ? adornment : {}}
        />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(FieldInput);
