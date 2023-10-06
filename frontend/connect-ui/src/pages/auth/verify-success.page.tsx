import { useRouter } from "next/router";
import { useEffect } from "react";

export default function VerifySuccessPage() {

  const router = useRouter();
  useEffect(() => {
    router.push('/auth?screen=verify-success')
  },[])
  
  return <></>
}