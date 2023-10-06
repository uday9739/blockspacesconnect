import { useRouter } from "next/router"
import { useEffect } from "react"
import LoginForm from "src/features/authentication/LoginForm"
import MainLayoutAuthenticated from "src/platform/layout/MainLayoutAuthenticated"
import MainLayoutPublic from "src/platform/layout/MainLayoutPublic"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { googleLogout } from '@react-oauth/google';


const LogoutPage = () => {
  const router = useRouter()

  useEffect(() => {
    googleLogout();
    router?.push("/admin-portal/login");
  }, [router?.isReady]);


  return <MainLayoutPublic>

  </MainLayoutPublic>
}

export default LogoutPage;
