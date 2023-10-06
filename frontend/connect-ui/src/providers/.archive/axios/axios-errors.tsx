import React, { useEffect } from "react";
import axios from "axios";
import { useErrorHandler } from "react-error-boundary";

export const withAxiosErrorHandling = (WC) =>
{
  const WithAxiosErrorHandling = (props) =>
  {
    const handleError = useErrorHandler()
    useEffect(() =>
    {
      axios.interceptors.response.use(
        handleError,
        handleError
      );
      axios.interceptors.request.use(
        handleError,
        handleError
      );
    }, [])

    return (<WC {...props} />)
  }

  return WithAxiosErrorHandling
}