import { Item } from './components/list/item/item.component'
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles/dropdown.module.scss'
import { SelectContext, SelectStore } from './context/dropdown.context'
import { observer } from 'mobx-react-lite'
import { List } from './components/list/list.component'
import classnames from 'classnames'
import { action } from 'mobx'
import { useOutsideClick } from '@platform/hooks'

import { Button, Stack } from '@platform/common'
export interface IDropdown
{
  id: number | string
  icon?: React.ReactNode
  items: IDropdownItem[]
  header: React.ReactNode
  placeholder?: string
  label: string
  onSubmit: any
}
export interface IDropdownItem
{
  type?: 'native' | 'custom'
  id: string
  content: React.ReactNode
}


export const Dropdown = observer(({ id, icon, items, header, placeholder, label, onSubmit }: IDropdown) =>
{

  const [ store, setStore ] = useState(new SelectStore({ id, icon, items, header, placeholder, label, onSubmit }))

  const refSelectNative = useRef(null)
  const refSelectCustom = useRef(null)
  const refMain = useRef(null)

  useOutsideClick(action(() => { if (store.isOpen) { store.isOpen = false } }), refSelectCustom)


  useEffect(() =>
  {
    store.refSelectCustom = refSelectCustom
    action(() => store.isReady = true)
    document.addEventListener("keydown", store.supportKeyboardNavigation);
    return () =>
    {
      document.removeEventListener("keydown", store.supportKeyboardNavigation);
    }
  }, [])

  return (
    <>
      <Stack style={ {
        height: '30rem',
        display: 'grid',
        grid: '1fr 1fr / 1fr',
        alignItems: 'center',
        justifyContent: 'center',
        justifyItems: 'center'
      } }>  <SelectContext.Provider value={ store }>
          <div ref={ refMain } className={ classnames(styles.container, { 'ready': store.isReady }) }>
            <span className="select-label" id="select-label">{ store.header }</span>
            <div className="select-wrapper">
              <select value={ store.selectedId } ref={ refSelectNative } onChange={ action((e) => { store.setNativeSelect(refSelectNative.current); console.log('changing id', refSelectNative.current.value, store.selectedId) }) } className="select-native js-select-native" aria-labelledby="select-label">
                <option value="sel" disabled={ false }>{ store.header }</option>
                <>{ store.items.map((_item) => <Item orderId={ _item.orderId } key={ _item.id } id={ _item.id } value={ _item.id } content={ _item.content } isHovered={ _item.isHovered } type='native' />) }</>
              </select>
              <div className={ classnames("select-custom js-select-custom", { 'is-active': store.isOpen }) } aria-hidden={ !store.isOpen }>
                <>{ store.icon }</>
                <div className="select-custom-trigger" onClick={ action(() => store.isOpen = !store.isOpen) } >{ store?.selectedItem?.content || store.placeholder }</div>
                <List>
                  <>{ store.items.map((_item) => <Item key={ _item.id } orderId={ _item.orderId } id={ _item.id } content={ _item.content } isHovered={ _item.isHovered } type='custom' />) }</>
                </List>
              </div>
            </div>
          </div>
        </SelectContext.Provider>
        <Button variation='simple' label={label} onClick={() => onSubmit(store._selectedId)}></Button></Stack>
    </>)
})
