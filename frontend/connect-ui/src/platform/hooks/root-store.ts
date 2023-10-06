import {  ErrorsStore } from "@errors";
import { errorsFactory } from "@errors";

export class RootStore
{
  errorsStore: ErrorsStore;
  errorsFactory: ReturnType<typeof errorsFactory>;
  constructor()
  {
    this.errorsStore = new ErrorsStore(this);
    this.errorsFactory = errorsFactory(this);
  }
}