import * as React from 'react';
import { createStyles, GridList, GridListTile, IconButton,  Popover, Theme,  WithStyles, withStyles } from '@material-ui/core';
import { DefaultColors, KeeData, KeeDataContext, SystemIcon } from '../../entity';
import { SvgPath, scrollBar } from '../common';
import clsx from 'clsx';
import {  KdbxEntry, KdbxGroup} from 'kdbxweb';

const styles = (theme: Theme) =>  createStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1)
  },
  gridList: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 450,
    height: 80,
  },

  colorIcon: {
    width: theme.spacing(5),
    height: theme.spacing(5)
  },

  colorButton: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  },

  gridTitle: {
    alignItems: 'center',
  },

  scrollBar: scrollBar,

});

interface IColorChoicePanelProps  extends WithStyles<typeof styles> {
  panelAncor: Element;
  isPanelOpen: boolean;
  onClose: {(): void};
  entry: KdbxEntry;
}

class ColorChoicePanel extends React.Component<IColorChoicePanelProps> {
  static contextType = KeeDataContext;
  constructor(props: IColorChoicePanelProps) {
    super(props);
  }

  handleSetColor(color: string){
    this.props.onClose();
    (this.context as KeeData).updateEntry(
      this.props.entry,
      entry => (entry as KdbxEntry).bgColor = color
    );
  }

  public render() {

    const { classes, panelAncor, isPanelOpen } = this.props;
    let colors = Object.keys(DefaultColors);
    colors.push('black');

    return (
      <Popover
        open = {isPanelOpen}
        anchorEl = {panelAncor}
        anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin = {{vertical: 'top', horizontal: 'right'}}
        onClose = {() => this.props.onClose()}
      >
        <div className = {classes.root}>
          <GridList cellHeight = {70} className = {clsx(classes.gridList, classes.scrollBar)} cols = {7}>
            {colors.map(i =>
              <GridListTile className = {classes.gridTitle} key = {i}>
                <IconButton
                  className = {classes.colorButton}
                  size='medium'
                  onClick = {() => {this.handleSetColor(Reflect.get(DefaultColors, i))}}
                >
                  <SvgPath
                    className = {classes.colorIcon}
                    path = {SystemIcon.colorEmpty}
                    style = {{ color: Reflect.get(DefaultColors, i)}}
                  />
                </IconButton>
              </GridListTile>
            )}
          </GridList>
        </div>
      </Popover>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ColorChoicePanel);

