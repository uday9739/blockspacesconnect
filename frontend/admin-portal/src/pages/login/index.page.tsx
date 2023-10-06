import { useRouter } from "next/router";
import LoginForm from "src/features/authentication/LoginForm"
import MainLayoutPublic from "src/platform/layout/MainLayoutPublic"

const LoginPage = () => {
  const router = useRouter();

  const onSuccess = () => {
    router.push("/");
  }
  const onError = () => {
    //onError
  }
  return <MainLayoutPublic>
    <LoginForm onSuccess={onSuccess} onError={onError} />
  </MainLayoutPublic>
}

export default LoginPage;
