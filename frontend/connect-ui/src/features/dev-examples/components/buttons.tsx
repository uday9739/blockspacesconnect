import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import SaveIcon from "@mui/icons-material/Save";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";

export default function ButtonExample() {
  return (
    <>
      <h1>Buttons</h1>
      <Typography variant="h6" id="contained-buttons">
        Contained Buttons
      </Typography>
      <div>
        <Button variant="contained">Default</Button>
        <Button variant="contained" color="primary">
          Primary
        </Button>
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="contained" disabled>
          Disabled
        </Button>
      </div>

      <Typography variant="h6" id="text-buttons">
        Text Buttons
      </Typography>
      <div>
        <Button>Default</Button>
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button disabled>Disabled</Button>
      </div>

      <Typography variant="h6" id="outlined-buttons">
        Outlined Buttons
      </Typography>
      <div>
        <Button variant="outlined">Default</Button>
        <Button variant="outlined" color="primary">
          Primary
        </Button>
        <Button variant="outlined" color="secondary">
          Secondary
        </Button>
        <Button variant="outlined" disabled>
          Disabled
        </Button>
      </div>

      <Typography variant="h6" id="buttons-with-icons">
        Buttons with icons and label
      </Typography>

      <Button variant="contained" color="secondary" startIcon={<DeleteIcon />}>
        Delete
      </Button>

      <Button variant="contained" disabled color="secondary" startIcon={<KeyboardVoiceIcon />}>
        Talk
      </Button>
      <Button variant="contained" color="primary" size="medium" startIcon={<SaveIcon />}>
        Save
      </Button>
    </>
  );
}
