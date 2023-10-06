# Network-specific Modules Directory

This directory contains modules with resources for specific Blockchain networks (i.e. Pocket, Lightning, etc).

The `NetworksModule` itself simply imports all of the network-specific modules, so that the `AppModule` can
just import "everything" through a single module, rather than import each network-specific module individually.
