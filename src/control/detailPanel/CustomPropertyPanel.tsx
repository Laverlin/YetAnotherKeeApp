import React, {useState} from 'react';
import {
  Checkbox,
  createStyles,
  FormControlLabel,
  IconButton,
  Popover,
  TextField,
  Theme,
  WithStyles,
  withStyles
} from '@material-ui/core';
import { SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import { KdbxItemWrapper } from '../../entity/model/KdbxItemWrapper';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { closePanel, customPropertyPanelAtom } from '../../entity/state/PanelStateAtoms';
import { editSelectedItem } from '../../entity/state/Atom';
import { ProtectedValue } from 'kdbxweb';

const styles = (theme: Theme) =>  createStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems:'center',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    width: 450,
    height: 100,
  },

});

interface IProps  extends WithStyles<typeof styles> {
  entry: KdbxItemWrapper;
}

const CustomPropertyPanel: React.FC<IProps> = ({classes, entry}) => {
  const [customPropertyName, setCustomPropName] = useState('');
  const [isProtected, toggleIsProtected] = useState(false);
  const [panelState, setPanelState] = useRecoilState(customPropertyPanelAtom);
  const editEntry = useSetRecoilState(editSelectedItem);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleAddCustomProperty();
      event.preventDefault();
    }
  }

  const handleAddCustomProperty = () => {
    if (!customPropertyName)
      return;

    editEntry(entry.applyChanges(entry =>
      entry.setField(
        customPropertyName,
        isProtected ? ProtectedValue.fromString('') : ''
      )
    ));
    setCustomPropName('');
    toggleIsProtected(false);
    setPanelState(closePanel);
  }

  return (
    <Popover
      open = {panelState.isShowPanel}
      anchorEl = {panelState.panelAnchor}
      anchorOrigin = {{vertical: 'bottom', horizontal: 'center'}}
      transformOrigin = {{vertical: 'top', horizontal: 'left'}}
      onClose = {() => setPanelState(closePanel)}
    >
      <div className = {classes.root} onKeyPress = {handleKeyPress}>
        <TextField
          id = 'customProperty'
          fullWidth
          label = 'Property Name'
          variant = "outlined"
          value = {customPropertyName}
          onChange = {e => setCustomPropName(e.target.value)}
        />
        <FormControlLabel
          control = {
            <Checkbox
              checked = {isProtected}
              onChange = {() => toggleIsProtected(!isProtected)}
              color = 'primary'
            />
          }
          label = 'Protected Value'
        />
        <IconButton onClick = {handleAddCustomProperty}>
          <SvgPath path = {SystemIcon.enterKey} />
        </IconButton>
      </div>
    </Popover>
  );
}

export default withStyles(styles, { withTheme: true })(CustomPropertyPanel);

