import React, { FC } from "react"
import { makeStyles, Theme } from "@material-ui/core"
import assert from "assert"

interface IProps {
  size?: number;
  color?: string;
  thickness?: number;
}

const hex2rgba = (color: string, alpha: number = 1) => {
  assert(/^#[A-Fa-f0-9]{6}$/.test(color));
  const [r, g, b] = color.match(/\w\w/g)!.map(x => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
const size = (props: IProps) => props.size || 75;
const thickness = (props: IProps) => props.thickness || 4;
const color = (props: IProps, theme: Theme) => props.color || theme.palette.primary.main;
const outerSize = (props: IProps) => size(props) - thickness(props) * 2;
const innerSize = (props: IProps) => outerSize(props) * 0.6;

const styles = makeStyles<Theme, IProps>(theme => ({

  '@global':{
    '@keyframes rotate-animation': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(360deg)'
      }
    },

    '@keyframes anti-rotate-animation': {
      '0%': {
        transform: 'rotate(0deg)'
      },
      '100%': {
        transform: 'rotate(-360deg)'
      }
    },
  },

  spinner: props => ({
    position: 'relative',
    width: size(props),
    height: size(props),
    margin: 'auto',
    '&:before, &:after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      borderWidth: thickness(props),
      borderStyle: 'solid',
      borderRadius: '50%',
    },
    '&:before': {
      width: outerSize(props),
      height: outerSize(props),
      borderBottomColor: color(props, theme),
      borderRightColor: color(props, theme),
      borderTopColor: hex2rgba(color(props, theme), 0),
      borderLeftColor: hex2rgba(color(props, theme), 0),
      top: '0px',
      left: '0px',
      animation: 'rotate-animation 1s linear 0s infinite',
    },
    '&:after': {
      width: innerSize(props),
      height: innerSize(props),
      borderBottomColor: color(props, theme),
      borderRightColor: color(props, theme),
      borderTopColor: hex2rgba(color(props, theme), 0),
      borderLeftColor: hex2rgba(color(props, theme), 0),
      top: (outerSize(props) - innerSize(props)) / 2,
      left: (outerSize(props) - innerSize(props)) / 2,
      animation: 'anti-rotate-animation 0.85s linear 0s infinite'
    }
  })
}));

/**
 * Progress indicator control in a form of two spinners
 */
export const Spinner: FC<IProps> = (props: IProps) => {
  const classes = styles(props);
  return (<div className = {classes.spinner}/>)
}

