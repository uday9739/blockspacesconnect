import { createMock } from 'ts-auto-mock';
import { Address } from '../../models/Address';
import { CountryCode } from "../../models/Countries";
import { StateAbbreviation } from "../../models/States";
import { IUser } from '../../models/users';
import { UserProfileDto } from "./UserProfileDto";

describe(UserProfileDto, () => {

  let dto: UserProfileDto;

  beforeEach(() => {
    dto = new UserProfileDto();
    dto.address1 = "123 Main St.";
    dto.address2 = "Apt B";
    dto.city = "Somewhere";
    dto.companyName = "Acme, Inc.";
    dto.country = CountryCode.UnitedStates;
    dto.email = "joe@shmo.com";
    dto.firstName = "Joe";
    dto.lastName = "Shmo";
    dto.phone = "1234567890";
    dto.state = StateAbbreviation.Alabama;
    dto.zipCode = "12345";
  });

  describe(UserProfileDto.prototype.mergeWithUser, () => {

    it('should update contact info', () => {
      const user = createMock<IUser>({
        firstName: "efoij45ij4ihj",
        lastName: "dfjsdfjh4jh34jh",
        companyName: "ejfh4ih32iu4hdjfh",
        phone: "0923347812"
      });

      dto.mergeWithUser(user);

      expect(user.firstName).toBe(dto.firstName);
      expect(user.lastName).toBe(dto.lastName);
      expect(user.companyName).toBe(dto.companyName);
      expect(user.phone).toBe(dto.phone);
    });

    it('should override address when user has no address', () => {
      const user = createMock<IUser>({ address: null });
      const expectedAddress: Address = {
        address1: dto.address1,
        address2: dto.address2,
        city: dto.city,
        country: dto.country,
        state: dto.state,
        zipCode: dto.zipCode
      };

      dto.mergeWithUser(user);

      expect(user.address).toEqual(expectedAddress);
    });

    it('should update existing user address', () => {
      const user = createMock<IUser>({
        address: {
          address1: "321 Secondary Dr.",
          address2: "Bldg Q",
          city: "Nowheresville",
          state: StateAbbreviation.Iowa,
          country: CountryCode.UnitedStates,
          zipCode: "54321"
        }
      });

      const expectedAddress: Address = {
        address1: dto.address1,
        address2: dto.address2,
        city: dto.city,
        country: dto.country,
        state: dto.state,
        zipCode: dto.zipCode
      };

      dto.mergeWithUser(user);

      expect(user.address).toEqual(expectedAddress);
    });
  });
});