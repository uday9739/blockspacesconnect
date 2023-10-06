import { useToggleColorMode } from "../hooks/ThemeHooks";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from "@mui/material/styles";

export default function ColorModeToggle() {
    const theme = useTheme();
    const { toggleColorMode } = useToggleColorMode();

    return (
        <Box>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Box>
    )
}