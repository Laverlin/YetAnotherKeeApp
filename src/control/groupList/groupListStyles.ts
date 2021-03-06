import { createStyles, Theme } from "@material-ui/core";
import { scrollBar } from "../common";

export const groupListStyles = (theme: Theme) =>  createStyles({
  listItemText:{
    fontSize: theme.typography.body1.fontSize,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    color: theme.palette.background.default
  },

  listItemSubText:{
    fontSize:theme.typography.caption.fontSize,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    color: theme.palette.grey[400]
  },

  listItem:{
    height: theme.spacing(6),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '&:hover, &:focus': {
      backgroundColor: 'rgba(170, 170, 170, 0.2)',
    },
    '&:hover': {
      '& $menuButtonDiv': {
        display: 'block'
      }
    },
    '&.Mui-selected': {
      backgroundColor:'#4481C2',
      '& $menuButtonDiv': {
        display: 'block'
      },
      '&:hover': {
        backgroundColor: '#4481C2'
      },
    }
  },

  menuButtonDiv: {
    display: 'none'
  },

  icon:{
    color: theme.palette.grey.A100,
    justifyContent:'center'
  },

  colorIcon: {
    padding: theme.spacing(1/2)
  },

  smallIcon: {
    width: theme.spacing(1),
    height: theme.spacing(1),
    marginRight: theme.spacing(1/2)
  },

  optionList:{
    overflow: 'hidden',
    position: 'absolute',
    paddingTop: theme.spacing(1),
    top:0,
    left:0,
    right:0,
    height: theme.spacing(6 * 3 + 1),
    borderBottomWidth:'1px',
    borderBottomColor: theme.palette.grey.A100,
    borderBottomStyle: 'solid',
  },

  mainList:{
    overflow: 'hidden',
    position: 'absolute',
    paddingTop: theme.spacing(1),
    bottom: theme.spacing(9),
    top: theme.spacing(6 * 3 + 2) ,
    left: 0,
    right: 0,
  },

  scrollBar: scrollBar,

  rbList:{
    overflow: 'hidden',
    position: 'absolute',
    paddingTop: theme.spacing(1),
    bottom: 0,
    height: theme.spacing(8),
    right: 0,
    left: 0,
    borderTopWidth:'1px',
    borderTopColor: theme.palette.grey.A100,
    borderTopStyle: 'solid',
  },

  colorSelector: {
    position: 'absolute',
    top:0,
    left:0,
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2 + 1/2),
  },

  tagSelector: {
    maxHeight: 200,
    width: 250,
  },

  changeMark: {
    position:'absolute',
    marginTop: '-20px',
    marginLeft: '-5px',
    height: '10px',
    width: '10px',
    backgroundColor: '#f35b04',
    borderRadius: '50%',
    display: 'block',
  }

});
