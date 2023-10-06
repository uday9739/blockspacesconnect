import React, { useCallback, useContext } from 'react'
import classnames from 'classnames'
import { observer } from 'mobx-react-lite'
import { IDropdownItem } from '../../../dropdown.base'
import { action } from 'mobx'
import { SelectContext } from '../../../context/dropdown.context'


export interface ISelectItemStore extends IDropdownItem
{
  value?: string
  selected?: boolean
  isHovered: boolean
  orderId: number
}



export const Item = observer(({ id, orderId, content, selected, type, isHovered }: ISelectItemStore) =>
{

  const { setIsHovered, getItemById, setSelectedId } = useContext(SelectContext);

  const setHovered = () =>
  {
    action(() => { const item = getItemById(id); setIsHovered(item); })
  }

  const handleOnMouseEnter = useCallback(
    () =>
    {
      setHovered()
    },
    [ setHovered ],
  )

  switch (type) {
    case 'native':
      return <option value={ id } disabled={ false } onClick={ action(() => setSelectedId(id)) }>{content}</option>

    default:
      return <div className={ classnames("select-custom-option", { 'option-selected': selected }) } id={ id } onMouseEnter={ handleOnMouseEnter } onClick={ action(() => setSelectedId(id)) }>{ content}</div>
  }

})