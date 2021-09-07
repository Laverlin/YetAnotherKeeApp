import * as React from 'react';
import { Button, Checkbox, createStyles, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem,  Popover, Select, Slider, TextField, Theme,  Typography,  WithStyles, withStyles } from '@material-ui/core';
import { DefaultKeeIcon, KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import {  KdbxEntry, ProtectedValue} from 'kdbxweb';
import { KeysOfType, PasswordGenerator, PasswordGenerationOptions } from '../../entity/PasswordGenerator';

const styles = (theme: Theme) =>  createStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    width: 700,
  },
  grid: {
    margin: theme.spacing(1)
  },

});

interface IPasswordPanelProps  extends WithStyles<typeof styles> {
  panelAncor: Element;
  isPanelOpen: boolean;
  onClose: {(): void};
  entry: KdbxEntry;
}

class PasswordGeneratorPanel extends React.Component<IPasswordPanelProps> {
  static contextType = KeeDataContext;
  constructor(props: IPasswordPanelProps) {
    super(props);
    this.handleLengthChange = this.handleLengthChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleCustomCharsChange = this.handleCustomCharsChange.bind(this);
    this.handleApplyPassword = this.handleApplyPassword.bind(this);
    this.generatePassword = this.generatePassword.bind(this);
  }

  state = {
    passwordOptions: new PasswordGenerationOptions(),
    generatedPassword: '',
  }


  handleOptionChange(option: KeysOfType<PasswordGenerationOptions, boolean>) {
    this.state.passwordOptions[option] = !this.state.passwordOptions[option];
    this.generatePassword(this.state.passwordOptions);
  }

  handleLengthChange(value: number | number[]) {
    this.state.passwordOptions.passwordLength = value as number;
    this.generatePassword(this.state.passwordOptions);
  }

  handleCustomCharsChange(chars: string) {
    this.state.passwordOptions.customChars = chars;
    this.generatePassword(this.state.passwordOptions);
  }

  generatePassword(options: PasswordGenerationOptions) {
    this.setState({
      passwordOptions: options,
      generatedPassword: PasswordGenerator.generatePassword(options)
    });
  }

  handleApplyPassword() {
    this.props.onClose();
    navigator.clipboard.writeText(this.state.generatedPassword);
    (this.context as KeeData).updateEntry(
      this.props.entry,
      entry => (entry as KdbxEntry).fields
        .set('Password', ProtectedValue.fromString(this.state.generatedPassword))
    );
  }

  public render() {

    const { classes, panelAncor, isPanelOpen } = this.props;

    const {passwordOptions} = this.state;


    return (
      <Popover
        open = {isPanelOpen}
        anchorEl = {panelAncor}
        anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin = {{vertical: 'top', horizontal: 'right'}}
        onClose = {() => this.props.onClose()}
        onEnter = {() => this.generatePassword(this.state.passwordOptions)}
      >
        <div className = {classes.root}>
          <Grid container spacing = {2} className = {classes.grid}>
            <Grid item xs = {9}>
              <TextField
                disabled
                variant = "outlined"
                label = 'Generated Password'
                fullWidth
                value = {this.state.generatedPassword}
                InputProps = {{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick = {() => this.generatePassword(this.state.passwordOptions)}>
                        <SvgPath path = {SystemIcon.refresh} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs = {3}>
              <Button
                variant='contained'
                fullWidth
                style = {{height:'100%'}}
                color="primary"
                startIcon = {<SvgPath path = {DefaultKeeIcon['user-secret']} />}
                title = ''
                size = 'medium'
                onClick = {() => this.handleApplyPassword()}
              >
                &nbsp;Apply
              </Button>
            </Grid>

            <Grid item xs={3}>
              <Typography variant='body1'>Lenght of password: </Typography>
            </Grid>
            <Grid item xs={6} >
              <Slider
                min = {2}
                max = {64}
                defaultValue = {20}
                aria-labelledby="discrete-slider-always"
                step={1}
                value = {this.state.passwordOptions.passwordLength}
                valueLabelDisplay="on"
                onChange = {(_, value) => this.handleLengthChange(value)}
              />
            </Grid>
            <Grid item xs = {3}>
            <FormControl variant="filled" size="small" fullWidth>
              <Select
                variant='outlined'
                value = {0}
              >
                <MenuItem value = {0}>
                {'default preset'}
                </MenuItem>
              </Select>
            </FormControl>
            </Grid>

            {PasswordGenerator.passwordSource.map(option =>
              <Grid item xs = {6} key = {option.optionId}>
                <FormControlLabel
                    control={
                      <Checkbox
                        checked = {passwordOptions[option.optionId]}
                        onChange = {() => this.handleOptionChange(option.optionId)}
                      />
                    }
                    label = {option.label}
                  />
              </Grid>
            )}

            <Grid item xs = {6}>
              <TextField
                variant = "outlined"
                label = 'Custom characters'
                size = 'small'
                fullWidth
                value = {passwordOptions.customChars}
                onChange = {event => this.handleCustomCharsChange(event.currentTarget.value)}
              />
            </Grid>
          </Grid>

        </div>
      </Popover>
    );
  }
}

export default withStyles(styles, { withTheme: true })(PasswordGeneratorPanel);



