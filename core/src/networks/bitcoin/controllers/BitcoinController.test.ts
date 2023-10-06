import { BitcoinConvertDto } from '@blockspaces/shared/dtos/networks/bitcoin/convert';
import { BitcoinPriceDto } from '@blockspaces/shared/dtos/networks/bitcoin/price';
import { PriceReference } from '@blockspaces/shared/models/lightning/Invoice';
import { Logger } from 'log4js';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { createMock } from 'ts-auto-mock';
import { BitcoinService } from '../services/BitcoinService';
import { BitcoinController } from './BitcoinController';
import { ConnectLogger } from '../../../logging/ConnectLogger';


describe(BitcoinController, () => {
  let bitcoinController: BitcoinController;
  let mockServices: {
    bitcoinService: BitcoinService,
    logger: ConnectLogger;
  };
  beforeAll(async () => {
    mockServices = {
      bitcoinService: createMock<BitcoinService>(),
      logger: createMock<ConnectLogger>({
        // info: jest.fn(),
        // debug: jest.fn(),
        // error: jest.fn(),
        // trace: jest.fn(),
        // log: jest.fn()
      })
    };
    bitcoinController = new BitcoinController(mockServices.bitcoinService, mockServices.logger);
  });

  describe(`getBtcPrice`, () => {
    it('should return the BTC Price with no passed in values. ', async () => {
      const result = await bitcoinController.getBtcPrice(createMock<BitcoinPriceDto>());
      expect(result).toBeDefined();
    });
    it('should return the BTC Price using the passed in values. ', async () => {
      mockServices.bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValue(createMock<PriceReference>({
        timestamp: 1658424252884,
        currency: `USD`,
        exchangeRate: 20000
      }));
      const result = await bitcoinController.getBtcPrice(createMock<BitcoinPriceDto>());
      expect(result).toBeDefined();
    });
    it('should return Bad Request Exception when Get Bitcoin Price returns NULL. ', async () => {
      mockServices.bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValue(null);
      try {
        await bitcoinController.getBtcPrice(createMock<BitcoinPriceDto>());
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  }); // END getBtcPrice

  describe(`convertInvoiceToBtc`, () => {
    it('should return a converted invoice to BTC. ', async () => {
      mockServices.bitcoinService.convertInvoiceToBtc = jest.fn().mockResolvedValue({
        exchangeRate: 20000,
        invoice: [
          { amount: 10000, currency: `USD` },
          { amount: parseFloat((10000 / parseFloat('20000')).toFixed(8)), currency: 'BTC' }
        ]
      });
      const result = await bitcoinController.convertInvoiceToBtc(createMock<BitcoinConvertDto>({
        amount: 20000,
        currency: `USD`
      }));
      expect(result).toBeDefined();
    });
    it('should return Bad Request Exception when Convert Invoice to BTC returns no Invoices from Mongo ', async () => {
      try {
        await bitcoinController.convertInvoiceToBtc(createMock<BitcoinConvertDto>());
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
    it('should return TypeError when Convert Invoice to BTC returns Null. ', async () => {
      mockServices.bitcoinService.convertInvoiceToBtc = jest.fn().mockResolvedValue(null);
      try {
        await bitcoinController.convertInvoiceToBtc(createMock<BitcoinConvertDto>());
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toBe('Cannot read properties of null (reading \'invoice\')');
      }
    });
  }); // END convertInvoiceToBtc

});
