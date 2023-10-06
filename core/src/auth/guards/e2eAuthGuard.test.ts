import { E2eAuthGuard } from './e2eAuthGuard';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from 'ts-auto-mock';
import { Request } from "express";

describe('E2eAuthGuard', () => {
  let guard: E2eAuthGuard;
  let context: ExecutionContext;
  let request: Request;

  beforeEach(() => {
    context = createMock<ExecutionContext>();
    request = createMock<Request>({
      user: {
        email: ""
      }
    });

    context.switchToHttp = jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    });

    guard = new E2eAuthGuard();
  });

  it('should return true for an email that begins with "e2e+" and ends with "blockspaces.com"', async () => {
    request.user = {
      email: 'e2e+test@blockspaces.com'
    };
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false for an email that does not "e2e+" and ends with "blockspaces.com"', async () => {
    request.user = {
      email: 'test@example.com'
    };
    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });
});
