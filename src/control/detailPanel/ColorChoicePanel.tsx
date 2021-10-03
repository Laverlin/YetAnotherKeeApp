import * as React from 'react';
import { createStyles, GridList, GridListTile, IconButton,  Popover, Theme,  WithStyles, withStyles } from '@material-ui/core';
import { DefaultColors, SystemIcon } from '../../entity';
import { SvgPath, scrollBar } from '../common';
import clsx from 'clsx';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { editSelectedItem } from '../../entity/state/Atom';
import { closePanel, colorChoisePanelAtom } from '../../entity/state/PanelStateAtoms';
import { KdbxItemWrapper } from '../../entity/model/KdbxItemWrapper';

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

interface IProps  extends WithStyles<typeof styles> {
  entry: KdbxItemWrapper;
}

const ColorChoicePanel: React.FC<IProps> = ({classes, entry}) => {

  const [panelState, setPanelState] = useRecoilState(colorChoisePanelAtom);
  const setEntryState = useSetRecoilState(editSelectedItem);

  const handleSetColor = (color: string) => {
    setEntryState(entry.applyChanges(entry => entry.bgColor = color));
    setPanelState(closePanel);
  }

  let colors = Object.keys(DefaultColors);
  colors.push('black');

  return (
    <Popover
      open = {panelState.isShowPanel}
      anchorEl = {panelState.panelAnchor}
      anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin = {{vertical: 'top', horizontal: 'right'}}
      onClose = {() => setPanelState(closePanel)}
    >
      <div className = {classes.root}>
        <GridList cellHeight = {70} className = {clsx(classes.gridList, classes.scrollBar)} cols = {7}>
          {colors.map(i =>
            <GridListTile className = {classes.gridTitle} key = {i}>
              <IconButton
                className = {classes.colorButton}
                size='medium'
                onClick = {() => handleSetColor(Reflect.get(DefaultColors, i))}
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

export default withStyles(styles, { withTheme: true })(ColorChoicePanel);
