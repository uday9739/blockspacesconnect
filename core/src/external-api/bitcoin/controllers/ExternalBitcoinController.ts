import { Controller, Get, UseGuards, UsePipes, Query } from '@nestjs/common';
import { AllowAnonymous } from '../../../auth';
import { AuthGuard } from '@nestjs/passport';
import { ApiBadRequestResponse, ApiOkResponse, ApiSecurity, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { BadRequestException, CustomValidationPipe } from '../../../exceptions/common';
import { BitcoinService } from '../../../networks/bitcoin/services/BitcoinService';
import { BitcoinPriceDto } from "@blockspaces/shared/dtos/networks/bitcoin/price";
import ApiResult  from '@blockspaces/shared/models/ApiResult';
import { PriceReference } from '@blockspaces/shared/models/lightning/Invoice';
import { BitcoinConvertExternalDto, BitcoinConvertResponse, clean, PriceResponse } from '../externalBitcoinTypes';

/**
 * Bitcoin-related Utils 
 *
 * @class ExternalBitcoinController
 * @typedef {ExternalBitcoinController}
 */
@AllowAnonymous()
@UseGuards(AuthGuard('api-key'))
@UsePipes(new CustomValidationPipe({ transform: true, whitelist: true, transformOptions: {enableImplicitConversion: true}}))
@ApiBadRequestResponse({description: "Request Failed"})
@ApiUnprocessableEntityResponse({description: "Validation Failed"})
@ApiSecurity('ApiKey')
@ApiTags('Utils')
@Controller()
export class ExternalBitcoinController {
  constructor(
    private readonly bitcoinService: BitcoinService,
  ) {}

  /**
   * Description placeholder
   *
   * @returns {PriceResponse}
   */
  @ApiOkResponse({description: "Price found", type: PriceResponse})
  @Get("price")
  async getPrice(@Query() dto: BitcoinPriceDto): Promise<PriceResponse>{
    const timestamp = dto.date ? Date.parse(dto.date) : Date.now();
    const result: PriceReference = await this.bitcoinService.getBitcoinPrice(timestamp, dto.currency);
    if (!result) {
      throw new BadRequestException("Get BTC Price Failed");
    }
    // @ts-ignore
    return ApiResult.success(clean(result));
  }

  /**
   * Description placeholder
   *
   * @param {BitcoinConvertDto} dto
   * @returns {Promise<ApiResult<BitcoinConvertResponse>>}
   */
  @ApiOkResponse({description: "Conversion Successful", type: BitcoinConvertResponse})
  @Get("convert")
  async convertInvoiceToBtc(@Query() dto: BitcoinConvertExternalDto): Promise<BitcoinConvertResponse> {
    const millis = dto.date ? Date.parse(dto.date) : Date.now();
    const result = await this.bitcoinService.convertInvoice(dto.amount, dto.baseCurrency.toLowerCase(), dto.targetCurrency.toLowerCase(), millis); // TODO, make the desired currency configurable
    result.date = dto.date ?? new Date().toISOString();
    if (result?.invoice) {
      return ApiResult.success(result) as BitcoinConvertResponse;
    } else {
      throw new BadRequestException(result);
    }
  }


}