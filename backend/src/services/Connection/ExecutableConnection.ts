import { Connection } from "@blockspaces/shared/models/flows/Connection";

type ConnectionConstructor = new (...args: any[]) => Connection;

/** Mixin for ObservableConnection base class */
export function ExecutableConnection<TBase extends ConnectionConstructor>(Base: TBase) {
  return class ExecutableConnection extends Base {

  }
}