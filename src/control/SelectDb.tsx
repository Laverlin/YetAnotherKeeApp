import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { createStyles, WithStyles, withStyles, Theme } from "@material-ui/core/styles";
import { IconButton, InputAdornment, List, ListItem, ListItemIcon, ListItemText, TextField, Typography } from "@material-ui/core";
import { DefaultKeeIcon, SystemIcon } from "../entity/GlobalObject";
import { remote } from "electron";
import KeeData from "../entity/KeeData";
import { KeeDataContext } from "../entity/Context";
import path from "path";
import { SvgPath } from "./common/SvgPath";
import { ProtectedValue } from "kdbxweb";
import { SettingStorage, UserSetting } from "../entity/ConfigStorage";


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
  }

});

interface Props extends WithStyles<typeof styles>, RouteComponentProps {}

class SelectDb extends React.Component<Props> {

  #setttingStorage = new SettingStorage(UserSetting);
  #userSetting: UserSetting = this.#setttingStorage.loadSettings();

  state = {
    isShowPassword: false,
    password: '',
    selectedFile: undefined as string | undefined,
    error: ''
  }
  static contextType = KeeDataContext;

  handleChange = (event: any) => {
    this.setState({[event.target.id]: event.target.value})
  }

  handleShowPassword = () => this.setState({isShowPassword: !this.state.isShowPassword});

  handleOpenFile = () => {
    const file = remote.dialog.showOpenDialogSync({properties: ['openFile']});
    this.setState({
      selectedFile: file ? file[0] : undefined,
      error: '',
      password: ''
    });
  }

  handleFileRemove(event: React.MouseEvent<HTMLButtonElement>, file: string) {
    event.stopPropagation();
    this.#userSetting.recentFiles = this.#userSetting.recentFiles.filter(f => f !== file);
    this.#setttingStorage.saveSettings(this.#userSetting);
    this.forceUpdate();
  }

  updateRecentFiles(file: string) {
    this.#userSetting.recentFiles = this.#userSetting.recentFiles.filter(f => f !== file);
    if (this.#userSetting.recentFiles.unshift(file) > 8)
      this.#userSetting.recentFiles.pop();
    this.#setttingStorage.saveSettings(this.#userSetting);
  }

  handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      this.handleEnterPassword();
      event.preventDefault();
    }
  }

  handleEnterPassword = async () => {
    if (this.state.selectedFile) {
      const keeData = (this.context as KeeData);
      try {
        await keeData.loadDb(this.state.selectedFile, ProtectedValue.fromString(this.state.password));
        this.updateRecentFiles(this.state.selectedFile);
        this.props.history.push("/app");
      }
      catch (error) {
        const errorMsg = (error.code === 'InvalidKey')
          ? 'Wrong Password'
          : error.message;
        this.setState({error: errorMsg});
      }
    }
  }

  handleFileSelect(selectedFile: string) {
    this.setState({selectedFile: selectedFile, error: '', password: ''});
  }

  render() {
    const { classes }  = this.props;

    return(
      <>
        <form
          autoComplete = "off"
          className = {classes.form}
          onKeyPress = {e => this.handleKeyPress(e)}
        >
          <div className = {classes.content}>
            <div>
              <IconButton onClick = {this.handleOpenFile}>
                <SvgPath className = {classes.icon60} path = {DefaultKeeIcon["folder-o"]} />
              </IconButton>
            </div>

            <div className = {classes.inputRow}>
              <TextField
                id = "password"
                fullWidth
                disabled = {!this.state.selectedFile}
                label = {this.state.selectedFile && "Password for " + path.parse(this.state.selectedFile).base}
                error = {!!this.state.error}
                helperText = {this.state.error}
                variant = "outlined"
                placeholder = {"Password "}
                type = {this.state.isShowPassword ? 'text' : 'password'}
                value = {this.state.password}
                onChange = {this.handleChange}
                InputProps = {{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label = "toggle password visibility"
                        onClick = {this.handleShowPassword}
                        disabled = {!this.state.selectedFile}
                      >
                        {this.state.isShowPassword
                          ? <SvgPath path = {SystemIcon.visibilityOn} />
                          : <SvgPath path = {SystemIcon.visibilityOff} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <IconButton
                className = {classes.enterButton}
                onClick = {this.handleEnterPassword}
                disabled = {!this.state.selectedFile}
              >
                <SvgPath className = {classes.icon50} path = {SystemIcon.enterKey} />
              </IconButton>
            </div>
            <div className = {classes.selectedFile}>
              {this.state.selectedFile&&
                <>
                <SvgPath path = {SystemIcon.cone_right} className = {classes.selectedFileIcon} />
                <Typography variant="caption">{this.state.selectedFile}</Typography>
                </>
              }
            </div>
            <List>
            {this.#userSetting.recentFiles.map(file =>
              <ListItem
                button
                key = {file}
                className = {classes.recentFilesRow}
                onClick = {() => this.handleFileSelect(file)}
              >
                <ListItemIcon>
                  <SvgPath path = {DefaultKeeIcon.database} />
                </ListItemIcon>
                <ListItemText>
                  <Typography variant = "body1">{file}</Typography>
                </ListItemText>

                  <IconButton onClick = {e => this.handleFileRemove(e, file)} className = {classes.clearButton}>
                    <SvgPath path = {SystemIcon.clear} />
                  </IconButton>

              </ListItem>

            )}
            </List>
          </div>
        </form>
      </>
    );
  }
}

export default withRouter(withStyles(styles, { withTheme: true }) (SelectDb));
