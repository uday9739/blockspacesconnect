import { createMock } from 'ts-auto-mock';
import { TwoFactorAuthJwtGuard } from "./TwoFactorAuthJwtGuard"
import { ExecutionContext } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import CookieName from "@blockspaces/shared/models/CookieName";
import { JwtAuthGuard } from './JwtAuthGuard';
import { Reflector } from '@nestjs/core/services/reflector.service';
import { EnvironmentVariables } from '../../env';

describe(JwtAuthGuard, () => {
  let guard: JwtAuthGuard;

  let mocks: {
    reflector: Reflector,
    env: EnvironmentVariables
  }

  beforeEach(async () => {
    mocks = {
      reflector: createMock<Reflector>(),
      env: createMock<EnvironmentVariables>()
    }
    guard = new JwtAuthGuard(mocks.reflector, mocks.env);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

});
