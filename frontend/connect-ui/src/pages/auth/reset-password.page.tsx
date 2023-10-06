import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ResetPasswordPage() {

  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return
    
    router.push({
      pathname:'/auth',
      query:{ screen:'reset-password', ...router.query }
    })
  },[router.isReady])
  
  return <></>
};