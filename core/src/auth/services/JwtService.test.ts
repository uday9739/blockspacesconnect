import { AuthFailureReason } from "@blockspaces/shared/types/authentication";
import { JsonWebTokenError, JwtPayload, Secret } from "jsonwebtoken";
import { createMock } from "ts-auto-mock";
import { AppIdService } from "../../app-id";
import { UserTokensResult } from "../../app-id/models";
import { BlockSpacesJwtPayload } from "../types";
import { JwtLibraryWrapper } from "./JwtLibraryWrapper";
import { GetJwtResult, JwtService } from "./JwtService";
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';

describe(JwtService, () => {

  let jwtService: JwtService;
  let mocks: {
    appIdService: AppIdService,
    jwtLibrary: JwtLibraryWrapper,
    connectDbDataContext : ConnectDbDataContext
  };

  beforeEach(() => {

    mocks = {
      appIdService: createMock<AppIdService>(),
      jwtLibrary: createMock<JwtLibraryWrapper>(),
      connectDbDataContext: createMock<ConnectDbDataContext>()
    };

    jwtService = new JwtService(mocks.appIdService, mocks.jwtLibrary, mocks.connectDbDataContext);
  })

  /*********
   * getJwt()
   **********/
  describe(JwtService.prototype.getJwt, () => {

    it('should return a failure if getting tokens from App ID fails', async () => {
      const expectedResult = <GetJwtResult>{
        success: false,
        failureReason: AuthFailureReason.EMAIL_NOT_VERIFIED
      };

      mocks.appIdService.getUserTokens = async () => (<UserTokensResult>{
        success: false,
        failureReason: expectedResult.failureReason
      });

      const result = await jwtService.getJwt("joe@shmo.com", "12323498");
      expect(result).toEqual(expectedResult);
    });

    it('should return error if no access token is provided', async () => {
      const expectedResult = <GetJwtResult>{
        success: false,
        failureReason: AuthFailureReason.INVALID_JWT
      };

      mocks.appIdService.getUserTokens = async () => (<UserTokensResult>{
        success: true
      });

      const result = await jwtService.getJwt("foo@bar.com", "abc123");
      expect(result).toEqual(expectedResult);
    });

    it('should return failure if access token is invalid', async () => {
      const expectedResult = <GetJwtResult>{
        success: false,
        failureReason: AuthFailureReason.INVALID_JWT,
        message: "invalid jwt"
      };

      mocks.appIdService.getUserTokens = async () => (<UserTokensResult>{
        success: true,
        tokens: { access_token: "abc123", expires_in: 3600, token_type: "Bearer" }
      });
      mocks.jwtLibrary.verify = () => {
        throw new JsonWebTokenError(expectedResult.message);
      }

      const result = await jwtService.getJwt("foo@bar.com", "1234565");
      expect(result).toEqual(expectedResult);
    });

    it('should return a successful result if JWT is valid', async () => {
      const expectedPayload = <BlockSpacesJwtPayload>{
        twofastatus: "CONFIRMED",
        accessToken: "mockaccesstoken"
      };
      const expectedJwt = "abc123";

      mocks.appIdService.getUserTokens = async () => (<UserTokensResult>{
        success: true,
        tokens: { access_token: expectedJwt, expires_in: 3600, token_type: "Bearer" }
      });
      mocks.jwtLibrary.verify = jest.fn().mockReturnValue(expectedPayload);

      const result = await jwtService.getJwt("foo@bar.com", "1234565");
      expect(result.success).toBeTruthy();
      expect(result.payload).toBe(expectedPayload);
      expect(result.jwtEncoded).toBe(expectedJwt);
    });



    it('get2FAJwt should return a successful result when there are no errors', async () => {
      const getJwtResponse = await jwtService.get2faJwt("my test id", "testEmailAddress@mail.com")
      expect(getJwtResponse.success).toBeTruthy()
      const verifyJwtResponse = await jwtService.verify2faJwt(getJwtResponse.jwtEncoded)
      expect(verifyJwtResponse.success).toBeTruthy()
    });
    it('verify2FAJwt should return a failure when there is an errors due to invalid signature', async () => {

      mocks.jwtLibrary.verify = jest.fn().mockReturnValue("invalid signature");

      const verifyJwtResponse = await jwtService.verify2faJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJteSB0ZXN0IGlkIiwiY29kZSI6Im15IG9uZSB0aW1lIGNvZGUiLCJpYXQiOjE2NTQ3MTY3NjQsImV4cCI6MCwiaXNzIjoiQmxvY2tTcGFjZXMgQ29ubmVjdCJ9.dJjrAiJP1DtxdicgaSN-85NdBp7p6DV24asTFCOLdp8")
      expect(verifyJwtResponse.success).toBeFalsy()
      expect(verifyJwtResponse.failureReason).toBe("invalid signature")
    });
    it('verify2FAJwt should return a failure when there is an errors due to malformed', async () => {
      mocks.jwtLibrary.verify = jest.fn().mockReturnValue("jwt malformed");
      const verifyJwtResponse = await jwtService.verify2faJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJteSB0ZXN0IGlkIiwiY29kZSI6Im15IG9uZSB0aW1lIGNvZGUiLCJpYXQiOjE2NTQ3MTY3NjQsImV4cCI6MCwiaXNzIjoiQmxvY2tTcGFjZXMgQ29ubmVjdCJ9")
      expect(verifyJwtResponse.success).toBeFalsy()
      expect(verifyJwtResponse.failureReason).toBe("jwt malformed")
    });

  })
})