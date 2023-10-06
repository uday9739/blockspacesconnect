import { SetMetadata } from "@nestjs/common";

/** metadata key for the `@AdminOnly()` decorator */
export const ADMIN_ONLY_DECORATOR_KEY = "AdminOnly.decorator";

/**
 * Decorator for controller classes or methods that will allow restrict access to admin only
 */
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_DECORATOR_KEY, true);