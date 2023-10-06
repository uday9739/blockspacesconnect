import { CircularProgress, Button as MuiButton, useTheme } from "@mui/material";

type ButtonProps = {
    type: 'button' | 'submit',
    isSubmitting?: boolean;
    disabled?: boolean;
    primaryBtnText?: string;
    isSubmittingText?: string;
};

const PrimaryButton = ({ type, disabled, isSubmitting, primaryBtnText, isSubmittingText }: ButtonProps) => {
    return <>
        <MuiButton
            disabled={disabled}
            type={type}
            color={'primary'}
            fullWidth={true}
            variant="contained">
            {isSubmitting ? (
                <>
                    <CircularProgress variant="indeterminate" size="1.3rem" color="secondary" /> &nbsp; {isSubmittingText}
                </>
            ) : (
                <>{primaryBtnText}</>
            )}</MuiButton>
    </>
}

export default PrimaryButton;