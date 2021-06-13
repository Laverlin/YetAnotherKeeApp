import clsx from "clsx";
import React from "react";
import { createStyles, darken, Theme, Tooltip,  withStyles, WithStyles} from "@material-ui/core";

import { KdbxEntry} from "kdbxweb";
import { DefaultKeeIcon, SystemIcon } from "../entity/GlobalObject";
import { KeeDataContext } from "../entity/Context";
import KeeData from "../entity/KeeData";
import { SvgPath } from "./helper/SvgPath";

const styles = (theme: Theme) =>  createStyles({
  list: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    paddingTop: theme.spacing(2),
    overflow: 'hidden',
    "overflow-y": 'overlay',
    "&::-webkit-scrollbar" : {
      width: '10px',
    },
    "&::-webkit-scrollbar-track": {
      background: 'transparent',
    },
    "&::-webkit-scrollbar-thumb": {
      background: 'transparent',
      borderRadius: '6px',
      backgroundClip: 'padding-box',
      borderRight: '2px transparent solid',
      borderLeft: '2px transparent solid'
    },
    "&:hover": {
      "&::-webkit-scrollbar-thumb": {
        backgroundColor:'rgba(0, 0, 0, 0.4)'
      }
    }
  },

  title: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    fontFamily: theme.typography.subtitle1.fontFamily,
    fontWeight: theme.typography.subtitle1.fontWeight,
    fontSize: theme.typography.subtitle1.fontSize,
    lineHeight: theme.typography.subtitle1.lineHeight,
    letterSpacing: theme.typography.subtitle1.letterSpacing,
  },

  titleSecondary: {
    color: theme.palette.text.secondary,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace:'nowrap',
    fontFamily: theme.typography.caption.fontFamily,
    fontWeight: theme.typography.caption.fontWeight,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    letterSpacing: theme.typography.caption.letterSpacing,
  },

  inlineLeftIcon: {
    width: 10,
    height: 10,
    paddingRight: theme.spacing(1),
  },

  listItem : {
    position:'relative',
    display:'flex',
    flexDirection:'row',
    height:86,
    borderBottom:'1px dotted lightgray',
    "&:hover": {
      backgroundColor: theme.palette.background.default
    }
  },

  listItemSelected: {
    backgroundColor: darken(theme.palette.background.default, 0.03),
    "&:hover": {
      backgroundColor: darken(theme.palette.background.default, 0.03)
    }
  },

  mainIconDiv: {
    width:50, height:50, margin:16, display:'flex'
  },

  flexAlignRight: {
    marginLeft: 'auto'
  },

  itemContent: {
    display:'flex',
    flexDirection:'column',
    width:'100%',
    minWidth:0
  },

  itemContentRow: {
    display:'flex',
    flexDirection:'row',
    minWidth:0,
    paddingRight:'8px',
  },

  itemAttachIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginRight: 12,
    color: 'gray'
  },

  itemContentLastRow: {
    color: '#CCCCCC',
    marginRight: 30
  }


});

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(12),
  },
}))(Tooltip);


interface Props extends WithStyles<typeof styles> {}

class ItemListPanel extends React.Component<Props> {
  static contextType = KeeDataContext;

  state = {
    entries: [] as KdbxEntry[] | undefined,
    selectedEntryId: ""
  }

  constructor(props : Props){
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  componentDidMount() {
    const keeData = (this.context as KeeData);
    keeData.addGroupListener(this.handleUpdate);
    const entities = keeData.database.getDefaultGroup().entries;
    this.setState({entries: Array.from(entities) });
  }

  componentWillUnmount() {
    const keeData = (this.context as KeeData);
    keeData.removeGroupListener(this.handleUpdate);
  }

  handleUpdate(entries: KdbxEntry[]) {
    this.setState({entries: entries});
  }

  handleClick(entry: KdbxEntry){
    (this.context as KeeData).notifyEntrySubscribers(entry);
    this.setState({selectedEntryId: entry.uuid.id})
  }

  render(){
    const { classes } = this.props;

        return (
        <div className = {classes.list}>
          {this.state.entries?.map((entry) =>
            <LightTooltip
              key = {entry.uuid.id}
              title = {
                entry.fields.get('Notes')
                  ? <React.Fragment> {entry.fields.get('Notes')} </React.Fragment>
                  : ""
              }
            >
              <div
                onClick = {() => this.handleClick(entry)}
                className = {
                  clsx(classes.listItem, (this.state.selectedEntryId === entry.uuid.id) && classes.listItemSelected)
                }
              >
                <div className = {classes.mainIconDiv}>
                  <SvgPath className = {classes.flexAlignRight} path = {DefaultKeeIcon.get(entry.icon ?? 0)} />
                </div>
                <div className = {classes.itemContent}>
                  <div className = {classes.itemContentRow}>
                    <div className={classes.title}>
                      {entry.fields.get('Title') === '' ? "(No Title)" : entry.fields.get('Title')}
                    </div>
                    {entry.times.expires &&
                      <div className={clsx(classes.titleSecondary, classes.flexAlignRight)}>
                        <SvgPath className={classes.inlineLeftIcon} path = {SystemIcon.expire} />
                        {entry.times.expiryTime?.toDateString()}
                      </div>
                    }
                  </div>
                  <div className = {classes.itemContentRow}>
                    <div className={classes.titleSecondary}>
                      { entry.fields.get('UserName') !== '' &&
                        <>
                          <SvgPath className={classes.inlineLeftIcon} path = {SystemIcon.user} />
                          {entry.fields.get('UserName')}
                        </>
                      }
                    </div>

                  </div>
                  <div className={classes.titleSecondary}>
                    { entry.fields.get('URL') !== '' &&
                      <>
                        <SvgPath className={classes.inlineLeftIcon} path = {DefaultKeeIcon.link}/>
                        {entry.fields.get('URL')}
                      </>
                    }
                  </div>
                  <div className={clsx(classes.titleSecondary, classes.itemContentLastRow)} >
                    { entry.tags.length > 0 &&
                      <>
                        <SvgPath className={classes.inlineLeftIcon} path = {SystemIcon.tag} />
                        {entry.tags.join(', ')}
                      </>
                    }
                  </div>
                </div>
                <div className = {classes.itemAttachIcon}>
                  { entry.binaries.size > 0 && <SvgPath path = {SystemIcon.attachFile} /> }
                </div>
                <div style={{width:'8px', backgroundColor: entry.bgColor}}/>
              </div>
            </LightTooltip>
          )}
      </div>
    )
  }

}

export default withStyles(styles, { withTheme: true })(ItemListPanel);
