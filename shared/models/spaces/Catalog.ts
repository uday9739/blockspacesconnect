import {Pricing} from './Pricing'


  export type ConfigOption = {
    id:number
    optionTypeId:number
    name:string
    rawName:string
    pricing:Pricing
    recurring:boolean
    required:string
  }
  
  export type ConfigOptions = Record<string, Array<{
    id:number
    name:string
    type:string
    options:Record<"option", Array<ConfigOption>>
  }>>