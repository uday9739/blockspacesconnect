import { createMock, createMockList } from "ts-auto-mock";
import { EnvironmentVariables } from "../../../../env";
import { LightningHttpService } from "./LightningHttpService";
import { LndService } from "./LndService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { BitcoinTransactionDto, CancelInvoiceDto, ChannelsDto, GenerateBolt11Dto, IncomingPaymentDto, TrackInvoiceDto } from "@blockspaces/shared/dtos/lightning";
import { Invoice, Transaction } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { Logger } from "log4js";
import { NotFoundException } from "@nestjs/common";
import { ConnectLogger } from "../../../../logging/ConnectLogger";

describe(LndService, () => {
  let lndService: LndService;

  let mocks: {
    db: ConnectDbDataContext;
    env: EnvironmentVariables;
    http: LightningHttpService;
    logger: ConnectLogger;
  };

  beforeEach(() => {
    mocks = {
      http: createMock<LightningHttpService>(),
      db: createMock<ConnectDbDataContext>(),
      env: createMock<EnvironmentVariables>(),
      logger: createMock<ConnectLogger>({
        // info: jest.fn(),
        // debug: jest.fn(),
        // error: jest.fn(),
        // trace: jest.fn(),
        // log: jest.fn()
      })
    };

    lndService = new LndService(mocks.db, mocks.env, mocks.http, mocks.logger);
    lndService["grpc"] = false;
  });

  /**
   * cancelInvoice()
   */
  describe(`LndService.getInfo`, () => {
    it("should return throw error when node is not found", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const response = lndService.getInfo("some-tenant-id");
      expect(response).resolves.toBeNull();
    });
    it("should throw error when get call fails", () => {
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      const response = lndService.getInfo("some-tenant-id");
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: "data" };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getInfo("");
      expect(response).resolves.toBe("data");
    });
    it("should return when mac is not present", () => {
      const res = { status: 200, data: "data" };
      const mockNode = createMock<LightningNodeReference>();
      mockNode.bscMacaroon = "mac";
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockNode);
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getInfo("");
      expect(response).resolves.toBe("data");
    });
    it("should return when data.code is 2", () => {
      const res = { status: 200, data: { code: 2 } };
      const mockNode = createMock<LightningNodeReference>();
      mockNode.bscMacaroon = "mac";
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockNode);
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getInfo("");
      expect(response).resolves.toMatchObject(res.data);
    });
  });

  // /**
  //  * getBitcoinTransactions()
  //  */
  describe(`LndService.getBitcoinTransactions`, () => {
    it("should return throw error status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const dto = createMock<BitcoinTransactionDto>();
      const response = lndService.getBitcoinTransactions(dto, "");
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: { transactions: "data" } };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const dto = createMock<BitcoinTransactionDto>();
      const response = lndService.getBitcoinTransactions(dto, "");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getNodeBalance()
   */
  describe(`LndService.getNodeBalance`, () => {
    it("should return null status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      // mocks.http.get = jest.fn().mockResolvedValue({status: 400, data: ''});
      const response = lndService.getNodeBalance("");
      expect(response).resolves.toBeNull();
    });
    it("should return null status is error", () => {
      // mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      const response = lndService.getNodeBalance("");
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: "data" };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getNodeBalance("");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getOnchainBalance()
   */
  describe(`LndService.getOnchainBalance`, () => {
    it("should return null status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      // mocks.http.get = jest.fn().mockResolvedValue({status: 400, data: ''});
      const response = lndService.getOnchainBalance("");
      expect(response).resolves.toBeNull();
    });
    it("should return null status is error", () => {
      // mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      const response = lndService.getOnchainBalance("");
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: "data" };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getOnchainBalance("");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getIncomingPayments()
   */
  describe(`LndService.getIncomingPayments`, () => {
    let dto;
    beforeEach(() => {
      dto = createMock<IncomingPaymentDto>();
    });
    it("should return throw error status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const response = lndService.getIncomingPayments(dto, "");
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: "data" };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getIncomingPayments(dto, "");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getOutgoingPayments()
   */
  describe(`LndService.getOutgoingPayments`, () => {
    let dto;
    beforeEach(() => {
      dto = createMock<IncomingPaymentDto>();
    });
    it("should return throw error status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const response = lndService.getOutgoingPayments(dto, "");
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: { payments: "data" } };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getOutgoingPayments(dto, "");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getChannelsList()
   */
  describe(`LndService.getChannelsList`, () => {
    let dto;
    beforeEach(() => {
      dto = createMock<ChannelsDto>();
    });
    it("should return throw error status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const response = lndService.getChannelsList("", dto);
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: "data" };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getChannelsList("", dto);
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * listPeers()
   */
  describe(`LndService.listPeers`, () => {
    it("should return throw error status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const response = lndService.listPeers("");
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: "data" };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.listPeers("");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getClosedChannels()
   */
  describe(`LndService.getClosedChannels`, () => {
    it("should return throw error status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const response = lndService.getClosedChannels("");
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: { channels: "data" } };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getClosedChannels("");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getUtxos()
   */
  describe(`LndService.getUtxos`, () => {
    it("should return throw error status is error", () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const response = lndService.getUtxos("");
      mocks.http.get = jest.fn().mockResolvedValue({ status: 400, data: "" });
      expect(response).resolves.toBeNull();
    });
    it("should return when http call succeeds", () => {
      const res = { status: 200, data: { transactions: "data" } };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getUtxos("");
      expect(response).resolves.toBe("data");
    });
  });

  /**
   * getChannelEventUtxos()
   */
  describe(`LndService.getChannelEventUtxos`, () => {
    beforeEach(() => {
      const arr = createMockList<Transaction.AsObject>(1);
      lndService.getUtxos = jest.fn().mockResolvedValue(arr);
    });
    it("should return when utxos is present", () => {
      const res = { status: 200, data: { transactions: "data" } };
      mocks.http.get = jest.fn().mockResolvedValue(res);
      const response = lndService.getChannelEventUtxos("");
      expect(response).resolves.toMatchObject([]);
    });
  });

  /**
   * generateBolt11()
   */
  describe(`LndService.generateBolt11`, () => {
    it("should throw an error if amount is zero", () => {
      const result = { status: 400, data: "gabagool" };
      mocks.http.post = jest.fn().mockResolvedValue(result);
      const dto: GenerateBolt11Dto = createMock<GenerateBolt11Dto>();
      const response = lndService.generateBolt11(dto);
      expect(response).resolves.toBeNull();
    });
    it("should throw an error if lnd call fails", () => {
      const result = { status: 400, data: "gabagool" };
      mocks.http.post = jest.fn().mockResolvedValue(result);
      const dto: GenerateBolt11Dto = { tenantId: "", memo: "", amount: 1, expiry: 0 };
      const response = lndService.generateBolt11(dto);
      expect(response).resolves.toBeNull();
    });
    it("should return bolt 11 data", () => {
      const lndResult = {
        status: 200,
        data: {
          add_index: 0,
          r_hash: "asdf",
          payment_request: "pay_req",
          payment_addr: "pay_addr"
        }
      };
      mocks.http.post = jest.fn().mockResolvedValue(lndResult);
      const dto: GenerateBolt11Dto = { tenantId: "", memo: "", amount: 1, expiry: 0 };
      const result = {
        addIndex: 0,
        rHash: "asdf",
        paymentRequest: "pay_req",
        paymentAddr: "pay_addr"
      };
      const response = lndService.generateBolt11(dto);
      expect(response).resolves.toMatchObject(result);
    });
  });

  // /**
  //  * cancelBolt11()
  //  */
  describe(`LndService.cancelBolt11`, () => {
    it("should be defined", () => {
      expect(lndService.cancelBolt11).toBeDefined();
    });

    it("should throw an error if lnd call fails", () => {
      const result = { status: 400, data: "gabagool" };
      mocks.http.post = jest.fn().mockResolvedValue(result);
      const dto: CancelInvoiceDto = { payment_hash: Buffer.from("asdfasdfasdf", "ascii").toString("hex") };
      const response = lndService.cancelBolt11(dto, "tenantId");
      expect(response).resolves.toBeNull();
    });

    it("should return cancelled", () => {
      const result = { status: 200, data: "gabagool" };
      mocks.http.post = jest.fn().mockResolvedValue(result);
      const dto: CancelInvoiceDto = { payment_hash: Buffer.from("asdfasdfasdf", "ascii").toString("hex") };
      const response = lndService.cancelBolt11(dto, "tenantId");
      expect(response).resolves.toMatchObject({ cancelled: true });
    });
  });

  /**
   * readBolt11()
   */
  describe(`LndService.readInvoice`, () => {
    it("should be defined", () => {
      expect(lndService.readInvoice).toBeDefined();
    });

    it("should throw an error if lnd call fails", () => {
      const result = { status: 400, data: "gabagool" };
      mocks.http.get = jest.fn().mockRejectedValue(result);
      const response = lndService.readInvoice("", "");
      expect(response).resolves.toBeNull();
    });

    it("should return bolt 11 data", () => {
      const lndResult = {
        destination: "",
        payment_hash: "",
        num_satoshis: "",
        timestamp: "",
        expiry: "",
        description: "",
        description_hash: "",
        fallback_addr: "",
        cltv_expiry: "",
        route_hints: "",
        payment_addr: "",
        num_msat: "",
        features: ""
      };
      const expected = {
        destination: "",
        paymentHash: "",
        numSatoshis: "",
        timestamp: "",
        expiry: "",
        description: "",
        descriptionHash: "",
        fallbackAddr: "",
        cltvExpiry: "",
        routeHintsList: "",
        paymentAddr: "",
        numMsat: "",
        featuresMap: ""
      };
      const result = { status: 200, data: lndResult };
      mocks.http.get = jest.fn().mockResolvedValue(result);
      const response = lndService.readInvoice("", "");
      expect(response).resolves.toMatchObject(expected);
    });
  });

  describe(`LndService.trackBolt11`, () => {
    it("should return Invoice As Object", async () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      mocks.http.get = jest.fn().mockResolvedValue({
        invoice: {
          status: 200,
          data: {
            settleDate: "",
            settle_date: "settle_date"
          }
        }
      });
      const invoice: Invoice.AsObject = await lndService.trackBolt11(createMock<TrackInvoiceDto>(), "some-tenant-id");
      expect(invoice).toBeDefined();
    });

    it("should return Null when Null returned while getting lightning Nodes", async () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      mocks.http.get = jest.fn().mockResolvedValue({
        invoice: {
          status: 200,
          data: {
            settleDate: "",
            settle_date: "settle_date"
          }
        }
      });
      const invoice: Invoice.AsObject = await lndService.trackBolt11(createMock<TrackInvoiceDto>(), "some-tenant-id");
      expect(invoice).toBeNull();
    });

    it("should return Null when fatal error Http Service encountered.", async () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      mocks.http.get = async () => {
        throw new NotFoundException(`Invoice: some-invoice-id was not found.`);
      };
      const invoice: Invoice.AsObject = await lndService.trackBolt11(createMock<TrackInvoiceDto>(), "some-tenant-id");
      expect(invoice).toBeNull();
    });
  });

  describe("LndService.getLndVersion", () => {
    it("should return the lnd version", async () => {
      mocks.db.lightningNodes.findOne = jest.fn().mockResolvedValue(
        createMock<LightningNodeReference>({ tenantId: "tenant-id" })
      );
      mocks.http.get = jest.fn().mockResolvedValue({
        status: "success",
        data: {
          commit: "v0.15.4-beta",
          commit_hash: "96fe51e2e5c2ee0c97909499e0e96a3d3755757e",
          version: "0.15.4-beta",
          app_major: 0,
          app_minor: 15,
          app_patch: 4,
          app_pre_release: "beta",
          build_tags: ["autopilotrpc", "signrpc", "walletrpc", "chainrpc", "invoicesrpc", "watchtowerrpc", "neutrinorpc", "monitoring", "peersrpc", "kvdb_postgres", "kvdb_etcd"],
          go_version: "go1.18.2"
        }
      });
      const version = await lndService.lndVersion("tenant-id");
      expect(version.commit).toBe("v0.15.4-beta");
    });
  });
});
