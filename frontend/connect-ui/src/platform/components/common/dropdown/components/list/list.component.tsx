import { observer } from 'mobx-react-lite'
import React, { forwardRef } from 'react'
import { Item } from './item/item.component'

interface IList
{
  children:React.ReactNode
}
export const List = observer(forwardRef((props: IList, ref: React.ForwardedRef<HTMLUListElement>) =>
{
  return <ul className="select-custom-options" style={{height: 300, overflowY: "auto"}}>{[ props.children]}</ul>
}))


export default List