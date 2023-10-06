import React, { CSSProperties } from 'react'
export type BlockSize = {
  /** optional. when set, width will be determining height. format ex: 16/9 or 4/3
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio} */
  aspectRatio?: string;
  /** width in rem -> ex: '20rem' */
  width?: string;
  height?: string;
}
export interface IBlock
{
  style?: any
  children?:React.ReactNode
}

export const Block = ({ children, style = {} }: IBlock)=>
{
  return <div style={ { ...style } }>{ children }</div>
}