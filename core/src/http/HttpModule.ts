import { DynamicModule, Module, ModuleMetadata, Provider, Type } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import {  AxiosHttpService } from "@blockspaces/shared/services/http/AxiosHttpService";
import { HttpRequestConfig, HttpService } from "@blockspaces/shared/services/http";

/**
 * Module providing functionality to wrap the Axios HTTP client library,
 * allowing for simplified importing and dependency injection.
 *
 * This module can be used in a similar way to the [NestJS HttpModule](https://docs.nestjs.com/techniques/http-module).
 * Unlike the NestJS HttpModule, which uses RxJS observables, this module exposes the Axios API directly,
 * which utilizes standard promises
 *
 * In addition to all standard Axios configuration properties,
 * the configuration used when importing the module also supports the following:options:
 * - all options from the [axios-retry](https://github.com/softonic/axios-retry#options) package
 * - `enableBetterStackTrace` (defaults to true), which will enable use of the [axios-better-stacktrace](https://github.com/svsool/axios-better-stacktrace) package
 *
 * @see https://docs.nestjs.com/techniques/http-module
 * @see https://github.com/benhason1/nestjs-http-promise (basis for much of the module source)
 */
@Module({
  providers: [
    { provide: HttpService, useValue: new AxiosHttpService(createAxiosInstance()) },
  ],
  exports: [HttpService]
})
export class HttpModule {

  /**
   * Create a new instance of the {@link HttpModule} that can utilize its own
   * configuration, overriding Axios defaults, and will have its own Axios client instance
   */
  static register(config: HttpModuleOptions): DynamicModule {
    return {
      module: HttpModule,
      providers: [
        { provide: HttpService, useValue: new AxiosHttpService(createAxiosInstance(config)) },
      ]
    };
  }

  static registerAsync(options: HttpModuleAsyncOptions): DynamicModule {
    return {
      module: HttpModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: HttpService,
          useFactory: (config: HttpModuleOptions) => new AxiosHttpService(createAxiosInstance(config)),
          inject: [HTTP_MODULE_OPTIONS],
        },
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(
    options: HttpModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const providers = [
      this.createAsyncOptionsProvider(options)
    ];

    if (options.useClass)
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });

    return providers;
  }

  private static createAsyncOptionsProvider(
    options: HttpModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: HTTP_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: HTTP_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HttpModuleOptionsFactory) =>
        optionsFactory.createHttpOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}

/**
 * Configuration options for {@link HttpModule} which combine
 * standard Axios config options ({@link AxiosRequestConfig}), axios-retry
 * config options ({@link IAxiosRetryConfig}), and options to control the
 * usage of `axios-better-stacktrace`
 */
export type HttpModuleOptions =
  HttpRequestConfig & IAxiosRetryConfig & {
    enableBetterStackTrace?: boolean
  };

export interface HttpModuleOptionsFactory {
  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions;
}

export interface HttpModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<HttpModuleOptionsFactory>;
  useClass?: Type<HttpModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<HttpModuleOptions> | HttpModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}

/** Create a new Axios instance */
function createAxiosInstance(config?: HttpModuleOptions): AxiosInstance {
  const axiosInstance = axios.create(config);
  axiosRetry(axiosInstance, config);

  // if (config?.enableBetterStackTrace ?? true) {
  //   axiosBetterStacktrace(axiosInstance);
  // }

  return axiosInstance;
}

/** injection token for HttpModule options (for use with HttpModule.registerAsync) */
const HTTP_MODULE_OPTIONS = 'HTTP_MODULE_OPTIONS';