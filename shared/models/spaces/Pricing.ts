export type Pricing = { [currency:string]:{
    prefix?:string
    suffix?:string
    msetupfee:string
    qsetupfee:string
    ssetupfee:string
    asetupfee:string
    bsetupfee:string
    tsetupfee:string
    monthly:string
    quarterly:string
    semiannually:string
    annually:string
    biennially:string
    triennially:string
  }}