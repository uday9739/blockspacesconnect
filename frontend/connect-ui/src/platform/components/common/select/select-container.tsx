import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useSelectStore } from './select-provider';
import { DropDown } from './drop-down';
import { SelectStage } from './select-stage';

export const SelectContainer = observer(() => {
  const ref = useRef(null);
  const store = useSelectStore();
  const { MenuWrap, MenuContainer, MenuLabel } = store.styles;

  // handling outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) store.setShowDropDown(false);
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  return (
    <MenuWrap ref={ref as React.RefObject<HTMLDivElement>} size={store.size}>
      <MenuContainer 
        tabIndex={0} 
        data-alignment={store.alignment} 
        className="container-menu" 
        onFocus={() => {
          store.setShowDropDown(true);
        }}
        onBlur={(() => {
          store.setShowDropDown(false);
        })}
      >
        { store.showDropDown
          ? <DropDown />
          : <SelectStage /> }
      </MenuContainer>
      <MenuLabel data-alignment={store.alignment} className="label-input">{store.label}</MenuLabel>
    </MenuWrap>
  );
});
