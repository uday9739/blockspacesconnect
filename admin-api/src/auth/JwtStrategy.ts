import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { EnvironmentVariables, ENV_TOKEN } from '../env';
import { Request } from 'express';


export type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables) {
    const extractJwtFromCookie = (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      ignoreExpiration: false,
      secretOrKey: env.sso.GOOGLE_CLIENT_SECRET,
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie
      ]),
    });
  }

  async validate(payload: JwtPayload) {


    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}