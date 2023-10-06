import { Avatar, Box, Container, Typography } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import config from "config";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAuthenticateWithGoogleCreds } from "src/platform/hooks/UserHooks";
import { useRouter } from "next/router";
import { useEffect } from "react";


export type LoginFormProps = {
  onSuccess: () => void,
  onError?: () => void
}

const LoginForm = ({ onSuccess, onError }: LoginFormProps) => {
  const { mutate: login, isError, isLoading, data, isSuccess } = useAuthenticateWithGoogleCreds();


  useEffect(() => {
    if (isLoading) return;
    if (isSuccess) {
      if (onSuccess) onSuccess();

    } else if (isError) {
      if (onError) onError();
    }
  }, [isLoading, isSuccess, isError]);


  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Box sx={{
          mt: 2,
          display: "flex",
          justifyContent: "center"
        }}>
          <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID?.toString() || ""}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                login({ token: credentialResponse?.credential?.toString() });
              }}
              onError={() => {
                if (onError) onError();
              }}
            />
          </GoogleOAuthProvider>
        </Box>
      </Box>
    </Container>

  );
}

export default LoginForm;