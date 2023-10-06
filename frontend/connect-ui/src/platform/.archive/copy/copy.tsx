import { useState } from "react";
import { CopyStylesBorder, CopyText, CopyLabel } from "./copy.styles";
import { ClickToCopy } from "@icons";

interface CopyProps {
  width:string,
  height:string,
  value:string,
  style?:any
}
export const Copy = ({width, height, value, style}:CopyProps) => {
  const [copiedText, setCopiedText] = useState<boolean>(false)
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }
  return (
    <CopyStylesBorder id="copy-text" height={height} style={style} onClick={copyToClipboard}>
      {copiedText ? <CopyText width={width}>Copied to Clipboard!</CopyText> : <CopyText width={width}>{value}</CopyText>}
      <CopyLabel htmlFor="copy-text"><ClickToCopy/></CopyLabel>
    </CopyStylesBorder>
  );
};