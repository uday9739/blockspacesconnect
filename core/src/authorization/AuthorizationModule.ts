import {Module} from '@nestjs/common';
import {AccessControlGuard} from "./guards/AccessControlGuard";
import {Enforcer} from "casbin";
import {EnforcerFactory} from "./services/EnforcerFactory";
import { PolicyService } from './services/PolicyService';


@Module({
  providers: [
    AccessControlGuard,
    PolicyService,
    {
      provide: Enforcer,
      useFactory: async () => {
        return await EnforcerFactory();
      },
    },
  ],
  exports: [AccessControlGuard, Enforcer, PolicyService],
})
export class AuthorizationModule {}
