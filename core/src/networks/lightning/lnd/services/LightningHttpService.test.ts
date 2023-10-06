import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { HttpService } from "@blockspaces/shared/services/http";
import { createMock, createMockList } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { LightningHttpService } from "./LightningHttpService";


describe(LightningHttpService, () => { 
  let lightningHttpService: LightningHttpService;

  let mocks: {
    http: HttpService;
  };

  beforeEach(() => {
    mocks = {
      http: createMock<HttpService>()
    };
    lightningHttpService = new LightningHttpService(mocks.http);

  });

  it("should be defined", () => {
    expect(lightningHttpService).toBeDefined();
  });

  describe(LightningHttpService.prototype.get, () => {
    it("should implement get", () => {
      expect(lightningHttpService.get).toBeDefined();
    });
    it("should make call if mac is present", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockResolvedValue(response);
      const result = lightningHttpService.get('', '', 'mac');
      expect(result).resolves.toMatchObject(response);
    });
    it("should make call if mac is not present", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockResolvedValue(response);
      const result = lightningHttpService.get('', '');
      expect(result).resolves.toMatchObject(response);
    });
    it("should return response if request fails", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockRejectedValue({response: response});
      const result = lightningHttpService.get('', '');
      expect(result).resolves.toMatchObject(response);
    });
  });
  describe(LightningHttpService.prototype.post, () => {
    it("should implement post", () => {
      expect(lightningHttpService.post).toBeDefined();
    });
    it("should make call if mac is present", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockResolvedValue(response);
      const result = lightningHttpService.post('', '', 'mac');
      expect(result).resolves.toMatchObject(response);
    });
    it("should make call if mac is not present", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockResolvedValue(response);
      const result = lightningHttpService.post('', '');
      expect(result).resolves.toMatchObject(response);
    });
    it("should return response if request fails", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockRejectedValue({response: response});
      const result = lightningHttpService.post('', '');
      expect(result).resolves.toMatchObject(response);
    });
  });
  describe(LightningHttpService.prototype.delete, () => {
    it("should implement delete", () => {
      expect(lightningHttpService.delete).toBeDefined();
    });
    it("should make call if mac is present", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockResolvedValue(response);
      const result = lightningHttpService.delete('', '', 'mac');
      expect(result).resolves.toMatchObject(response);
    });
    it("should make call if mac is not present", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockResolvedValue(response);
      const result = lightningHttpService.delete('', '');
      expect(result).resolves.toMatchObject(response);
    });
    it("should return response if request fails", () => {
      const response = {result: "result"};
      mocks.http.request = jest.fn().mockRejectedValue({response: response});
      const result = lightningHttpService.delete('', '');
      expect(result).resolves.toMatchObject(response);
    });
  });
});