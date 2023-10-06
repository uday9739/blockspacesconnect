import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { isUserAuthenticated, useGetCurrentUser } from "@src/platform/hooks/user/queries";

/**
 * A higher order component (HoC) that requires the user to be logged in
 * before the wrapped component will be rendered.
 *
 * If the user is not logged in, they'll be automatically redirected to the login page
 */
export default function requireAuthenticationObservable<T>(WrappedComponent: React.FunctionComponent<React.PropsWithChildren<T>>) {
  return (props: T) => {
    const isLoggedIn = isUserAuthenticated();
    const { data: user } = useGetCurrentUser();
    const router = useRouter();

    useEffect(() => {
      if (!isLoggedIn) {
        router.push("/auth");
        return;
      }
    }, [user, router.pathname]);

    return isLoggedIn ? <WrappedComponent {...props} /> : <></>;
  };
}
