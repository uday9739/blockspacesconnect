import { IUser } from "@blockspaces/shared/models/users";
import { Controller, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Query, UseGuards } from "@nestjs/common";
import { User } from '../../users';
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { ConnectSubscriptionInvoiceLineItemDto, PagedSubscriptionInvoiceResults, SubscriptionInvoiceDto } from "@blockspaces/shared/dtos/connect-subscription/SubscriptionInvoiceDto";
import { ConnectSubscriptionInvoice, ConnectSubscriptionInvoiceStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { AdminOnly } from "../../auth/decorators/AdminOnly.decorator";
import { StripeService } from "../../stripe/services/StripeService";
import { TenantResourceGuard } from "../../authorization/guards/TenantResourceGuard";


@Controller('invoices')
export class InvoicesController {

  constructor(private readonly dataContext: ConnectDbDataContext,
    private readonly stripeService: StripeService
  ) {
  }

  @Get('')
  @UseGuards(TenantResourceGuard)
  async getInvoicesForTenant(@User() user: IUser, @Query("page") page: number, @Query("take") take: number, @Query("sortByField") sortByField: number, @Query("sortByFieldDirection") sortByFieldDirection: number)
    : Promise<ApiResult<PagedSubscriptionInvoiceResults>> {

    const data = await this.dataContext.connectSubscriptionInvoices.find({ tenantId: user.activeTenant?.tenantId }, {}, {
      sort: { [sortByField]: sortByFieldDirection },
      skip: (page) * take, limit: take
    });
    const count = await this.dataContext.connectSubscriptionInvoices.find({ tenantId: user.activeTenant?.tenantId }).count();
    const results: SubscriptionInvoiceDto[] = data?.map((x: ConnectSubscriptionInvoice) => ({
      id: x._id,
      number: x.number,
      userId: x.userId,
      status: x.status,
      amount: x.amount,
      totalDiscountAmount: x.totalDiscountAmount,
      period: {
        billingStart: x.period.billingStart,
        billingEnd: x.period.billingEnd,
        meteredUsageStart: x.period.meteredUsageStart,
        meteredUsageEnd: x.period.meteredUsageEnd,
      },
      lines: x.lines?.map(i => ({
        connectSubscriptionItemId: i.connectSubscriptionItemId,
        networkId: i.networkId,
        title: i.title,
        description: i.description,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        unitAmount: i.unitAmount,
        proration: i.proration,
        prorationDate: i.prorationDate
      })) as ConnectSubscriptionInvoiceLineItemDto[]
    }));



    return ApiResult.success(new PagedSubscriptionInvoiceResults(results, count, page, take));
  }

  @Get(':id')
  @UseGuards(TenantResourceGuard)
  async getInvoiceById(@Param("id") id: string): Promise<ApiResult<SubscriptionInvoiceDto>> {
    const invoice = await (await this.dataContext.connectSubscriptionInvoices.findById(id)).populate("connectSubscription");
    if (invoice == null) throw new NotFoundException("Invoice not found");

    const result = {
      id: invoice._id,
      number: invoice.number,
      userId: invoice.userId,
      status: invoice.status,
      amount: invoice.amount,
      billingAddress: invoice.connectSubscription?.billingInfo,
      totalDiscountAmount: invoice.totalDiscountAmount,
      period: {
        billingStart: invoice.period.billingStart,
        billingEnd: invoice.period.billingEnd,
        meteredUsageStart: invoice.period.meteredUsageStart,
        meteredUsageEnd: invoice.period.meteredUsageEnd,
      },
      lines: invoice.lines?.map(i => ({
        connectSubscriptionItemId: i.connectSubscriptionItemId,
        networkId: i.networkId,
        title: i.title,
        description: i.description,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        unitAmount: i.unitAmount,
        proration: i.proration,
        prorationDate: i.prorationDate
      })) as ConnectSubscriptionInvoiceLineItemDto[]
    };

    return ApiResult.success(result);
  }

  /**
   * TODO: Remove after release to production, one time use to set invoice numbers
   */
  @AdminOnly()
  @Post('set-numbers')
  async setInvoiceNumbers() {
    const invoices = await this.dataContext.connectSubscriptionInvoices.find({ number: { $exists: false } });
    for await (const invoice of invoices) {
      const stripeInvoice = await this.stripeService.getInvoiceById(invoice.stripeInvoiceId);
      if (stripeInvoice.isSuccess) {
        invoice.number = stripeInvoice.data?.number;
        await this.dataContext.connectSubscriptionInvoices.updateByIdAndSave(invoice._id, invoice);
      }
    }
    return ApiResult.success(true);
  }
}
