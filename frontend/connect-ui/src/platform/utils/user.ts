export const TOKEN_EXPIRY_KEY = "__token_expiry__";


export const extractExpiryDateFromJwy = (jwt: string) => {
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };
  const decodedJwt = parseJwt(jwt);
  return decodedJwt?.exp * 1000 || 0;
}