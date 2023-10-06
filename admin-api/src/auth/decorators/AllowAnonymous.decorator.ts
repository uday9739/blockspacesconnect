import { SetMetadata } from "@nestjs/common";

/** metadata key for the `@AllowAnonymous()` decorator */
export const ALLOW_ANONYMOUS_DECORATOR_KEY = "AllowAnonymous.decorator";

/**
 * Decorator for controller classes or methods that will allow routes to be accessed by unauthenticated users
 */
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_DECORATOR_KEY, true);