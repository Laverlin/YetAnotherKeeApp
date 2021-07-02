import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { createStyles, WithStyles, withStyles, Theme } from "@material-ui/core/styles";
import { IconButton, InputAdornment, TextField, Typography } from "@material-ui/core";
import { DefaultKeeIcon, SystemIcon } from "../entity/GlobalObject";
import { remote } from "electron";
import KeeData from "../entity/KeeData";
import { KeeDataContext } from "../entity/Context";
import path from "path";
import { SvgPath } from "./common/SvgPath";
import { ProtectedValue } from "kdbxweb";


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

});

interface Props extends WithStyles<typeof styles>, RouteComponentProps {}

class SelectDb extends React.Component<Props> {

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

  handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      this.handleEnterPassword();
      event.preventDefault();
    }
  }

  handleEnterPassword = async () => {
    if (this.state.selectedFile) {
      const keeData = (this.context as KeeData);
      keeData.clearDb();
      keeData.dbFullPath = this.state.selectedFile;
      keeData.password = ProtectedValue.fromString(this.state.password);
      try{
        await keeData.loadDb();
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
            <Typography variant="caption">{this.state.selectedFile}</Typography>
          </div>
        </form>
      </>
    );
  }
}

export default withRouter(withStyles(styles, { withTheme: true }) (SelectDb));
