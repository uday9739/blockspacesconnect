import {ConfigOptions} from './Catalog'
import {Pricing} from './Pricing'

// This is based off the UI model created for Products, just need to test it as a shared library

export interface IInfoProduct {
  description:string
}

export class NodeInfoProduct implements IInfoProduct {
  description: string
}

export interface IProduct {
  pid:number
  gid:number
  type:string
  name:string
  description:string
  stockcontrol?:'true' | 'false'
  stocklevel?:number
  module:string
  paytype:string
  pricing: Pricing
  customfields: Record<string, Array<any>>
  configoptions: ConfigOptions,
}
  
export class Product implements IProduct {
  pid:number
  gid:number
  type:string
  name:string
  description:string
  stockcontrol?:'true' | 'false'
  stocklevel?:number
  module:string
  paytype:string
  pricing: Pricing
  customfields: Record<string, Array<any>>
  configoptions: ConfigOptions

  constructor( product:IProduct ) {
    Object.assign(this, product);
  }

  get asJson() {
    return {
      pid: this.pid,
      gid: this.gid,
      type: this.type,
      name: this.name,
      description: this.description,
      stockcontrol: this.stockcontrol,
      stocklevel: this.stocklevel,
      module: this.module,
      paytype: this.paytype,
      pricing: this.pricing,
      customfields: this.customfields,
      configoptions: this.configoptions
    }
  }
}
