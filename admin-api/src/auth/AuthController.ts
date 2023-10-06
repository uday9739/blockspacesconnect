import { Body, Controller, Get, Post, Req, Res, Request } from '@nestjs/common';

import { CookieOptions, Request as ExpressRequest, Response } from "express";
import { DataContext } from 'src/datacontext/services/DataContext';
import { AuthService } from './AuthService';
import { AllowAnonymous } from './decorators/AllowAnonymous.decorator';

@Controller('auth')
export class AuthController {
  constructor(private dataContext: DataContext, private readonly appService: AuthService) { }

  @Get('current')
  async CurrentUser(@Request() req) {
    const dbUser = await this.dataContext.users.findOne({ email: req.user.email });
    return {
      id: dbUser._id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName
    };
  }

  @AllowAnonymous()
  @Post('/login')
  async login(@Res({ passthrough: true }) response: Response, @Req() request: ExpressRequest, @Body('token') token): Promise<any> {
    const jwt = await this.appService.signIn(token);

    response.cookie('access_token', jwt, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
      // ...getCookieOptions(request.originalUrl), signed: true, /*expires: ?? */
    });

    return {
      token: jwt
    }
  }

}
export function getCookieOptions(requestUrl: string): CookieOptions {
  return {
    path: requestUrl.match(/\/[^\/]*/)[0],
    httpOnly: true,
    secure: true,
    sameSite: false,
  };
}
