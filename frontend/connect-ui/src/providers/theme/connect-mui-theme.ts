import {
  useTheme,
  createTheme,
  Theme,
  ThemeProvider,
  ThemeOptions,
} from "@mui/material/styles";
export {
  ThemeProvider as ConnectMUIThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
export { CssBaseline }
//#region Theme Wizardry
interface CustomTheme {
  bscBlue: string;
  bscHighlight: string;
  lightBlue: string;
  lighterBlue: string;
  faintBlue: string;
  white: string;
  black: string;
  mediumBoxShadow: string;
  slightBoxShadow: string;
  highlightMediumBoxShadow: string;
  name: string;
  appBG: string;
  appBorder: string;
  sidebarBG: string;
  sidebarBorder: string;
  sidebarDivider: string;
  sidebarFont: string;
  contentBG: string;
  primaryBG: string;
  secondaryBG: string;
  componentBG: string;
  secondaryComponentBG: string;
  headerBG: string;
  canvasBG: string;
  faintBorder: string;
  lightBorder: string;
  mediumBorder: string;
  heavyBorder: string;
  componentBorder: string;
  canvasBorder: string;
  canvasBorderLight: string;
  highlightBG: string;
  highlightBGHover: string;
  highlightBorder: string;
  primaryColor: string;
  arrowColor: string;
  mappedBG: string;
  mappedColor: string;
  fontColor: string;
  inverseFontColor: string;
  iconFill: string;
  iconStroke: string;
  GET: string;
  POST: string;
  PUT: string;
  PATCH: string;
  DELETE: string;
}

declare module "@mui/material/styles" {
  export interface Theme extends CustomTheme { }
  export interface ThemeOptions extends CustomTheme { }
}

declare module "styled-components" {
  export interface DefaultTheme extends Theme { }
}

//https://mui.com/material-ui/customization/default-theme/
const customTheme = createTheme({
  spacing: 7,
  palette: {
    primary: {
      main: "#696FE2",
    },
    secondary: {
      main: "#FFB800",
    },
  },
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          border: 'none'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        margin: "dense"
      },
      styleOverrides: {
        root: {
          border: 'none',
        }
      }
    },
    MuiAppBar: {
      defaultProps: {
        color: "transparent"
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          margin: "5px",
          borderRadius: "2.5rem",
          textTransform: "initial"
        },
        outlinedPrimary: {
          '&:hover': {
            backgroundColor: "#F1F3FF"
          },
          '&:active': {
            backgroundColor: "#696FE2",
            color: "white"
          }
        },
        outlinedSecondary: {
          '&:active': {
            backgroundColor: "#FFB800",
            color: "white"
          }
        }
      },

    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiAccordion: {
      styleOverrides: {

      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          marginLeft: "20px",
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        "root": {
          "borderRadius": '50px',
          "border": "1px solid #E7EBFF",
          "& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input": {
            "margin-left": "20px"
          }
        },
      } as any
    },
    MuiAutocomplete: {
      styleOverrides: {
        "root": {
          "& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input": {
            "margin-left": "20px"
          },
          "& .MuiFormLabel-root": {
            "margin-left": "10px",
            "padding-left": "10px",
            "color": "#abb2f2",
            "background-color": "white"
          },
          "& .MuiInputBase-input": {
            "margin-left": "10px",
          },
          "& .MuiInputBase-root": { borderRadius: '50px !important', border: '1px solid #5665E5AA !important' },
          "& .MuiInputBase-root:hover": { borderRadius: '50px !important', border: '1px solid #5665E5AA !important' },
          "& .MuiInputBase-root:before": { "border-bottom": "none" },
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiInputBase-root:after": { "border-bottom": "none" },
          "& .MuiInputBase-root-MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before": { "border-bottom": "none!important" }
        },
      } as any
    }

  },
  mixins: {
    toolbar: {
      minHeight: 25,
    },
  },
  bscBlue: "#696FE2",
  bscHighlight: `#FFB800`,
  lightBlue: "#E7EBFF",
  lighterBlue: "#F1F3FF",
  faintBlue: "#FAFBFF",
  white: "#FFFFFF",
  black: "#000000",
  mediumBoxShadow: `0px .1875rem .75rem rgba(105, 111, 226, 0.3)`,
  slightBoxShadow: `0px 1px 4px rgba(105, 111, 226, 0.18)`,
  highlightMediumBoxShadow: `0px .1875rem .75rem rgb(255, 184, 0, 0.3)`,
  name: 'light',
  appBG: '#202246',
  appBorder: '#f1fcff',
  sidebarBG: '#343859',
  sidebarBorder: '#25163D',  // #323656 Changed for Lightning Demo
  sidebarDivider: '#1E0F37', // #2e3253 Changed for Lightning Demo
  sidebarFont: '#FFFFFF',
  contentBG: '#25163D',  // #2f3152 Changed for Lightning Demo
  primaryBG: '#FFFFFF',
  secondaryBG: '#fafbfb',
  componentBG: '#FFFFFF',
  secondaryComponentBG: '#fcfeff',
  headerBG: '#f9f9fd',
  canvasBG: '#f9f9fd',
  faintBorder: '#f9f9fa',
  lightBorder: '#ecf2f5',
  mediumBorder: '#c4d1d7',
  heavyBorder: '#aebdc6',
  componentBorder: '#608499',
  canvasBorder: '#eeeef3',
  canvasBorderLight: '#f5f5f9',
  highlightBG: '#f5feff',
  highlightBGHover: '#237c87',
  highlightBorder: '#41d1ff',
  primaryColor: '#285573',
  arrowColor: '#285573',
  mappedBG: '#285573',
  mappedColor: '#FFF',
  fontColor: '#323656',
  inverseFontColor: '#FFF',
  iconFill: '#5864E6',
  iconStroke: '#285573',
  GET: '#285573',
  POST: '#fab401',
  PUT: '#fab401',
  PATCH: '#fab401',
  DELETE: '#FF5D67'
});
//#endregion
export namespace ConnectMUITheme {
  export const createConnectTheme = (mode: string) => createTheme({
    ...customTheme,
    palette: {
      ...customTheme.palette,
      mode,
    },
  } as ThemeOptions);
}