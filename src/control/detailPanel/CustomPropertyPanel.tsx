import * as React from 'react';
import { Checkbox, createStyles, FormControlLabel, IconButton,  Popover, TextField, Theme,  WithStyles, withStyles } from '@material-ui/core';
import { KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { SvgPath } from '../common';
import {  KdbxEntry, KdbxGroup, ProtectedValue} from 'kdbxweb';

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

interface ICustomPropertyPanelProps  extends WithStyles<typeof styles> {
  panelAncor: Element;
  isPanelOpen: boolean;
  onClose: {(): void};
  entry: KdbxEntry;
}

interface ICustomPropertyStateProps {
  customPropertyName: string,
  isProtected: boolean
}

class CustomPropertyPanel extends React.Component<ICustomPropertyPanelProps, ICustomPropertyStateProps> {
  static contextType = KeeDataContext;
  constructor(props: ICustomPropertyPanelProps) {
    super(props);
    this.handleAddCustomProperty = this.handleAddCustomProperty.bind(this);

    this.state = {
      customPropertyName: '',
      isProtected: false
    }

  }

  handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      this.handleAddCustomProperty();
      event.preventDefault();
    }
  }

  handleAddCustomProperty() {
    this.props.onClose();
    if (!this.state.customPropertyName) {
      return;
    }
    (this.context as KeeData).updateEntry(
      this.props.entry,
      entry => {
      if (entry instanceof KdbxEntry) {
        entry.fields.set(
          this.state.customPropertyName,
          this.state.isProtected
            ? ProtectedValue.fromString('')
            : ''
        );
      }
    });

    this.setState({customPropertyName: '', isProtected: false});
  }

  public render() {

    const { classes, panelAncor, isPanelOpen } = this.props;
    const { customPropertyName: inputValue } = this.state;

    return (
      <Popover
        open = {isPanelOpen}
        anchorEl = {panelAncor}
        anchorOrigin = {{vertical: 'bottom', horizontal: 'center'}}
        transformOrigin = {{vertical: 'top', horizontal: 'left'}}
        onClose = {() => this.props.onClose()}
      >
        <div className = {classes.root} onKeyPress = {this.handleKeyPress}>
          <TextField
            id = 'customProperty'
            fullWidth
            label = 'Property Name'
            variant = "outlined"
            value = {inputValue}
            onChange = {e => this.setState({customPropertyName: e.target.value})}
          />
          <FormControlLabel
            control = {
              <Checkbox
                checked = {this.state.isProtected}
                onChange = {() => this.setState({isProtected: !this.state.isProtected})}
                color = 'primary'
              />
            }
            label = 'Protected Value'
          />
          <IconButton onClick = {this.handleAddCustomProperty}>
            <SvgPath path = {SystemIcon.enterKey} />
          </IconButton>
        </div>
      </Popover>
    );
  }
}

export default withStyles(styles, { withTheme: true })(CustomPropertyPanel);

