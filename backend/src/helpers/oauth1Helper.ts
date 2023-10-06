import crypto, { BinaryToTextEncoding } from 'crypto';
import oauth1a, {Authorization, Header} from 'oauth-1.0a';

const DIGESTS:Record<string,{length:number,type:string,digest:BinaryToTextEncoding,minIterations:number}> = {
  "HMAC-SHA256": {
    length: 32,
    type: 'sha256',
    digest: 'base64',
    minIterations: 4096
  },
  "HMAC-SHA1": {
    length: 32,
    type: 'sha1',
    digest: 'base64',
    minIterations: 4096
  },
}

export class Oauth1Helper {
  credentials:any;
  digestion:{length:number,type:string,digest:BinaryToTextEncoding,minIterations:number};

  constructor(credentials:any) {
    this.credentials = credentials;
    this.digestion = DIGESTS[this.credentials.oauth_signature_method];
  }

  getAuthHeaderForRequest(request:any):Header {
    const digestionType = this.digestion.type;
    const digest = this.digestion.digest;
    const oauth = new oauth1a({
      consumer: { key: this.credentials.oauth_consumer_key, secret: this.credentials.consumer_secret },
      signature_method: this.credentials.oauth_signature_method,
      realm: this.credentials.realm,
      nonce_length: 11,
      parameter_seperator: ',',
      hash_function(base_string, key) {
        return crypto
          .createHmac(digestionType, key)
          .update(base_string)
          .digest(digest)
      },
    })

    const authorization:Authorization = oauth.authorize(request, {
      key: this.credentials.oauth_token,
      secret: this.credentials.token_secret,
    });

    return oauth.toHeader(authorization);
  }
}