# BlockSpaces Platform

BlockSpaces Platform - The base platform for the BlockSpaces System

Project Stack:

***make sure node version is 14.16.1***

1. Node - TypeScript
2. GRPC client to contact with BlockSpaces Backend
3. MongoDB
4. Casbin
5. IBM App ID
6. HashiCorp Vault

Directory Structure:

1. dist - distribution directory with final js output
2. node_modules - modules
3. protos - protocol buffer specifications for use in building the BlockSpace grpc service
4. scripts - a place for shell scripts
5. src - source files in typescript
6. test - test files for use with jest

Shared Library:
Models are used in CORE from a shared library that the UI will also use. The shared library contains all the shared logic that will be used. Model Validation Logic will be outlined within the shared Interface properties CORE will access the main interface (example: IConnector) and any complex properties the main Interface will contain. these complex types need to bind to the Mongoose Schema models that are created. This insures data integrity. If Request calls do not bind correctly to the Reqest models then they should be kicked back. The Response data will be bound in the UI. Testing should be performed where Selected data should bind to Main Interfaces to mock the UI bind.

*ISSUES*:

1. The shared library will not build if CORE has Strict set to true. this is not the case with Backend and shared library. the assumption is there is a missed configuration that ignores the syntax issues in shared but allows CORE to use Strict.
2. Access to shared library is tricky because each developer needs to have the same Repo Structure for it to work. The '../../' has to connect to the root of the repo. this has to be set in two places tsconfig and package.json. If the developer has a repo name structure different than Bitbucket they should adjust and check in
