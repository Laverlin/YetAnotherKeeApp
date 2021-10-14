import React, { useReducer, useRef, useState } from "react";
import {useSetRecoilState, useRecoilCallback} from 'recoil'
import { RouteComponentProps, withRouter } from "react-router-dom";
import { createStyles, WithStyles, withStyles, Theme } from "@material-ui/core/styles";
import {
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography
} from "@material-ui/core";
import { DefaultKeeIcon, SystemIcon } from "../entity";
import { remote } from "electron";
import path from "path";
import { SvgPath } from "./common/SvgPath";
import { ProtectedValue } from "kdbxweb";
import { Setting, UserSetting } from "../entity/SettingStorage";
import {
  colorFilterAtom,
  currentContext,
  isDbSavedSelector,
  searchFilterAtom,
  selectItemSelector,
  tagFilterAtom,
  itemIdsAtom,
  GlobalContext,
  setGlobalContext
} from "../entity";
import clsx from 'clsx';

import loadStyles from "./common/spinner.scss";


const styles = (theme: Theme) =>  createStyles({
  form: {
    display:'flex',
    flexDirection:'column',
    height: '100%',
    justifyContent: 'center',
    alignItems:'center'
  },

  content: {
    width: '40%',
    marginTop: '150px',
    marginBottom:'auto'
  },

  icon60: {
    width: 60,
    height: 60
  },

  icon50: {
    width: 50,
    height: 50
  },

  inputRow: {
    display:'flex',
    flexDirection:'row',
    alignItems:'top',
  },

  enterButton: {
    marginLeft: theme.spacing(1),
    marginTop: -theme.spacing(2),
    height: '75px'
  },

  recentFilesRow: {
    height: theme.spacing(5),
    width: '100%',
    '&:hover': {
      '& $clearButton': {
        display: 'block'
      }
    }
  },

  clearButton: {
    display:'none',
  },

  selectedFile: {
    height: '30px',
    display:'flex',
    alignItems:'center',
    marginBottom:'20px'
  },

  selectedFileIcon: {
    height:15,
    width:15,
    marginRight:'40px',
    marginLeft:'20px'
  },

  loader: {
    marginLeft: '15px'
  }
});

interface IProps extends WithStyles<typeof styles>, RouteComponentProps {}

const OpenFilePanel: React.FC<IProps> = ({classes, history}) => {

  const userSetting = Setting.load(UserSetting);

  const setItemIds = useSetRecoilState(itemIdsAtom);
  const [isShowPassword, toggleShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedFileName, setFileName] = useState<string | undefined>(userSetting.recentFiles[0]);
  const [error, setError] = useState('');
  const clearState = useRecoilCallback(({set}) => () => {
    set(colorFilterAtom, {color:''});
    set(tagFilterAtom, []);
    set(searchFilterAtom, '');
    set(selectItemSelector, GlobalContext.allItemsGroupUuid);
    set(isDbSavedSelector, true);
  });

  const [isLoading, setLoading] = useState(false);

  ///TMP!!
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  ///END TMP

  const handleOpenFile = () => {
    const file = remote.dialog.showOpenDialogSync({properties: ['openFile']});
    setPassword('');
    setError('');
    setFileName(file ? file[0] : undefined);
    if (file)
      setInputFocus();
  }

  const handleFileRemove = (event: React.MouseEvent<HTMLButtonElement>, file: string) => {
    event.stopPropagation();
    userSetting.recentFiles = userSetting.recentFiles.filter(f => f !== file);
    userSetting.save();
    forceUpdate();
  }

  const updateRecentFiles = (file: string) => {
    userSetting.recentFiles = userSetting.recentFiles.filter(f => f !== file);
    if (userSetting.recentFiles.unshift(file) > 8)
      userSetting.recentFiles.pop();
    userSetting.save()
  }

  const handleFileSelect = (selectedFile: string) => {
    setFileName(selectedFile);
    setError('');
    setPassword('');
    setInputFocus();
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      handleEnterPassword();
      event.preventDefault();
    }
  }

  const handleEnterPassword = async () => {

    if (selectedFileName) {
      try {
        setLoading(true);
        clearState();
        const gc = await GlobalContext.LoadContext(selectedFileName, ProtectedValue.fromString(password));
        setGlobalContext(gc);
        setItemIds(currentContext().allItemIds);
        updateRecentFiles(selectedFileName);
        history.push("/app");
      }
      catch (error) {

        const errorMsg = (error.code === 'InvalidKey')
          ? 'Wrong Password'
          : error.message ? error.message : error;
        setError(errorMsg);
      }
      setLoading(false);
    }
  }

  const useFocus = () => {
    const htmlElRef = useRef<HTMLElement | null>(null)
    const setFocus = () => {
      htmlElRef.current &&  htmlElRef.current.focus()
    }

    return [ htmlElRef, setFocus ] as const
  }

  const [inputRef, setInputFocus] = useFocus();

  return(
    <>
      <form
        autoComplete = "off"
        className = {classes.form}
        onKeyPress = {e => handleKeyPress(e)}
      >
        <div className = {classes.content}>
          <div>
            <IconButton onClick = {handleOpenFile}>
              <SvgPath className = {classes.icon60} path = {DefaultKeeIcon["folder-o"]} />
            </IconButton>
          </div>

          <div className = {classes.inputRow}>
            <TextField
              id = "password"
              inputRef = {inputRef}
              fullWidth
              autoFocus
              disabled = {!selectedFileName}
              label = {selectedFileName && "Password for " + path.parse(selectedFileName).base}
              error = {!!error}
              helperText = {error}
              variant = "outlined"
              placeholder = {"Password "}
              type = {isShowPassword ? 'text' : 'password'}
              value = {password}
              onChange = {e => setPassword(e.target.value)}
              InputProps = {{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label = "toggle password visibility"
                      disabled = {!selectedFileName}
                      onClick = {() => toggleShowPassword(!isShowPassword)}
                    >
                      {isShowPassword
                        ? <SvgPath path = {SystemIcon.visibilityOn} />
                        : <SvgPath path = {SystemIcon.visibilityOff} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {!isLoading
              ? <IconButton
                  className = {classes.enterButton}
                  onClick = {handleEnterPassword}
                  disabled = {!selectedFileName}
                >
                  <SvgPath className = {classes.icon50} path = {SystemIcon.enterKey} />
                </IconButton>
              : <div className = {
                  clsx(loadStyles["spinner"], loadStyles["spinner-1"], classes.enterButton)}
                />
            }
          </div>
          <div className = {classes.selectedFile}>
            {selectedFileName &&
              <>
                <SvgPath path = {SystemIcon.cone_right} className = {classes.selectedFileIcon} />
                <Typography variant="caption">{selectedFileName}</Typography>
              </>
            }
          </div>
          <List>
          {userSetting.recentFiles.map(file =>
            <ListItem
              button
              key = {file}
              className = {classes.recentFilesRow}
              onClick = {() => handleFileSelect(file)}
            >
              <ListItemIcon>
                <SvgPath path = {DefaultKeeIcon.database} />
              </ListItemIcon>
              <ListItemText>
                <Typography variant = "body1">{file}</Typography>
              </ListItemText>

                <IconButton onClick = {e => handleFileRemove(e, file)} className = {classes.clearButton}>
                  <SvgPath path = {SystemIcon.clear} />
                </IconButton>

            </ListItem>

          )}
          </List>
        </div>
      </form>
    </>

  )
}


export default withRouter(withStyles(styles, { withTheme: true }) (OpenFilePanel));
