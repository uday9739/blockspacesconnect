import { makeAutoObservable } from 'mobx';
import { SelectStyles } from '../styles';
import { SelectStylesType } from '../types/styles/select-styles-type';

export type IOption = { label: string, value: string, image?: string }
export interface SelectProps {
  label: string,
  options: IOption[],
  selection: IOption | IOption[]
  onSelect: (option: IOption | IOption[]) => void,
  variation?: 'default' | 'grid',
  styles?: any,
  size?: 'sm' | 'md' | 'lg',
  register?: any,
  name?: string,
  ref?: any
  alignment?: string
}

export class SelectStore implements SelectProps {
  variation: 'default' | 'grid' = 'default';

  options: IOption[] = [];

  label = '';

  showDropDown = false;

  onSelect: (option: IOption | IOption[]) => void;

  selection: IOption | IOption[];

  styles: SelectStylesType;

  size: 'sm' | 'md' | 'lg';

  multiSelect: boolean;

  alignment?: 'left' | 'center';

  constructor({
    variation, selection, label, options, onSelect, size, styles,
  }: SelectProps) {
    this.variation = variation || 'default';
    this.label = label;
    this.options = options;
    this.onSelect = onSelect;
    this.size = size || 'lg';
    this.showDropDown = false;
    this.selection = selection;
    this.multiSelect = Array.isArray(this.selection);
    this.alignment = this.alignment;

    // if custom style passed to component, overwrite existing style.. otherwise use the stylesheet of the variation
    this.styles = (styles ? { ...SelectStyles[this.variation], ...styles } : SelectStyles[this.variation]);

    makeAutoObservable(this);
  }

  setShowDropDown = (showDropDown: boolean): void => {
    this.showDropDown = showDropDown;
  };

  toggleDropDown = (): void => {
    this.showDropDown = !this.showDropDown;
  };

  get selections() {
    return this.multiSelect
      ? (this.selection as IOption[]) : null;
  }

  handleSelection = (option): void => {
    this.multiSelect
      ? this.selections.push(option)
      : this.selection = option;
    this.onSelect(this.selection);
    this.setShowDropDown(false);
  };

  removeFromSelectedOptions = (option): void => {
    this.selection = this.selections.filter((selectedOption) => selectedOption !== option);
    this.onSelect(this.selection);
  };
}
