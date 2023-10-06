import { Module } from "@nestjs/common";
import { BitcoinModule } from "../bitcoin/BitcoinModule";
import { LightningNodeModule } from "./node/LightningNodeModule";
import { LightningInvoicesModule } from "./invoices/LightningInvoicesModule";
import { LightningWalletModule } from "./wallet/LightningWalletModule";
import { LndModule } from "./lnd/LndModule";
import { LightningIntegrationsModule } from "./integrations/LightningIntegrationsModule";
import { LightningOnboardingModule  } from "./onboarding/LightningOnboardingModule";
import {SnsTransportModule} from "../../sns-transport/sns-transport.module";

@Module({
  imports: [
    BitcoinModule,
    LightningNodeModule,
    LightningInvoicesModule,
    LightningWalletModule,
    LndModule,
    LightningIntegrationsModule,
    LightningOnboardingModule,
    SnsTransportModule,
  ]
})
export class LightningModule {}
