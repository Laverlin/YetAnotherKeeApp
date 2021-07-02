import React from 'react';
import {
  createStyles,
  WithStyles,
  withStyles,
  Theme,
} from '@material-ui/core/styles';
import GroupList from './groupList/GroupList';
import ItemListPanel from './ItemListPanel';
import ItemDetailPanel from './ItemDetailPanel';

class DraggerPosition {
  position: number;
  minPosition: number;
  maxPosition: number;
  constructor(position: number, min: number, max: number){
    this.position = position,
    this.maxPosition = max,
    this.minPosition = min
  }

}

const styles = (theme: Theme) => createStyles({
    leftBar: {
      overflow: 'hidden',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: theme.palette.primary.main
    },

    middleBar: {
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      bottom: 0,
      backgroundColor: theme.palette.background.paper
    },

    rightBar: {
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      backgroundColor: theme.palette.background.default
    },

    dragger: {
      width: '3px',
      cursor: 'ew-resize',
      padding: '6px 0 0',
      position: 'absolute',
      top: 0,
      bottom: 0,
      '&:hover': {
        background: theme.palette.info.main,
      },
      transitionDuration: '.5s',
      transitionProperty: 'background',
      zIndex:1000
    },
  });

type Props = WithStyles<typeof styles>;

class MainLayout extends React.Component<Props> {
  state = {
    draggers : [
      new DraggerPosition(300, 90, 400),
      new DraggerPosition(window.innerWidth - 450, window.innerWidth - 650, window.innerWidth - 390)],
    draggerId: 1,
    wWidth: window.innerWidth
  };

  constructor(props:Props){
    super(props);
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount(){
    window.addEventListener('resize', this.handleResize);
    this.setState({wWidth: window.innerWidth});
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  handleMousedown = (_: React.MouseEvent<HTMLDivElement, MouseEvent>, draggerId: 0 | 1) => {
    this.setState({draggerId: draggerId});
    document.addEventListener('mouseup', this.handleMouseUp, true);
    document.addEventListener('mousemove', this.handleMouseMove, true);
  };

  handleMouseUp = () => {
    document.removeEventListener('mouseup', this.handleMouseUp, true);
    document.removeEventListener('mousemove', this.handleMouseMove, true);
  };

  handleMouseMove = (e: MouseEvent) => {
    const offset = e.clientX - document.body.offsetLeft;
    if (offset > this.state.draggers[this.state.draggerId].minPosition &&
      offset < this.state.draggers[this.state.draggerId].maxPosition) {
      this.state.draggers[this.state.draggerId].position = offset;
      this.forceUpdate();
    }
    e.preventDefault();
  };

  handleResize(){
    const offset = window.innerWidth - this.state.wWidth;
    this.state.draggers[1].position += offset;
    this.state.draggers[1].maxPosition += offset;
    this.state.draggers[1].minPosition += offset;
    this.setState({wWidth: window.innerWidth});
  }

  render() {
    const { classes } = this.props;
    return (
      <>
        <div
          className={classes.leftBar}
          style={{ width: this.state.draggers[0].position }}
        >
          <GroupList />
        </div>
        <div
          className={classes.dragger}
          onMouseDown={(e) => this.handleMousedown(e, 0)}
          style={{ left: this.state.draggers[0].position }}
        />
        <div
          className={classes.middleBar}
          style = {{
            left: this.state.draggers[0].position,
            right: window.innerWidth - this.state.draggers[1].position
          }}
        >
          <ItemListPanel />
        </div>

        <div
          className={classes.dragger}
          onMouseDown={(e) => this.handleMousedown(e, 1)}
          style={{ left: this.state.draggers[1].position }}
        />
        <div
          className={classes.rightBar}
          style={{ left: this.state.draggers[1].position }}
        >
          <ItemDetailPanel />
        </div>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MainLayout);
