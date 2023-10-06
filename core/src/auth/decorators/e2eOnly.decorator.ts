import { SetMetadata } from "@nestjs/common";

/** metadata key for the `@e2eOnly()` decorator */
export const E2E_ONLY_DECORATOR_KEY = "e2eOnly.decorator";

/**
 * Decorator for controller classes or methods that will allow restrict access to e2e only
 */
export const e2eOnly = () => SetMetadata(E2E_ONLY_DECORATOR_KEY, true);