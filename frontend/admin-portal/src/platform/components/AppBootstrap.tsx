import { PropsWithChildren, Suspense, useEffect } from "react";



const AppBootstrap = ({ children }: PropsWithChildren) => {

    return (
        <>
            <Suspense fallback="loading">
                {children}
            </Suspense>
        </>
    );
}

export default AppBootstrap;