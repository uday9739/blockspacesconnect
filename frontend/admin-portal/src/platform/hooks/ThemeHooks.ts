import { useContext } from "react"
import { ThemeColorModeContext } from "../providers/AppThemeProvider"

export const useToggleColorMode = () => {
    const { toggleColorMode } = useContext(ThemeColorModeContext)
    return { toggleColorMode }
}
