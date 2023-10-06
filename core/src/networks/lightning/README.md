# Core/Networks/Lightning Development Notes

Errors/Logging:
1. Errors should be trapped and may be logged ONLY in the service, not the controller (or visa versa… just not both) .  
2. If a service returns null, the controller should assume failure. (Controller returnsErrorStatus without logging: `useErrorStatus(STATUS, ApiResult.failure(...), {log: false})`) .  
3. If a service returns an object, the controller should assume success. (Controller returns ApiResult.success) .  