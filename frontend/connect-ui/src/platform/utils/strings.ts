import {saveAs} from "file-saver"
export const hexToBase64 = (hex:string) => {
  return Buffer.from(hex, "hex").toString("base64")
}

export const saveHexToFile = (hex:string,name:string) => {
  const binaryData = Buffer.from(hex, "hex")
  // Create a new Blob object from the binary data
  const blob = new Blob([binaryData], { type: 'application/octet-stream' });

  // Save the file using FileSaver.js
  saveAs(blob, name);
}