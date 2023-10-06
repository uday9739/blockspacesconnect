import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

type LoadingProps = {
    isLoading?: boolean
}
export default function Loading({ isLoading = true }: LoadingProps) {
    if (isLoading === false) return <></>
    return (
        <Box sx={{ width: '100%' }}>
            <LinearProgress />
        </Box>
    );
}