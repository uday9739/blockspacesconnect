import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";

export const isExternalNode = (node: LightningNodeReference) => node?.external === true