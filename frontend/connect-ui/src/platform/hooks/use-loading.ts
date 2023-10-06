import { useState } from "react";
type Fn<T, A> = (...args: any[]) => Promise<A>;
/**
 * It sets a loading state to true while the fetch function is running and false when it's done
 * @param action - takes a fetch function and returns it as the first value in the tupple
 * @returns A function that can be used to fetch data as the original one would
 */
export const useLoading: <T extends any, A extends any>(action: Fn<T, A>) => [Fn<T, A>, boolean] = (action) => {
  const [loading, setLoading] = useState(false);

  const doAction: <B>(...args: any[]) => Promise<B> = (...args: any[]) => {
    setLoading(true);
    // eslint-disable-next-line prefer-spread
    return action.apply(null,args).finally((): void => setLoading(false));
  };

  return [doAction, loading];
};