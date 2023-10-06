import { BadRequestException, Controller, Query } from '@nestjs/common';
import { BitcoinService } from '../services/BitcoinService';
import { Get, Inject } from '@nestjs/common';
import ApiResult from '@blockspaces/shared/models/ApiResult';
import { BitcoinConvertDto, BitcoinConvertResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/convert";
import { BitcoinPriceDto, BitcoinPriceResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/price";
import { DateTime } from 'luxon';
import { AllowAnonymous } from '../../../auth';
import { ValidRoute } from '../../../validation';
import { DEFAULT_LOGGER_TOKEN } from '../../../logging/constants';
import { ConnectLogger } from '../../../logging/ConnectLogger';


@ValidRoute()
@Controller("/networks/bitcoin")
export class BitcoinController {
  constructor(private readonly bitcoinService: BitcoinService, @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) { 
    logger.setModule(this.constructor.name);}

  /**
   * Return the price of bitcoin in the specified currency
   * @param currency The currency to return the price in
   * @returns ApiResult - The price of bitcoin in the specified currency
   */
  @AllowAnonymous()
  @Get("price")
  async getBtcPrice(@Query() dto: BitcoinPriceDto): Promise<ApiResult<BitcoinPriceResultDto>> {
    const timestamp = dto.date ? DateTime.fromISO(dto.date).toMillis() : DateTime.now().toMillis();
    const result = await this.bitcoinService.getBitcoinPrice(timestamp, dto.currency);
    if (result) {
      return ApiResult.success({
        base: result.timestamp.toString(),
        currency: result.currency,
        exchangeRate: result.exchangeRate.toString(),
      });
    } else {
      throw new BadRequestException(result);
    }
  }

  /**
   * converts the specified amount to bitcoin
   * @param currency The currency to convert from (default USD)
   * @returns ApiResult The price of bitcoin in the specified currency
   */
  @Get("convert")
  async convertInvoiceToBtc(@Query() dto: BitcoinConvertDto): Promise<ApiResult<BitcoinConvertResultDto>> {
    let result;
    if (dto.currency === 'sats') {
      result = await this.bitcoinService.convertBtcToFiat(dto.amount, DateTime.now().toMillis(), 'USD'); // TODO, make the desired currency configurable
    } else {
      result = await this.bitcoinService.convertInvoiceToBtc(dto.amount, DateTime.now().toMillis(), dto?.currency);
    }
    if (result.invoice) {
      return ApiResult.success(result);
    } else {
      throw new BadRequestException(result);
    }
  }

}
