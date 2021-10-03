import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  createStyles,
  IconButton,
  InputAdornment,
  TextField,
  Theme,
  withStyles,
  WithStyles
} from '@material-ui/core';
import { SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import { ProtectedValue } from 'kdbxweb';
import { KdbxItemWrapper } from '../../entity/model/KdbxItemWrapper';
import { editSelectedItem } from '../../entity/state/Atom';
import { customPropertyMenuAtom, openPanel, passwordPanelAtom } from '../../entity/state/PanelStateAtoms';

const styles = (theme: Theme) =>  createStyles({
  fieldInput: {
    padding: theme.spacing(1),
  },
})

interface IProp extends WithStyles<typeof styles> {
  entry: KdbxItemWrapper,
  fieldId: string,
  inputValue: string,
  isProtected: boolean,
  isMultiline: boolean,
  isCustomProperty: boolean,
  disabled?: boolean,
}

const PropertyInput: React.FC<IProp> =
  ({classes, entry, fieldId, inputValue, isProtected, isMultiline, isCustomProperty, disabled}) => {

    const changeEntry = useSetRecoilState(editSelectedItem);
    const setMenuState = useSetRecoilState(customPropertyMenuAtom);
    const setPwdPanelState = useSetRecoilState(passwordPanelAtom);
    const [isShowText, toggleShowText] = useState<boolean>(!isProtected);

    useEffect(() => {toggleShowText(!isProtected)}, [isProtected])

    const handlePropertyChande = (fieldId: string, value: string) => {
      const fieldValue = isProtected ? ProtectedValue.fromString(value) : value;
      changeEntry(entry.applyChanges(entry => entry.setField(fieldId, fieldValue)))
    }

    const adornment = {
      endAdornment: (
        <InputAdornment position="end">
          {isProtected &&
            <IconButton
              aria-label="toggle text visibility"
              onClick = {() => toggleShowText(!isShowText)}
            >
              {isShowText
                ? <SvgPath path = {SystemIcon.visibilityOn}/>
                : <SvgPath path = {SystemIcon.visibilityOff}/>
              }
            </IconButton>
          }
          {isCustomProperty &&
            <IconButton
              aria-label="context menu"
              onClick = {e => setMenuState({
                isShowPanel: true,
                panelAnchor: e.currentTarget,
                isProtected: isProtected,
                fieldId: fieldId
              })}
              disabled = {disabled}
            >
              <SvgPath path = {SystemIcon.dot_hamburger}/>
            </IconButton>
          }
          {fieldId === 'Password' &&
            <IconButton
              aria-label="password panel"
              onClick = {e => setPwdPanelState(openPanel(e.currentTarget))}
              disabled = {disabled}
            >
              <SvgPath path = {SystemIcon.dot_hamburger} />
            </IconButton>
          }
        </InputAdornment>
      )
    }

    return (
      <div className = {classes.fieldInput}>
        <TextField
          disabled = {disabled}
          id = {fieldId}
          fullWidth
          multiline = {isMultiline}
          type = {isShowText ? 'text' : 'password'}
          label = {fieldId}
          variant = "outlined"
          value = {inputValue}
          onChange = {e => handlePropertyChande(fieldId, e.target.value)}
          InputProps = {adornment}
        />
      </div>
    );
  }

export default withStyles(styles, { withTheme: true })(PropertyInput);


