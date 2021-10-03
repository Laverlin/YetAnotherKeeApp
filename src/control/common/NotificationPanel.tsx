import { Snackbar } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { FC } from "react"
import { useRecoilState } from "recoil";
import { notificationAtom } from "../../entity/state/PanelStateAtoms";

export const NotificationPanel: FC = () => {

  const [message, setMessage] = useRecoilState(notificationAtom);

  const onClose = () => { setMessage(''); }

  return(
    <Snackbar
      open = {!!message}
      autoHideDuration = {6000}
      anchorOrigin = {{vertical: 'bottom', horizontal: 'right'}}
      onClose = {() => onClose()}
    >
      <Alert onClose = {() => onClose()} severity = "success">
        {message}
      </Alert>
    </Snackbar>
  )
}
