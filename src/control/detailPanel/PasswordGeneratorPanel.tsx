import React, { FC, useState } from 'react';
import { Button, Checkbox, createStyles, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem,  Popover, Select, Slider, TextField, Theme,  Typography,  WithStyles, withStyles } from '@material-ui/core';
import { DefaultKeeIcon, closePanel, passwordPanelAtom, SystemIcon, itemStateAtom, KdbxItemState } from '../../entity';
import { SvgPath } from '../common';
import { ProtectedValue} from 'kdbxweb';
import { KeysOfType, PasswordGenerator, PasswordGenerationOptions } from '../../entity/PasswordGenerator';
import { useRecoilState, useSetRecoilState } from 'recoil';



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

interface IProps  extends WithStyles<typeof styles> {
  entry: KdbxItemState;
}

const PasswordGeneratorPanel: FC<IProps> = ({classes, entry}) =>  {

  const [passwordOptions, setPasswordOptions] = useState(new PasswordGenerationOptions());
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [panelState, setPanelState] = useRecoilState(passwordPanelAtom);
  const setEntryState = useSetRecoilState(itemStateAtom(entry.uuid.id));


  const handleOptionChange = (option: KeysOfType<PasswordGenerationOptions, boolean>) => {
    passwordOptions[option] = !passwordOptions[option];
    generatePassword(passwordOptions);
  }

  const handleLengthChange = (value: number | number[]) => {
    passwordOptions.passwordLength = value as number;
    generatePassword(passwordOptions);
  }

  const handleCustomCharsChange = (chars: string) => {
    passwordOptions.customChars = chars;
    generatePassword(passwordOptions);
  }

  const generatePassword = (options: PasswordGenerationOptions) => {
    setPasswordOptions({...options});
    setGeneratedPassword(PasswordGenerator.generatePassword(options));
  }

  const handleApplyPassword = () => {
    setPanelState(closePanel);
    navigator.clipboard.writeText(generatedPassword);
    setEntryState(entry.setField('Password', ProtectedValue.fromString(generatedPassword)));
  }

  return (
    <Popover
      open = {panelState.isShowPanel}
      anchorEl = {panelState.panelAnchor}
      anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin = {{vertical: 'top', horizontal: 'right'}}
      onClose = {() => setPanelState(closePanel)}
      onEnter = {() => generatePassword(passwordOptions)}
    >
      <div className = {classes.root}>
        <Grid container spacing = {2} className = {classes.grid}>
          <Grid item xs = {9}>
            <TextField
              disabled
              variant = "outlined"
              label = 'Generated Password'
              fullWidth
              value = {generatedPassword}
              InputProps = {{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick = {() => generatePassword(passwordOptions)}>
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
              onClick = {() => handleApplyPassword()}
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
              value = {passwordOptions.passwordLength}
              valueLabelDisplay="on"
              onChange = {(_, value) => handleLengthChange(value)}
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
                      onChange = {() => handleOptionChange(option.optionId)}
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
              onChange = {event => handleCustomCharsChange(event.currentTarget.value)}
            />
          </Grid>
        </Grid>

      </div>
    </Popover>
  );
}

export default withStyles(styles, { withTheme: true })(PasswordGeneratorPanel);
