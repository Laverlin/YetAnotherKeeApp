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
import { customPropertyMenuAtom, DefaultFields, itemStateAtom, KdbxItemState, notificationAtom, openPanel, passwordPanelAtom, SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import { ProtectedValue } from 'kdbxweb';


const styles = (theme: Theme) =>  createStyles({
  fieldInput: {
    padding: theme.spacing(1),
  },
  copyIconButton: {
    position:'absolute',
    top:'2px',
    right: '2px'
  },
  copyIcon: {
    width: '16px',
    height: '16px'
  },
  adornmentButttons: {
    marginRight: '10px'
  }
})

interface IProp extends WithStyles<typeof styles> {
  entry: KdbxItemState,
  fieldId: string,
  inputValue: string,
  isProtected: boolean,
  isMultiline: boolean,
  isCustomProperty: boolean,
  disabled?: boolean,
}

const PropertyInput: React.FC<IProp> =
  ({classes, entry, fieldId, inputValue, isProtected, isMultiline, isCustomProperty, disabled}) => {

    // global state
    //
    const setEntryState = useSetRecoilState(itemStateAtom(entry.uuid.id));
    const setMenuState = useSetRecoilState(customPropertyMenuAtom);
    const setPwdPanelState = useSetRecoilState(passwordPanelAtom);
    const setNotification = useSetRecoilState(notificationAtom);

    // local state
    //
    const [isShowText, toggleShowText] = useState<boolean>(!isProtected);
    useEffect(() => {toggleShowText(!isProtected)}, [isProtected, entry])

    // handlers
    //
    const handlePropertyChande = (fieldId: string, value: string) => {
      const fieldValue = isProtected ? ProtectedValue.fromString(value) : value;
      setEntryState(entry.setField(fieldId, fieldValue));
    }

    const handleCopy = (fieldId: string) => {
      navigator.clipboard.writeText(entry.getFieldUnprotected(fieldId));
      const fieldName = fieldId in DefaultFields ? DefaultFields[(fieldId as keyof typeof DefaultFields)] : fieldId;
      setNotification(`${fieldName} is copied`);
    }

    // helpers
    //
    const adornment = {
      endAdornment: (
        <InputAdornment position="end">
          <div className = {classes.adornmentButttons}>
            {isProtected &&
              <IconButton
                aria-label="toggle text visibility"
                onClick = {() => toggleShowText(!isShowText)}
              >
                <SvgPath path = {isShowText ? SystemIcon.visibilityOn : SystemIcon.visibilityOff}/>
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
          </div>
          <IconButton
            className = {classes.copyIconButton}
            onClick={() => handleCopy(fieldId)}
            size = "small"
            disabled = {!inputValue}
          >
            <SvgPath path={SystemIcon.copyFile} className = {classes.copyIcon}/>
          </IconButton>
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


