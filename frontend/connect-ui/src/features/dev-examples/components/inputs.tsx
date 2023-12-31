import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function InputsExample() {
  return (
    <>
      <h1>Inputs</h1>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField required id="standard-required" label="Required" defaultValue="Hello World" />
          <TextField disabled id="standard-disabled" label="Disabled" defaultValue="Hello World" />
          <TextField id="standard-password-input" label="Password" type="password" autoComplete="current-password" />
          <TextField
            id="standard-read-only-input"
            label="Read Only"
            defaultValue="Hello World"
            InputProps={{
              readOnly: true
            }}
          />
          <TextField
            id="standard-number"
            label="Number"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
          />
          <TextField id="standard-search" label="Search field" type="search" />
          <TextField id="standard-helperText" label="Helper text" defaultValue="Default Value" helperText="Some important text" />
          <TextField id="standard-helperText-error" label="Helper text error" defaultValue="Default Value" helperText="Some important text" />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField required id="filled-required" label="Required" defaultValue="Hello World" variant="filled" />
          <TextField disabled id="filled-disabled" label="Disabled" defaultValue="Hello World" variant="filled" />
          <TextField id="filled-password-input" label="Password" type="password" autoComplete="current-password" variant="filled" />
          <TextField
            id="filled-read-only-input"
            label="Read Only"
            defaultValue="Hello World"
            InputProps={{
              readOnly: true
            }}
            variant="filled"
          />
          <TextField
            id="filled-number"
            label="Number"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
            variant="filled"
          />
          <TextField id="filled-search" label="Search field" type="search" variant="filled" />
          <TextField id="filled-helperText" label="Helper text" defaultValue="Default Value" helperText="Some important text" variant="filled" />
          <TextField id="filled-helperText-error" error label="Helper text" defaultValue="Default Value" helperText="Some important text" variant="filled" />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField required id="outlined-required" label="Required" defaultValue="Hello World" variant="outlined" />
          <TextField disabled id="outlined-disabled" label="Disabled" defaultValue="Hello World" variant="outlined" />
          <TextField id="outlined-password-input" label="Password" type="password" autoComplete="current-password" variant="outlined" />
          <TextField
            id="outlined-read-only-input"
            label="Read Only"
            defaultValue="Hello World"
            InputProps={{
              readOnly: true
            }}
            variant="outlined"
          />
          <TextField
          id="outlined-number"
            label="Number"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
            variant="outlined"
          />
          <TextField id="outlined-search" label="Search field" type="search" variant="outlined" />
          <TextField id="outlined-helperText" label="Helper text" defaultValue="Default Value" helperText="Some important text" variant="outlined" />
          <TextField id="outlined-helperText-error" label="Error Helper text" error defaultValue="Default Value" helperText="Some important text" variant="outlined" />
        </Box>
    </>
  );
}
