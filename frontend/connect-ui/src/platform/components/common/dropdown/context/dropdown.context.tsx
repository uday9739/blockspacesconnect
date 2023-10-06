
import React, { createContext } from "react"
import { ISelectItemStore } from "../components/list/item/item.component"
import { IDropdown } from "../dropdown.base"
import
{
  reaction,
  makeAutoObservable,
  action,
  runInAction,
  makeObservable,
  isObservableProp,
  observable,
  computed
} from "mobx";

export class SelectStore
{
  items: ISelectItemStore[]
  hoveredItem: ISelectItemStore | null
  id: string | number
  icon?: React.ReactNode
  header?: React.ReactNode
  isOpen: boolean
  refSelectCustom: React.RefObject<HTMLDivElement>
  countItems: number
  _selectedId = ''
  _selectedItem: ISelectItemStore
  placeholder: string
  isReady: boolean
  constructor(data: IDropdown)
  {

    makeObservable(this, {
      items: observable,
      _selectedId: observable,
      selectedId: computed,
      _selectedItem: observable,
      selectedItem: computed,
      header: observable,
      isOpen: observable,
      hoveredItem: observable,
      icon: observable,
      id: observable,
      countItems: observable,
      supportKeyboardNavigation: action,
      setSelectedId: action,
      placeholder: observable,
      getItemById: action,
      getItemByOrderId: action,
      setIsHovered: action,
      setIsHoveredNext: action,
      setIsHoveredPrev: action,
      isReady: observable
    })

    runInAction(() =>
    {
      this.items = data.items.map((item, index) => ({ selected: false, isHovered: false, orderId: index + 1, ...item }))
      this.header = data.header
      this.icon = data.icon
      this.id = data.id
      this.isOpen = false
      this.hoveredItem = null
      this.countItems = this.items.length
      this.placeholder = data.placeholder
      this.isReady = false
    })
    console.log('initializing', data, this)
  }

  setSelectedId = (id) =>
  {
    this.selectedId = id;
  }

  set selectedId(val)
  {
    console.log('setter', val);
    this._selectedId = val
  }
  get selectedId()
  {
    console.log('getter', this._selectedId);
    return this._selectedId
  }
  get selectedItem(): ISelectItemStore
  {
    return this._selectedItem
  }
  set selectedItem(val: ISelectItemStore)
  {
    this._selectedItem = val
  }

  supportKeyboardNavigation = (e) =>
  {
    switch (e.keyCode)
    {
      case 40://down key - either back to one or next
        e.preventDefault();
        this.setIsHoveredNext()
        break;
      case 38://up key - either back to last or previos
        e.preventDefault();
        this.setIsHoveredPrev()
        break;
      case 13://space or enter, select option
      case 32:
        e.preventDefault();
        this.selectedId = this.hoveredItem.id
        action(() => this.isOpen = false)
        break;
      case 27://escape key - closing
        action(() => this.isOpen = false)
        break;
      default:
        break;
    }

  }
  getItemById = (id) =>
  {
    return this.items.find((item) => item.id === id)
  }
  getItemByOrderId = (orderId) =>
  {
    return this.items.find((item) => item.orderId === orderId)
  }
  setIsHovered = (item) =>
  {
    action(() =>
    {
      if (this.hoveredItem)
      {
        this.hoveredItem.isHovered = false
      }
      item.isHovered = true
      this.hoveredItem = item
    })
  }
  setIsHoveredNext = () =>
  {
    action(() =>
    {
      if (!this.hoveredItem || this.hoveredItem.orderId === this.countItems)
      {
        const itemToHover = this.getItemByOrderId(1)
        this.setIsHovered(itemToHover)
      } else
      {
        const orderToHover = this.hoveredItem.orderId + 1
        const itemToHover = this.getItemByOrderId(orderToHover)
      }
    })
  }
  setIsHoveredPrev = () =>
  {
    action(() =>
    {
      if (!this.hoveredItem || this.hoveredItem.orderId === 1)
      {
        const itemToHover = this.getItemByOrderId(this.countItems)
        this.setIsHovered(itemToHover)
      } else
      {
        const orderToHover = this.hoveredItem.orderId - 1
        const itemToHover = this.getItemByOrderId(orderToHover)
      }
    })
  }
  openCloseReaction = reaction(() => this.isOpen, isOpen =>
  {
    if (!isOpen)
    {
      this.hoveredItem = null
    }
  })
  selectedIdReaction = reaction(() => this.selectedId, selectedId =>
  {
    if (this.selectedItem?.selected)
    {
      this.selectedItem.selected = false
    }

    this.selectedItem = this.getItemById(selectedId)
    this.selectedItem.selected=true
    this.isOpen = false
  })
  setNativeSelect= (ref)=>
  {
    console.log(ref, ref.value)
    this.setSelectedId(ref.value)
  }



}

export const SelectContext = createContext<SelectStore>(null)