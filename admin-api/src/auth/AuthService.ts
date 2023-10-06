import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { DataContext } from 'src/datacontext/services/DataContext';

import { EnvironmentVariables, ENV_TOKEN } from 'src/env';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private dataContext: DataContext,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables
  ) { }

  generateJwt(payload) {
    return this.jwtService.sign(payload, { secret: this.env.sso.GOOGLE_CLIENT_SECRET });
  }

  async signIn(token) {
    const client = new OAuth2Client(
      this.env.sso.GOOGLE_CLIENT_ID,
      this.env.sso.GOOGLE_CLIENT_SECRET,
    );


    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: this.env.sso.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();


    // create user if not already created in db
    const dbUser = await this.dataContext.users.findOne({ email: payload.email });
    if (!dbUser) {
      await this.dataContext.users.create({ email: payload.email, firstName: payload.given_name, lastName: payload.family_name });
    }


    return this.generateJwt({
      sub: payload.sub,
      email: payload.email
    });
  }

}