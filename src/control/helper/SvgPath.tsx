import React from "react";
import { SvgIcon, SvgIconTypeMap} from "@material-ui/core";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";

interface Props {
  path: string;
  viewBox ?: string;
};

export const SvgPath: OverridableComponent<SvgIconTypeMap<Props, "svg">>  = (props: Props) => {
  return <SvgIcon {...props} viewBox = {props.viewBox}><path d = {props.path} /></SvgIcon>
}
