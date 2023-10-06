import Box from "@mui/material/Box";
import { PropsWithChildren } from "react";
import ColorModeToggle from "../components/ColorModeToggle";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MainLayoutPublicProps {

}

export default function MainLayoutPublic({ children }: PropsWithChildren<MainLayoutPublicProps>) {
    return <Box>
        <Box sx={{
            padding: "5px",
            display: "flex",
            justifyContent: "end"
        }}>
            <ColorModeToggle />
        </Box>
        {children}
    </Box>
}