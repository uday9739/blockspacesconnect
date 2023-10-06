import React from 'react'
export type StackOrientation = 'horizontal' | 'vertical'
export interface IStack
{
  orientation?: StackOrientation
  children?: React.ReactNode
  style?: any
}
export const Stack = ({orientation, children, style}: IStack) =>
{
  return <div className='stack' style={ { ...style }}>{ children }</div>
}