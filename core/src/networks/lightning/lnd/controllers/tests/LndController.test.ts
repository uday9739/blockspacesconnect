import { BitcoinTransactionDto, ChannelsDto, GenerateBolt11Dto, IncomingPaymentDto, OutgoingPaymentDto } from "@blockspaces/shared/dtos/lightning";
import { IUser } from "@blockspaces/shared/models/users";
import { ChannelBalanceResponse, GetInfoResponse, ListChannelsResponse, ListInvoiceResponse, ListPaymentsResponse, ListPeersResponse, Transaction, AddInvoiceResponse, PayReq } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { HttpException, HttpStatus } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { LndService } from "../../services/LndService";
import { LndController } from "../LndController";

describe(LndController.name, () => {
  let lndController: LndController;
  let mockServices: {
    lightning: LndService;
  };
  beforeAll(async () => {
    mockServices = {
      lightning: createMock<LndService>()
    };

    lndController = new LndController(mockServices.lightning);
  });

  describe(`getNodeInfo`, () => {
    it(`should get info about a users lightning node`, async () => {
      mockServices.lightning.getInfo = jest.fn().mockResolvedValue(createMock<GetInfoResponse.AsObject>());
      const result = await lndController.getNodeInfo(createMock<IUser>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no lightning node is found.`, async () => {
      mockServices.lightning.getInfo = jest.fn().mockResolvedValue(null);
      try {
        await lndController.getNodeInfo(createMock<IUser>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`readBitcoinTransactions`, () => {
    it(`should get a list of on-chain bitcoin transactions from a user's lightning node.`, async () => {
      mockServices.lightning.getBitcoinTransactions = jest.fn().mockResolvedValue(createMock<Transaction.AsObject[]>());
      const result = await lndController.readBitcoinTransactions(createMock<IUser>(), createMock<BitcoinTransactionDto>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no on-chain bitcoin transactions are not found.`, async () => {
      mockServices.lightning.getBitcoinTransactions = jest.fn().mockResolvedValue(null);
      try {
        await lndController.readBitcoinTransactions(createMock<IUser>(), createMock<BitcoinTransactionDto>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`readNodeBalance`, () => {
    it(`should get balance of a lightning node associated with a tenantId.`, async () => {
      mockServices.lightning.getNodeBalance = jest.fn().mockResolvedValue(createMock<ChannelBalanceResponse.AsObject>());
      const result = await lndController.readNodeBalance(`some-tenant-id`);
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no lightning node balance is not found.`, async () => {
      mockServices.lightning.getNodeBalance = jest.fn().mockResolvedValue(null);
      try {
        await lndController.readNodeBalance(`some-tenant-id`);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`getIncomingPayments`, () => {
    it(`should get a list of incoming payments from a users lightning node.`, async () => {
      mockServices.lightning.getIncomingPayments = jest.fn().mockResolvedValue(createMock<ListInvoiceResponse.AsObject>());
      const result = await lndController.getIncomingPayments(createMock<IUser>(), createMock<IncomingPaymentDto>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no incoming payments for the users lightning node are not found.`, async () => {
      mockServices.lightning.getIncomingPayments = jest.fn().mockResolvedValue(null);
      try {
        await lndController.getIncomingPayments(createMock<IUser>(), createMock<IncomingPaymentDto>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`getOutgoingPayments`, () => {
    it(`should get a list of outgoing payments from a users lightning node.`, async () => {
      mockServices.lightning.getOutgoingPayments = jest.fn().mockResolvedValue(createMock<ListPaymentsResponse.AsObject[]>());
      const result = await lndController.getOutgoingPayments(createMock<IUser>(), createMock<OutgoingPaymentDto>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no outgoing payments for the users lightning node are not found.`, async () => {
      mockServices.lightning.getOutgoingPayments = jest.fn().mockResolvedValue(null);
      try {
        await lndController.getOutgoingPayments(createMock<IUser>(), createMock<OutgoingPaymentDto>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`getClosedChannelsList`, () => {
    it(`should get a list of closed channels associated with a users lightning node.`, async () => {
      mockServices.lightning.getClosedChannels = jest.fn().mockResolvedValue(createMock<ListPaymentsResponse.AsObject[]>());
      const result = await lndController.getClosedChannelsList(createMock<IUser>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no closed channels associated with a users lightning node are not found.`, async () => {
      mockServices.lightning.getClosedChannels = jest.fn().mockResolvedValue(null);
      try {
        await lndController.getClosedChannelsList(createMock<IUser>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`getChannelsList`, () => {
    it(`should get a list of open channels associated with a users lightning node.`, async () => {
      mockServices.lightning.getChannelsList = jest.fn().mockResolvedValue(createMock<ListChannelsResponse.AsObject>());
      const result = await lndController.getChannelsList(createMock<IUser>(), createMock<ChannelsDto>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no open channels associated with a users lightning node are not found.`, async () => {
      mockServices.lightning.getChannelsList = jest.fn().mockResolvedValue(null);
      try {
        await lndController.getChannelsList(createMock<IUser>(), createMock<ChannelsDto>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`listPeers`, () => {
    it(`should get a list of peers associated with a users lightning node.`, async () => {
      mockServices.lightning.listPeers = jest.fn().mockResolvedValue(createMock<ListPeersResponse.AsObject>());
      const result = await lndController.listPeers(createMock<IUser>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no peers are associated with a users lightning node are not found.`, async () => {
      mockServices.lightning.listPeers = jest.fn().mockResolvedValue(null);
      try {
        await lndController.listPeers(createMock<IUser>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`getChannelUtxos`, () => {
    it(`should get a list of channel utxos associated with channel opens for a node.`, async () => {
      mockServices.lightning.getChannelEventUtxos = jest.fn().mockResolvedValue(createMock<Transaction.AsObject[]>());
      const result = await lndController.getChannelUtxos(createMock<IUser>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no channel utxos are associated with channel opens for a node.`, async () => {
      mockServices.lightning.getChannelEventUtxos = jest.fn().mockResolvedValue(null);
      try {
        await lndController.getChannelUtxos(createMock<IUser>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`getUtxos`, () => {
    it(`should get a list of utxos associated with channel opens for a node.`, async () => {
      mockServices.lightning.getUtxos = jest.fn().mockResolvedValue(createMock<Transaction.AsObject[]>());
      const result = await lndController.getUtxos(createMock<IUser>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when no utxos are associated with channel opens for a node.`, async () => {
      mockServices.lightning.getUtxos = jest.fn().mockResolvedValue(null);
      try {
        await lndController.getUtxos(createMock<IUser>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`generateBolt11`, () => {
    it(`should decode a BOLT 11 payreq with a users lightning node.`, async () => {
      mockServices.lightning.generateBolt11 = jest.fn().mockResolvedValue(createMock<AddInvoiceResponse.AsObject>());
      const result = await lndController.generateBolt11(createMock<IUser>(), createMock<GenerateBolt11Dto>());
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when decoding a BOLT 11 payreq with a users lightning node Fails.`, async () => {
      mockServices.lightning.generateBolt11 = jest.fn().mockResolvedValue(null);
      try {
        await lndController.generateBolt11(createMock<IUser>(), createMock<GenerateBolt11Dto>());
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`readInvoice`, () => {
    it(`should return an invoice from a users lightning node.`, async () => {
      mockServices.lightning.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
      const result = await lndController.readInvoice(createMock<IUser>(), `some-payReq`, `some-tenant-id`);
      expect(result.data).toBeDefined();
    }, 10000);
    it(`should return HttpException when reading an invoice from a users lightning node Fails.`, async () => {
      mockServices.lightning.readInvoice = jest.fn().mockResolvedValue(null);
      try {
        await lndController.readInvoice(createMock<IUser>(), `some-payReq`, `some-tenant-id`);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });
});
