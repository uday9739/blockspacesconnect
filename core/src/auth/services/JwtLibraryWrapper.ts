import * as jwtLibrary from "jsonwebtoken";

/**
 * An injectable wrapper around the functions provided by the `jsonwebtoken` package
 *
 * @see https://www.npmjs.com/package/jsonwebtoken
 */
export class JwtLibraryWrapper {

  /**
   * Sign the given payload into a JSON Web Token string
   * payload - Payload to sign, could be an literal, buffer or string
   * secretOrPrivateKey - Either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
   * [options] - Options for the signature
   */
  sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: jwtLibrary.Secret,
    options?: jwtLibrary.SignOptions
  ): string {
    return jwtLibrary.sign(payload, secretOrPrivateKey, options)
  }


  /**
   * Synchronously verify given token using a secret or a public key to get a decoded token
   * token - JWT string to verify
   * secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
   * [options] - Options for the verification
   * returns - The decoded token.
   */
  verify(token: string, secretOrPublicKey: jwtLibrary.Secret, options: jwtLibrary.VerifyOptions & { complete: true }): jwtLibrary.Jwt;
  verify(token: string, secretOrPublicKey: jwtLibrary.Secret, options?: jwtLibrary.VerifyOptions & { complete?: false }): jwtLibrary.JwtPayload | string;
  verify(token: string, secretOrPublicKey: jwtLibrary.Secret, options?: jwtLibrary.VerifyOptions): jwtLibrary.Jwt | jwtLibrary.JwtPayload | string;
  verify(token: string, secretOrPublicKey: jwtLibrary.Secret, options?: jwtLibrary.VerifyOptions): jwtLibrary.Jwt | jwtLibrary.JwtPayload | string {
    return jwtLibrary.verify(token, secretOrPublicKey, options)
  }

  /**
   * Asynchronously verify given token using a secret or a public key to get a decoded token
   * token - JWT string to verify
   * secretOrPublicKey - A string or buffer containing either the secret for HMAC algorithms,
   * or the PEM encoded public key for RSA and ECDSA. If jwt.verify is called asynchronous,
   * secretOrPublicKey can be a function that should fetch the secret or public key
   * [options] - Options for the verification
   * callback - Callback to get the decoded token on
   */
  verifyAsync(
    token: string,
    secretOrPublicKey: jwtLibrary.Secret | jwtLibrary.GetPublicKeyOrSecret,
    options: jwtLibrary.VerifyOptions & { complete: true },
    callback?: jwtLibrary.VerifyCallback<jwtLibrary.Jwt>,
  ): void;
  verifyAsync(
    token: string,
    secretOrPublicKey: jwtLibrary.Secret | jwtLibrary.GetPublicKeyOrSecret,
    options?: jwtLibrary.VerifyOptions & { complete?: false },
    callback?: jwtLibrary.VerifyCallback<jwtLibrary.JwtPayload | string>,
  ): void;
  verifyAsync(
    token: string,
    secretOrPublicKey: jwtLibrary.Secret | jwtLibrary.GetPublicKeyOrSecret,
    options?: jwtLibrary.VerifyOptions,
    callback?: jwtLibrary.VerifyCallback,
  ): void;
  verifyAsync(
    token: string,
    secretOrPublicKey: jwtLibrary.Secret | jwtLibrary.GetPublicKeyOrSecret,
    options?: jwtLibrary.VerifyOptions,
    callback?: jwtLibrary.VerifyCallback | jwtLibrary.VerifyCallback<jwtLibrary.Jwt>
  ) {
    jwtLibrary.verify(token, secretOrPublicKey, options, callback);
  }

  /**
   * Returns the decoded payload without verifying if the signature is valid.
   * token - JWT string to decode
   * [options] - Options for decoding
   * returns - The decoded Token
   */
  decode(token: string, options: jwtLibrary.DecodeOptions & { complete: true }): null | jwtLibrary.Jwt;
  decode(token: string, options: jwtLibrary.DecodeOptions & { json: true }): null | jwtLibrary.JwtPayload;
  decode(token: string, options?: jwtLibrary.DecodeOptions): null | jwtLibrary.JwtPayload | string;
  decode(token: string, options?: jwtLibrary.DecodeOptions): null | jwtLibrary.JwtPayload | string {
    return jwtLibrary.decode(token, options)
  }
}