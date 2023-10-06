import CssBaseline from "@mui/material/CssBaseline";
import {
    useTheme,
    createTheme,
    Theme,
    ThemeProvider,
    ThemeOptions,
} from "@mui/material/styles";
import React, { PropsWithChildren } from "react";

const defaultMode = "dark";
const myPallet = {
    errorRed: '#e74c3c'
}

const ThemeColorModeContext = React.createContext({

    toggleColorMode: () => { },
    mode: defaultMode
});

function AppThemeProvider(props: PropsWithChildren) {
    const [mode, setMode] = React.useState<'light' | 'dark'>(defaultMode);
    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode
                },
                spacing: 8,
                components: {
                    MuiButtonBase: {
                        defaultProps: {
                            disableRipple: true,
                        },
                        styleOverrides: {
                            root: {
                                marginTop: "10px",
                                marginBottom: "10px"
                            }
                        },
                    },
                    MuiAlert: {
                        styleOverrides: {
                            icon: {
                                color: mode === 'dark' ? 'white !important' : '',
                                backgroundColor: mode === 'dark' ? myPallet.errorRed : '',
                            },
                            root: {
                                color: mode === 'dark' ? 'white' : '',
                                backgroundColor: mode === 'dark' ? myPallet.errorRed : '',
                            }
                        }
                    },
                    MuiTooltip: {
                        defaultProps: {
                            arrow: true
                        }
                    },
                },
            }),
        [mode],
    );
    return (<ThemeColorModeContext.Provider value={{ mode: mode, toggleColorMode: toggleColorMode }}>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    </ThemeColorModeContext.Provider>)
}
export { ThemeColorModeContext, AppThemeProvider }